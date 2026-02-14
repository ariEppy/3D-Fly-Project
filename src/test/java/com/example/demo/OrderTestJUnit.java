package com.example.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

public class OrderTestJUnit {

    @Test
    void testTotalAmountCalculation() {
        Order order = new Order();
        OrderItem item1 = new OrderItem();
        item1.setProductName("Apple");
        item1.setQuantity(2);
        item1.setPrice(1.0);

        OrderItem item2 = new OrderItem();
        item2.setProductName("Banana");
        item2.setQuantity(3);
        item2.setPrice(0.5);

        order.setItems(List.of(item1, item2));

        // Check total amount
        assertEquals(3.5, order.getTotalAmount(), 0.001);
    }
}