const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const requiredDbEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingDbEnv = requiredDbEnv.filter(name => !process.env[name]);

if (missingDbEnv.length > 0) {
  console.error(`Missing required database environment variables: ${missingDbEnv.join(", ")}`);
  process.exit(1);
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) console.log(err);
  else {
    console.log("Connected to MySQL");
    connection.release();
  }
});

// 🟢 PRODUCTS with STORE name
app.get("/products", (req, res) => {
  const sql = `
    SELECT 
      p.product_id,
      p.store_id,
      p.namee,
      p.price,
      p.available_units,
      p.descriptionn,
      s.namee AS store_name
    FROM product_tab p
    JOIN store_tab s ON p.store_id = s.store_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 ADD PRODUCT
app.post("/products", (req, res) => {
  const { store_id, namee, price, available_units, descriptionn } = req.body;

  const sql = `
    INSERT INTO product_tab 
    (store_id, namee, price, available_units, descriptionn)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [store_id, namee, price, available_units, descriptionn], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product added successfully", product_id: result.insertId });
  });
});

// 🟢 UPDATE PRODUCT
app.put("/products/:id", (req, res) => {
  const { namee, price, available_units, descriptionn } = req.body;

  const sql = `
    UPDATE product_tab
    SET namee = ?, price = ?, available_units = ?, descriptionn = ?
    WHERE product_id = ?
  `;

  db.query(sql, [namee, price, available_units, descriptionn, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product updated successfully" });
  });
});

// 🟢 DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM product_tab WHERE product_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product deleted successfully" });
  });
});

// 🟢 CUSTOMERS
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customer_tab", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 ADD CUSTOMER
app.post("/customers", (req, res) => {
  const { c_username, passwordd, address, bio, phone_number } = req.body;

  const sql = `
    INSERT INTO customer_tab
    (c_username, passwordd, address, bio, phone_number)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [c_username, passwordd, address, bio, phone_number], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Customer added successfully" });
  });
});

// 🟢 DELETE CUSTOMER
app.delete("/customers/:username", (req, res) => {
  db.query("DELETE FROM customer_tab WHERE c_username = ?", [req.params.username], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Customer deleted successfully" });
  });
});

// 🟢 STORES with OWNER name
// 🟢 STORES
app.get("/stores", (req, res) => {
  db.query("SELECT * FROM store_tab", (err, result) => {
    if (err) {
      console.log("Stores error:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});
// 🟢 ADD STORE
app.post("/stores", (req, res) => {
  const { namee, owner_id } = req.body;

  const sql = `
    INSERT INTO store_tab (namee, owner_id)
    VALUES (?, ?)
  `;

  db.query(sql, [namee, owner_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Store added successfully", store_id: result.insertId });
  });
});

// 🟢 DELETE STORE
app.delete("/stores/:id", (req, res) => {
  db.query("DELETE FROM store_tab WHERE store_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Store deleted successfully" });
  });
});

// 🟢 ORDERS with CUSTOMER + STORE name
app.get("/orders", (req, res) => {
  const sql = `
    SELECT 
      o.order_id,
      o.c_username,
      o.store_id,
      o.status,
      o.order_date,
      s.namee AS store_name
    FROM order_tab o
    JOIN customer_tab c ON o.c_username = c.c_username
    JOIN store_tab s ON o.store_id = s.store_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 ORDER DETAILS
app.get("/orders/:id/details", (req, res) => {
  const sql = `
    SELECT 
      od.order_id,
      od.product_id,
      p.namee,
      od.quantity,
      p.price,
      (od.quantity * p.price) AS total_price
    FROM order_detail_tab od
    JOIN product_tab p ON od.product_id = p.product_id
    WHERE od.order_id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 UPDATE ORDER STATUS
app.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;

  const sql = `
    UPDATE order_tab
    SET status = ?
    WHERE order_id = ?
  `;

  db.query(sql, [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Order status updated successfully" });
  });
});

// 🟢 REVIEWS with PRODUCT name
app.get("/reviews", (req, res) => {
  const sql = `
    SELECT 
      r.product_id,
      p.namee AS product_name,
      r.c_username,
      r.rate,
      r.comment_text,
      r.review_date
    FROM review_tab r
    JOIN product_tab p ON r.product_id = p.product_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 REPORTS with STORE name
app.get("/reports", (req, res) => {
  const sql = `
    SELECT
      r.report_id,
      r.c_username,
      r.store_id,
      s.namee AS store_name,
      r.issue_des,
      r.status,
      r.report_date
    FROM report_tab r
    JOIN store_tab s ON r.store_id = s.store_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 UPDATE REPORT STATUS
app.put("/reports/:id/status", (req, res) => {
  const { status } = req.body;

  const sql = `
    UPDATE report_tab
    SET status = ?
    WHERE report_id = ?
  `;

  db.query(sql, [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report status updated successfully" });
  });
});

// 🟢 ADMINS
app.get("/admins", (req, res) => {
  db.query("SELECT * FROM admin_tab", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 LOGS
app.get("/logs", (req, res) => {
  db.query("SELECT * FROM log_tab", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 DASHBOARD STATS
app.get("/dashboard/stats", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM product_tab) AS total_products,
      (SELECT COUNT(*) FROM customer_tab) AS total_customers,
      (SELECT COUNT(*) FROM store_tab) AS total_stores,
      (SELECT COUNT(*) FROM order_tab) AS total_orders,
      (SELECT COUNT(*) FROM review_tab) AS total_reviews,
      (SELECT COUNT(*) FROM report_tab) AS total_reports,
      (SELECT COUNT(*) FROM order_tab WHERE status = 'Pending') AS pending_orders,
      (SELECT COUNT(*) FROM report_tab WHERE status = 'Open') AS open_reports,
      (SELECT COUNT(*) FROM product_tab WHERE available_units <= 5) AS low_stock_products,
      (
        SELECT IFNULL(SUM(od.quantity * p.price), 0)
        FROM order_detail_tab od
        JOIN product_tab p ON od.product_id = p.product_id
      ) AS total_revenue
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Dashboard stats error:", err);
      return res.status(500).json(err);
    }

    res.json(result[0]);
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
