"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([
    { productName: "", quantity: 1, price: 0 },
  ]);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchId, setSearchId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [products, setProducts] = useState([
    { productId: null, productName: "", quantity: 1, price: 0 },
  ]);

  // on load get the catalog of products
  useEffect(() => {
    const fetchCatalog = async () => {
      const res = await fetch("http://localhost:8080/api/products");
      const data = await res.json();
      setCatalog(data);
    };
    fetchCatalog();
  }, []);

  // get the specified orders using paramas
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("sortOrder", sortOrder);
      params.append("page", currentPage);
      params.append("pageSize", pageSize);

      const response = await fetch(
        `http://localhost:8080/api/orders?${params}`,
      );
      const data = await response.json();

      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  // when statusfilter, sortorder, or currentpage changes then run fetchorders
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortOrder, currentPage]);

  // get the order with a unique id
  const fetchOrderById = async () => {
    try {
      setSearchError("");
      const response = await fetch(
        `http://localhost:8080/api/orders/${searchId}`,
      );

      if (!response.ok) {
        throw new Error("Order not found");
      }

      const data = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      setSelectedOrder(null);
      setSearchError("Order not found");
    }
  };

  // create a new order and then show the new order
  const createOrder = async () => {
    const order = {
      customerName,
      items: products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
      })),
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      setMessage(`Order added!`);
      setCurrentPage(1);
      fetchOrders();
    } catch (error) {
      setMessage("Error adding order");
      console.error(error);
    }
  };
  // add another item for the user to fill out
  const addItem = () => {
    setProducts([
      ...products,
      { productId: null, productName: "", quantity: 1, price: 0 },
    ]);
  };

  // remove the item from the array
  const removeItem = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  // change an order to paid and then get all the orders again
  const markAsPaid = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/${id}/pay`,
        { method: "PUT" },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      fetchOrders();
    } catch (error) {
      alert(error.message);
    }
  };

  // change an order to cancelled and reload the orders
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        { method: "PATCH" },
      );

      if (!response.ok) throw new Error("Failed to cancel order");

      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  // update the product at the given index with the selected catalog values
  const handleProductChange = (index, productId) => {
    const selectedProduct = catalog.find((p) => p.id === productId);

    const newProducts = [...products];

    newProducts[index] = {
      ...newProducts[index],
      productId: productId,
      price: selectedProduct.price,
      productName: selectedProduct.name,
      quantity: newProducts[index].quantity || 1,
    };

    setProducts(newProducts);
  };

  return (
    <div>
      <h1>Create Order</h1>
      <input
        placeholder="Customer name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <h3>Products</h3>
      {products.map((product, index) => (
        <div key={index}>
          <select
            value={product.productId || ""}
            onChange={(e) => handleProductChange(index, Number(e.target.value))}
          >
            <option value="">Select product</option>

            {catalog.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - ${p.price}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={product.quantity || 1}
            onChange={(e) => {
              const newProducts = [...products];
              newProducts[index].quantity = Number(e.target.value);
              setProducts(newProducts);
            }}
          />

          {products.length > 1 && (
            <button onClick={() => removeItem(index)}>Remove</button>
          )}
        </div>
      ))}

      <button onClick={addItem}>Add Another Product</button>

      <button onClick={createOrder}>Create Order</button>
      {message && <p>{message}</p>}

      <h2>Find Order By ID</h2>

      <input
        type="number"
        placeholder="Order ID"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />

      <button onClick={fetchOrderById}>Find</button>

      {searchError && <p>{searchError}</p>}

      {selectedOrder && (
        <div>
          <p>
            <strong>ID:</strong> {selectedOrder.id}
          </p>
          <p>
            <strong>Customer:</strong> {selectedOrder.customerName}
          </p>
          <p>
            <strong>Status:</strong> {selectedOrder.status}
          </p>
          <p>
            <strong>Total:</strong> ${selectedOrder.totalAmount}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selectedOrder.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      <h2>All Orders</h2>

      <div>
        <label>
          Status:
          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="NEW">NEW</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>

        <label>
          Order:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
        <span>
          {" "}
          Page {currentPage} of {totalPages}{" "}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      {item.productName} - {item.quantity} x (${item.price})
                    </div>
                  ))}
                </td>
                <td>${order.totalAmount}</td>
                <td>
                  {order.status}
                  {order.status === "NEW" && (
                    <>
                      <button onClick={() => markAsPaid(order.id)}>Paid</button>
                      <button onClick={() => cancelOrder(order.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>

                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
