package com.gourmet.order;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatusEnum status;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public OrderEntity() {}

    public OrderEntity(String orderId, double amount, OrderStatusEnum status) {
        this.orderId   = orderId;
        this.amount    = amount;
        this.status    = status;
        this.createdAt = Instant.now().toString();
    }

    public String getOrderId()               { return orderId; }
    public double getAmount()                { return amount; }
    public OrderStatusEnum getStatus()       { return status; }
    public String getCreatedAt()             { return createdAt; }
    public void setStatus(OrderStatusEnum s) { this.status = s; }
}
