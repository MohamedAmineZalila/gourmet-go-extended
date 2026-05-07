package com.gourmet.accounting;

import io.grpc.stub.StreamObserver;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class AccountingServiceImpl extends AccountingServiceGrpc.AccountingServiceImplBase {

    @Override
    public void authorizeCard(AuthorizeRequest request,
                              StreamObserver<AuthorizeResponse> responseObserver) {
        String orderId = request.getOrderId();
        double amount  = request.getAmount();

        // Business rule: authorize if amount < 100
        boolean authorized = amount < 100.0;

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.merge(new PaymentEntity(orderId, amount, authorized));
            tx.commit();
        } catch (Exception e) {
            System.err.println("[Accounting] DB error: " + e.getMessage());
        }

        System.out.println("[Accounting] Order " + orderId + " amount=$" + amount
                + " -> " + (authorized ? "AUTHORIZED" : "REJECTED"));

        responseObserver.onNext(AuthorizeResponse.newBuilder()
                .setAuthorized(authorized).build());
        responseObserver.onCompleted();
    }
}
