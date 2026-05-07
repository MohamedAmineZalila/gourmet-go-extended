package com.gourmet.kitchen;

import io.grpc.stub.StreamObserver;
import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.UUID;

public class KitchenServiceImpl extends KitchenServiceGrpc.KitchenServiceImplBase {

    @Override
    public void createTicket(CreateTicketRequest request,
                             StreamObserver<CreateTicketResponse> responseObserver) {
        String orderId  = request.getOrderId();
        String ticketId = UUID.randomUUID().toString();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(new TicketEntity(ticketId, orderId, "CREATED"));
            tx.commit();
            System.out.println("[Kitchen] Ticket " + ticketId + " created for order " + orderId);
        } catch (Exception e) {
            System.err.println("[Kitchen] createTicket error: " + e.getMessage());
        }

        responseObserver.onNext(CreateTicketResponse.newBuilder()
                .setSuccess(true)
                .setTicketId(ticketId)
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void rejectTicket(RejectTicketRequest request,
                             StreamObserver<RejectTicketResponse> responseObserver) {
        String ticketId = request.getTicketId();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            TicketEntity entity = session.get(TicketEntity.class, ticketId);
            if (entity != null) {
                entity.setStatus("REJECTED");
                session.merge(entity);
            }
            tx.commit();
            System.out.println("[Kitchen] Ticket " + ticketId + " REJECTED");
        } catch (Exception e) {
            System.err.println("[Kitchen] rejectTicket error: " + e.getMessage());
        }

        responseObserver.onNext(RejectTicketResponse.newBuilder()
                .setAcknowledgement(true)
                .build());
        responseObserver.onCompleted();
    }
}
