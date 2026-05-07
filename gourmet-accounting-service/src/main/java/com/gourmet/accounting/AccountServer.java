package com.gourmet.accounting;

import io.grpc.Server;
import io.grpc.ServerBuilder;

public class AccountServer {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("GRPC_PORT", "50053"));
        HibernateUtil.getSessionFactory();
        Server server = ServerBuilder.forPort(port)
                .addService(new AccountingServiceImpl())
                .build().start();
        System.out.println("[Accounting] gRPC server started on port " + port);
        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdown));
        server.awaitTermination();
    }
}
