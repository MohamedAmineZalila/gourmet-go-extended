package com.gourmet.kitchen;

import io.grpc.Server;
import io.grpc.ServerBuilder;

public class KitchenServer {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("GRPC_PORT", "50052"));
        HibernateUtil.getSessionFactory();
        Server server = ServerBuilder.forPort(port)
                .addService(new KitchenServiceImpl())
                .build().start();
        System.out.println("[Kitchen] gRPC server started on port " + port);
        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdown));
        server.awaitTermination();
    }
}
