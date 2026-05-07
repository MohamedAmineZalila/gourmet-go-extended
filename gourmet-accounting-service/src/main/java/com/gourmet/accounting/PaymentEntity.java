package com.gourmet.accounting;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @Column(name = "order_id")
    private String orderId;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "authorized", nullable = false)
    private boolean authorized;

    public PaymentEntity() {}

    public PaymentEntity(String orderId, double amount, boolean authorized) {
        this.orderId    = orderId;
        this.amount     = amount;
        this.authorized = authorized;
    }

    public String getOrderId()   { return orderId; }
    public double getAmount()    { return amount; }
    public boolean isAuthorized(){ return authorized; }
}
