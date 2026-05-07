package com.gourmet.order;

import io.grpc.Server;
import io.grpc.ServerBuilder;

public class OrderServer {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("GRPC_PORT", "50051"));

        // Warm up Hibernate (creates table if needed)
        HibernateUtil.getSessionFactory();

        Server server = ServerBuilder.forPort(port)
                .addService(new OrderServiceImpl())
                .build()
                .start();

        System.out.println("[Order] gRPC server started on port " + port);
        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdown));
        server.awaitTermination();
    }
}
