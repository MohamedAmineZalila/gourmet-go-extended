package com.gourmet.orchestrator;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.Executors;

public class OrchestratorServer {

    private static SagaOrchestrator orchestrator;

    public static void main(String[] args) throws Exception {
        orchestrator = SagaOrchestrator.fromEnv();

        int httpPort = Integer.parseInt(System.getenv().getOrDefault("HTTP_PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(httpPort), 0);

        server.createContext("/api/orders", OrchestratorServer::handleOrders);
        server.createContext("/health",     OrchestratorServer::handleHealth);

        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();
        System.out.println("[Orchestrator] HTTP API listening on port " + httpPort);
    }

    /**
     * Routes:
     *   POST /api/orders               -> place new order (Saga)
     *   GET  /api/orders               -> list all orders
     *   GET  /api/orders/{id}          -> get single order status
     *   POST /api/orders/{id}/cancel   -> cancel an order
     */
    private static void handleOrders(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { respond(ex, 204, ""); return; }

        String path   = ex.getRequestURI().getPath(); // e.g. /api/orders or /api/orders/abc or /api/orders/abc/cancel
        String method = ex.getRequestMethod();

        // Strip trailing slash
        if (path.endsWith("/") && path.length() > 1) path = path.substring(0, path.length() - 1);

        String[] parts = path.split("/"); // ["", "api", "orders", optional-id, optional-action]

        boolean hasId     = parts.length >= 4 && !parts[3].isBlank();
        boolean hasAction = parts.length >= 5;
        String  orderId   = hasId ? parts[3] : null;
        String  action    = hasAction ? parts[4] : null;

        // POST /api/orders — place new order
        if ("POST".equals(method) && !hasId) {
            String body     = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            String id       = parseJson(body, "orderId");
            String amountStr= parseJson(body, "amount");
            if (id == null || id.isBlank()) id = "order-" + UUID.randomUUID().toString().substring(0, 8);
            double amount = 50.0;
            try { amount = Double.parseDouble(amountStr); } catch (Exception ignored) {}
            String result = orchestrator.executeOrder(id, amount);
            respond(ex, 200, "{\"orderId\":\"" + id + "\",\"status\":\"" + result + "\"}");

        // GET /api/orders — list all orders
        } else if ("GET".equals(method) && !hasId) {
            String json = orchestrator.listOrders();
            respond(ex, 200, json);

        // GET /api/orders/{id} — single order status
        } else if ("GET".equals(method) && hasId && !hasAction) {
            String status = orchestrator.getOrderStatus(orderId);
            respond(ex, 200, "{\"orderId\":\"" + orderId + "\",\"status\":\"" + status + "\"}");

        // POST /api/orders/{id}/cancel — cancel
        } else if ("POST".equals(method) && hasId && "cancel".equals(action)) {
            String result = orchestrator.cancelOrder(orderId);
            int code = result.startsWith("ERROR") ? 400 : 200;
            respond(ex, code, "{\"orderId\":\"" + orderId + "\",\"status\":\"" + result + "\"}");

        } else {
            respond(ex, 405, "{\"error\":\"Method Not Allowed\"}");
        }
    }

    private static void handleHealth(HttpExchange ex) throws IOException {
        addCors(ex);
        respond(ex, 200, "{\"status\":\"UP\"}");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static void respond(HttpExchange ex, int code, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
    }

    private static void addCors(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin",  "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static String parseJson(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return null;
        int colon = json.indexOf(':', idx + search.length());
        if (colon < 0) return null;
        int start = colon + 1;
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) start++;
        int end = start;
        while (end < json.length() && json.charAt(end) != '"' && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
        return json.substring(start, end).trim();
    }
}
