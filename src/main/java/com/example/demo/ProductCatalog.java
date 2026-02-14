package com.example.demo;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductCatalog {
    private List<Product> products = new ArrayList<>();

    public ProductCatalog() {
        products.add(new Product(1L, "Apple", 1.0));
        products.add(new Product(2L, "Banana", 0.5));
        products.add(new Product(3L, "Orange", 0.8));
    }

    public boolean exists(Long productId) {
        return products.stream().anyMatch(p -> p.getId().equals(productId));
    }

    public Product getProduct(Long productId) {
        return products.stream()
                       .filter(p -> p.getId().equals(productId))
                       .findFirst()
                       .orElse(null);
    }

    public List<Product> getAllProducts() {
        return products;
    }
}
