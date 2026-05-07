package com.gourmet.orchestrator;

import com.gourmet.accounting.AccountingServiceGrpc;
import com.gourmet.accounting.AuthorizeRequest;
import com.gourmet.accounting.AuthorizeResponse;
import com.gourmet.kitchen.CreateTicketRequest;
import com.gourmet.kitchen.CreateTicketResponse;
import com.gourmet.kitchen.KitchenServiceGrpc;
import com.gourmet.kitchen.RejectTicketRequest;
import com.gourmet.order.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.util.List;

public class SagaOrchestrator {

    private final OrderServiceGrpc.OrderServiceBlockingStub     orderStub;
    private final KitchenServiceGrpc.KitchenServiceBlockingStub kitchenStub;
    private final AccountingServiceGrpc.AccountingServiceBlockingStub accountStub;

    public SagaOrchestrator(ManagedChannel orderCh, ManagedChannel kitchenCh, ManagedChannel accountCh) {
        this.orderStub   = OrderServiceGrpc.newBlockingStub(orderCh);
        this.kitchenStub = KitchenServiceGrpc.newBlockingStub(kitchenCh);
        this.accountStub = AccountingServiceGrpc.newBlockingStub(accountCh);
    }

    // ── Place order (Saga) ───────────────────────────────────────────────────

    public String executeOrder(String orderId, double amount) {
        System.out.println("[Orchestrator] Starting Saga for order=" + orderId + " amount=$" + amount);
        try {
            orderStub.createOrder(CreateOrderRequest.newBuilder()
                    .setOrderId(orderId).setAmount(amount).build());

            orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                    .setOrderId(orderId).setStatus(OrderStatus.APPROVAL_PENDING).build());
            System.out.println("[Orchestrator] Order " + orderId + " -> APPROVAL_PENDING");

            CreateTicketResponse ticketResp = kitchenStub.createTicket(
                    CreateTicketRequest.newBuilder().setOrderId(orderId).build());
            String ticketId = ticketResp.getTicketId();
            System.out.println("[Orchestrator] Kitchen ticket created: " + ticketId);

            AuthorizeResponse authResp = accountStub.authorizeCard(
                    AuthorizeRequest.newBuilder().setOrderId(orderId).setAmount(amount).build());

            if (authResp.getAuthorized()) {
                orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                        .setOrderId(orderId).setStatus(OrderStatus.APPROVED).build());
                System.out.println("[Orchestrator] Order " + orderId + " -> APPROVED");
                return "APPROVED";
            } else {
                System.out.println("[Orchestrator] Payment rejected — compensating...");
                kitchenStub.rejectTicket(RejectTicketRequest.newBuilder()
                        .setTicketId(ticketId).build());
                orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                        .setOrderId(orderId).setStatus(OrderStatus.REJECTED).build());
                System.out.println("[Orchestrator] Order " + orderId + " -> REJECTED");
                return "REJECTED";
            }
        } catch (Exception e) {
            System.err.println("[Orchestrator] Saga error: " + e.getMessage());
            return "ERROR: " + e.getMessage();
        }
    }

    // ── Get single order status ──────────────────────────────────────────────

    public String getOrderStatus(String orderId) {
        try {
            GetOrderResponse resp = orderStub.getOrder(
                    GetOrderRequest.newBuilder().setOrderId(orderId).build());
            if (!resp.getFound()) return "NOT_FOUND";
            return resp.getStatus().name();
        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    // ── List all orders ──────────────────────────────────────────────────────

    public String listOrders() {
        try {
            ListOrdersResponse resp = orderStub.listOrders(
                    ListOrdersRequest.newBuilder().build());

            List<OrderSummary> orders = resp.getOrdersList();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < orders.size(); i++) {
                OrderSummary o = orders.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append("\"orderId\":\"").append(o.getOrderId()).append("\",")
                  .append("\"status\":\"").append(o.getStatus().name()).append("\",")
                  .append("\"amount\":").append(o.getAmount()).append(",")
                  .append("\"createdAt\":\"").append(o.getCreatedAt()).append("\"")
                  .append("}");
            }
            sb.append("]");
            return sb.toString();
        } catch (Exception e) {
            System.err.println("[Orchestrator] listOrders error: " + e.getMessage());
            return "[]";
        }
    }

    // ── Cancel order ─────────────────────────────────────────────────────────

    public String cancelOrder(String orderId) {
        try {
            CancelOrderResponse resp = orderStub.cancelOrder(
                    CancelOrderRequest.newBuilder().setOrderId(orderId).build());
            if (resp.getSuccess()) {
                System.out.println("[Orchestrator] Order " + orderId + " cancelled");
                return "CANCELLED";
            } else {
                return "ERROR: Cannot cancel order (already rejected or cancelled)";
            }
        } catch (Exception e) {
            System.err.println("[Orchestrator] cancelOrder error: " + e.getMessage());
            return "ERROR: " + e.getMessage();
        }
    }

    // ── Factory ──────────────────────────────────────────────────────────────

    public static SagaOrchestrator fromEnv() {
        String orderHost   = System.getenv().getOrDefault("ORDER_SERVICE_HOST",      "localhost");
        int    orderPort   = Integer.parseInt(System.getenv().getOrDefault("ORDER_SERVICE_PORT",   "50051"));
        String kitchenHost = System.getenv().getOrDefault("KITCHEN_SERVICE_HOST",    "localhost");
        int    kitchenPort = Integer.parseInt(System.getenv().getOrDefault("KITCHEN_SERVICE_PORT", "50052"));
        String accountHost = System.getenv().getOrDefault("ACCOUNTING_SERVICE_HOST", "localhost");
        int    accountPort = Integer.parseInt(System.getenv().getOrDefault("ACCOUNTING_SERVICE_PORT", "50053"));

        ManagedChannel orderCh   = ManagedChannelBuilder.forAddress(orderHost,   orderPort).usePlaintext().build();
        ManagedChannel kitchenCh = ManagedChannelBuilder.forAddress(kitchenHost, kitchenPort).usePlaintext().build();
        ManagedChannel accountCh = ManagedChannelBuilder.forAddress(accountHost, accountPort).usePlaintext().build();

        return new SagaOrchestrator(orderCh, kitchenCh, accountCh);
    }
}
