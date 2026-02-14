package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@Validated
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    // Create a new order
    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
        order.setStatus(OrderStatus.NEW);
        order.setItems(order.getItems());
        Order savedOrder = orderRepository.save(order);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    // Get orders with filtering, sorting, pagination
    @GetMapping
    public Page<Order> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "desc") String sortOrder, 
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int pageSize
    ) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ?
                Sort.by("createdAt").ascending() :
                Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        } else {
            return orderRepository.findAll(pageable);
        }
    }

    // Get order by id
    @GetMapping("/{id}")
public ResponseEntity<Order> getOrderById(@PathVariable Long id) {

    return orderRepository.findById(id)
            .map(order -> ResponseEntity.ok(order))
            .orElse(ResponseEntity.notFound().build());
}

// Mark order as paid
@PutMapping("/{id}/pay")
public ResponseEntity<?> markOrderAsPaid(@PathVariable Long id) {

    return orderRepository.findById(id)
            .map(order -> {

                // Only change if status is New
                if (order.getStatus() == OrderStatus.NEW) {
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                    return ResponseEntity.ok(order);
                }

                return ResponseEntity
                        .badRequest()
                        .body("Order cannot be marked as PAID. Current status: " + order.getStatus());
            })
            .orElse(ResponseEntity.notFound().build());
}

// Change status to cancelled
@PatchMapping("/{id}/cancel")
public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
    return orderRepository.findById(id).map(order -> {
        if (order.getStatus() == OrderStatus.NEW) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(order);
        }
    }).orElse(ResponseEntity.notFound().build());
}


}
