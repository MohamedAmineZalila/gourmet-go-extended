package com.gourmet.kitchen;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class TicketEntity {

    @Id
    @Column(name = "ticket_id")
    private String ticketId;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "status", nullable = false)
    private String status; // CREATED, REJECTED

    public TicketEntity() {}

    public TicketEntity(String ticketId, String orderId, String status) {
        this.ticketId = ticketId;
        this.orderId  = orderId;
        this.status   = status;
    }

    public String getTicketId() { return ticketId; }
    public String getOrderId()  { return orderId; }
    public String getStatus()   { return status; }
    public void setStatus(String s) { this.status = s; }
}
