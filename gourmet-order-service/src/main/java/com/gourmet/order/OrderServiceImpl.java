package com.gourmet.order;

import io.grpc.stub.StreamObserver;
import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class OrderServiceImpl extends OrderServiceGrpc.OrderServiceImplBase {

    private OrderStatus toProto(OrderStatusEnum e) {
        return switch (e) {
            case APPROVAL_PENDING -> OrderStatus.APPROVAL_PENDING;
            case APPROVED         -> OrderStatus.APPROVED;
            case REJECTED         -> OrderStatus.REJECTED;
            case CANCELLED        -> OrderStatus.CANCELLED;
            default               -> OrderStatus.PENDING;
        };
    }

    private OrderStatusEnum fromProto(OrderStatus s) {
        return switch (s) {
            case APPROVAL_PENDING -> OrderStatusEnum.APPROVAL_PENDING;
            case APPROVED         -> OrderStatusEnum.APPROVED;
            case REJECTED         -> OrderStatusEnum.REJECTED;
            case CANCELLED        -> OrderStatusEnum.CANCELLED;
            default               -> OrderStatusEnum.PENDING;
        };
    }

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<CreateOrderResponse> responseObserver) {
        String orderId = request.getOrderId();
        double amount  = request.getAmount();
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.merge(new OrderEntity(orderId, amount, OrderStatusEnum.PENDING));
            tx.commit();
            System.out.println("[Order] Created order " + orderId + " amount=$" + amount);
        } catch (Exception e) {
            System.err.println("[Order] createOrder error: " + e.getMessage());
            responseObserver.onNext(CreateOrderResponse.newBuilder().setOrderId(orderId).setSuccess(false).build());
            responseObserver.onCompleted();
            return;
        }
        responseObserver.onNext(CreateOrderResponse.newBuilder().setOrderId(orderId).setSuccess(true).build());
        responseObserver.onCompleted();
    }

    @Override
    public void updateStatus(UpdateStatusRequest request, StreamObserver<UpdateStatusResponse> responseObserver) {
        String orderId = request.getOrderId();
        OrderStatusEnum newStatus = fromProto(request.getStatus());
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            OrderEntity entity = session.get(OrderEntity.class, orderId);
            if (entity == null) entity = new OrderEntity(orderId, 0, newStatus);
            else entity.setStatus(newStatus);
            session.merge(entity);
            tx.commit();
            System.out.println("[Order] Order " + orderId + " -> " + newStatus);
        } catch (Exception e) {
            System.err.println("[Order] updateStatus error: " + e.getMessage());
        }
        responseObserver.onNext(UpdateStatusResponse.newBuilder()
                .setOrderId(orderId).setNewStatus(request.getStatus()).setSuccess(true).build());
        responseObserver.onCompleted();
    }

    @Override
    public void getOrder(GetOrderRequest request, StreamObserver<GetOrderResponse> responseObserver) {
        String orderId = request.getOrderId();
        GetOrderResponse.Builder resp = GetOrderResponse.newBuilder().setOrderId(orderId);
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            OrderEntity entity = session.get(OrderEntity.class, orderId);
            if (entity != null) {
                resp.setStatus(toProto(entity.getStatus())).setAmount(entity.getAmount()).setFound(true);
            } else {
                resp.setStatus(OrderStatus.PENDING).setFound(false);
            }
        } catch (Exception e) {
            System.err.println("[Order] getOrder error: " + e.getMessage());
            resp.setFound(false).setStatus(OrderStatus.PENDING);
        }
        responseObserver.onNext(resp.build());
        responseObserver.onCompleted();
    }

    @Override
    public void listOrders(ListOrdersRequest request, StreamObserver<ListOrdersResponse> responseObserver) {
        ListOrdersResponse.Builder resp = ListOrdersResponse.newBuilder();
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            List<OrderEntity> orders = session
                    .createQuery("FROM OrderEntity ORDER BY createdAt DESC", OrderEntity.class)
                    .getResultList();
            for (OrderEntity e : orders) {
                resp.addOrders(OrderSummary.newBuilder()
                        .setOrderId(e.getOrderId())
                        .setStatus(toProto(e.getStatus()))
                        .setAmount(e.getAmount())
                        .setCreatedAt(e.getCreatedAt() != null ? e.getCreatedAt() : "")
                        .build());
            }
        } catch (Exception e) {
            System.err.println("[Order] listOrders error: " + e.getMessage());
        }
        responseObserver.onNext(resp.build());
        responseObserver.onCompleted();
    }

    @Override
    public void cancelOrder(CancelOrderRequest request, StreamObserver<CancelOrderResponse> responseObserver) {
        String orderId = request.getOrderId();
        boolean success = false;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            OrderEntity entity = session.get(OrderEntity.class, orderId);
            if (entity != null
                    && entity.getStatus() != OrderStatusEnum.CANCELLED
                    && entity.getStatus() != OrderStatusEnum.REJECTED) {
                entity.setStatus(OrderStatusEnum.CANCELLED);
                session.merge(entity);
                success = true;
                System.out.println("[Order] Order " + orderId + " -> CANCELLED");
            }
            tx.commit();
        } catch (Exception e) {
            System.err.println("[Order] cancelOrder error: " + e.getMessage());
        }
        responseObserver.onNext(CancelOrderResponse.newBuilder().setSuccess(success).setOrderId(orderId).build());
        responseObserver.onCompleted();
    }
}
