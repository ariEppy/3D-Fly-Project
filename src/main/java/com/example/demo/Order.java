package com.example.demo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

// make the orders table
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String customerName;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<OrderItem> items;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.NEW;

    private LocalDateTime createdAt = LocalDateTime.now();

    private double totalAmount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { 
        this.items = items; 
        this.totalAmount = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        items.forEach(i -> i.setOrder(this));
    }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public double getTotalAmount() { return totalAmount; }
}
