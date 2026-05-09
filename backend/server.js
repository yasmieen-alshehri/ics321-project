const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

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
  if (err) console.log("DB Error:", err);
  else { console.log("Connected to MySQL ✅"); connection.release(); }
});

// ══════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════
app.post("/login", (req, res) => {
  const { role, id, username, password } = req.body;

  if (role === "admin") {
    db.query("SELECT * FROM admin_tab WHERE admin_id = ? AND passwordd = ?", [id, password], (err, result) => {
      if (err || !result.length) return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      res.json({ success: true, user: { role: "admin", id: result[0].admin_id } });
    });

  } else if (role === "owner") {
    db.query(
      "SELECT o.*, s.store_id FROM owner_tab o LEFT JOIN store_tab s ON s.owner_id = o.owner_id WHERE o.username = ? AND o.passwordd = ?",
      [username, password],
      (err, result) => {
        if (err || !result.length) return res.status(401).json({ success: false, message: "Invalid owner credentials" });
        const r = result[0];
        res.json({ success: true, user: { role: "owner", id: r.owner_id, username: r.username, store_id: r.store_id } });
      }
    );

  } else if (role === "customer") {
    db.query(
      "SELECT c.*, p.bio, p.phone_number FROM customer_tab c LEFT JOIN profile_tab p ON c.c_username = p.c_username WHERE c.c_username = ? AND c.passwordd = ?",
      [username, password],
      (err, result) => {
        if (err || !result.length) return res.status(401).json({ success: false, message: "Invalid customer credentials" });
        const r = result[0];
        res.json({ success: true, user: { role: "customer", username: r.c_username, address: r.address, bio: r.bio, phone_number: r.phone_number } });
      }
    );
  } else {
    res.status(400).json({ success: false, message: "Unknown role" });
  }
});

// ══════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════
app.get("/dashboard/stats", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM product_tab)  AS total_products,
      (SELECT COUNT(*) FROM customer_tab) AS total_customers,
      (SELECT COUNT(*) FROM store_tab)    AS total_stores,
      (SELECT COUNT(*) FROM order_tab)    AS total_orders,
      (SELECT COUNT(*) FROM review_tab)   AS total_reviews,
      (SELECT COUNT(*) FROM report_tab)   AS total_reports,
      (SELECT COUNT(*) FROM order_tab  WHERE status = 'Pending')     AS pending_orders,
      (SELECT COUNT(*) FROM report_tab WHERE status = 'open')        AS open_reports,
      (SELECT COUNT(*) FROM product_tab WHERE available_units <= 5)  AS low_stock_products,
      (SELECT IFNULL(SUM(od.quantity * p.price), 0)
       FROM order_detail_tab od JOIN product_tab p ON od.product_id = p.product_id) AS total_revenue
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// ══════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════
app.get("/products", (req, res) => {
  const sql = `
    SELECT p.*, s.namee AS store_name
    FROM product_tab p
    JOIN store_tab s ON p.store_id = s.store_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/products", (req, res) => {
  const { store_id, namee, price, available_units, descriptionn, image_path } = req.body;
  const sql = "INSERT INTO product_tab (store_id, namee, price, available_units, descriptionn, image_path) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [store_id, namee, price, available_units || 0, descriptionn || null, image_path || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product added", product_id: result.insertId });
  });
});

app.put("/products/:id", (req, res) => {
  const { namee, price, available_units, descriptionn, image_path } = req.body;
  const sql = "UPDATE product_tab SET namee=?, price=?, available_units=?, descriptionn=?, image_path=? WHERE product_id=?";
  db.query(sql, [namee, price, available_units, descriptionn, image_path || null, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product updated" });
  });
});

app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM product_tab WHERE product_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product deleted" });
  });
});

// ══════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════
app.get("/customers", (req, res) => {
  const sql = `
    SELECT c.*, p.bio, p.phone_number
    FROM customer_tab c
    LEFT JOIN profile_tab p ON c.c_username = p.c_username
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/customers", (req, res) => {
  const { c_username, passwordd, address, bio, phone_number } = req.body;
  db.query(
    "INSERT INTO customer_tab (c_username, passwordd, address) VALUES (?, ?, ?)",
    [c_username, passwordd, address],
    (err) => {
      if (err) return res.status(500).json(err);
      // Insert profile too
      db.query(
        "INSERT INTO profile_tab (c_username, bio, phone_number) VALUES (?, ?, ?)",
        [c_username, bio || null, phone_number || null],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ message: "Customer added" });
        }
      );
    }
  );
});

app.put("/customers/:username", (req, res) => {
  const { address, bio, phone_number } = req.body;
  db.query(
    "UPDATE customer_tab SET address=? WHERE c_username=?",
    [address, req.params.username],
    (err) => {
      if (err) return res.status(500).json(err);
      db.query(
        "UPDATE profile_tab SET bio=?, phone_number=? WHERE c_username=?",
        [bio || null, phone_number || null, req.params.username],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ message: "Customer updated" });
        }
      );
    }
  );
});

app.delete("/customers/:username", (req, res) => {
  db.query("DELETE FROM customer_tab WHERE c_username=?", [req.params.username], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Customer deleted" });
  });
});

// ══════════════════════════════════════════
// OWNERS
// ══════════════════════════════════════════
app.get("/owners", (req, res) => {
  db.query("SELECT owner_id, username FROM owner_tab", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/owners", (req, res) => {
  const { username, passwordd } = req.body;
  db.query("INSERT INTO owner_tab (username, passwordd) VALUES (?, ?)", [username, passwordd], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Owner added", owner_id: result.insertId });
  });
});

app.put("/owners/:id", (req, res) => {
  const { username, passwordd } = req.body;
  db.query("UPDATE owner_tab SET username=?, passwordd=? WHERE owner_id=?", [username, passwordd, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Owner updated" });
  });
});

app.delete("/owners/:id", (req, res) => {
  db.query("DELETE FROM owner_tab WHERE owner_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Owner deleted" });
  });
});

// ══════════════════════════════════════════
// STORES
// ══════════════════════════════════════════
app.get("/stores", (req, res) => {
  const sql = `
    SELECT s.*, o.username AS owner_username
    FROM store_tab s
    JOIN owner_tab o ON s.owner_id = o.owner_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/stores", (req, res) => {
  const { namee, owner_id } = req.body;
  db.query("INSERT INTO store_tab (namee, owner_id) VALUES (?, ?)", [namee, owner_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Store added", store_id: result.insertId });
  });
});

app.put("/stores/:id", (req, res) => {
  const { namee, owner_id } = req.body;
  db.query("UPDATE store_tab SET namee=?, owner_id=? WHERE store_id=?", [namee, owner_id, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Store updated" });
  });
});

app.delete("/stores/:id", (req, res) => {
  db.query("DELETE FROM store_tab WHERE store_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Store deleted" });
  });
});

// ══════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════
app.get("/orders", (req, res) => {
  const sql = `
    SELECT o.*, s.namee AS store_name
    FROM order_tab o
    JOIN store_tab s ON o.store_id = s.store_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/orders", (req, res) => {
  const { c_username, store_id, status, order_date } = req.body;
  const sql = "INSERT INTO order_tab (c_username, store_id, status, order_date) VALUES (?, ?, ?, ?)";
  db.query(sql, [c_username, store_id, status || "Pending", order_date || new Date().toISOString().split("T")[0]], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Order added", order_id: result.insertId });
  });
});

app.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE order_tab SET status=? WHERE order_id=?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Order status updated" });
  });
});

app.delete("/orders/:id", (req, res) => {
  db.query("DELETE FROM order_tab WHERE order_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Order deleted" });
  });
});

// ══════════════════════════════════════════
// ORDER DETAILS
// ══════════════════════════════════════════
app.get("/orders/:id/details", (req, res) => {
  const sql = `
    SELECT od.*, p.namee, p.price, (od.quantity * p.price) AS total_price
    FROM order_detail_tab od
    JOIN product_tab p ON od.product_id = p.product_id
    WHERE od.order_id = ?
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/orders/:id/details", (req, res) => {
  const { product_id, quantity } = req.body;
  db.query(
    "INSERT INTO order_detail_tab (order_id, product_id, quantity) VALUES (?, ?, ?)",
    [req.params.id, product_id, quantity || 1],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Order detail added" });
    }
  );
});

app.delete("/orders/:order_id/details/:product_id", (req, res) => {
  db.query(
    "DELETE FROM order_detail_tab WHERE order_id=? AND product_id=?",
    [req.params.order_id, req.params.product_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Order detail deleted" });
    }
  );
});

// ══════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════
app.get("/reviews", (req, res) => {
  const sql = `
    SELECT r.*, p.namee AS product_name
    FROM review_tab r
    JOIN product_tab p ON r.product_id = p.product_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/reviews", (req, res) => {
  const { product_id, c_username, comment_text, rate, review_date } = req.body;
  // Get next review_number for this product
  db.query(
    "SELECT IFNULL(MAX(review_number), 0) + 1 AS next_num FROM review_tab WHERE product_id = ?",
    [product_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      const review_number = result[0].next_num;
      const sql = "INSERT INTO review_tab (product_id, review_number, c_username, comment_text, review_date, rate) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(sql, [product_id, review_number, c_username, comment_text, review_date || new Date().toISOString().split("T")[0], rate], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Review added", review_number });
      });
    }
  );
});

app.put("/reviews/:product_id/:review_number", (req, res) => {
  const { comment_text, rate } = req.body;
  db.query(
    "UPDATE review_tab SET comment_text=?, rate=? WHERE product_id=? AND review_number=?",
    [comment_text, rate, req.params.product_id, req.params.review_number],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Review updated" });
    }
  );
});

app.delete("/reviews/:product_id/:review_number", (req, res) => {
  db.query(
    "DELETE FROM review_tab WHERE product_id=? AND review_number=?",
    [req.params.product_id, req.params.review_number],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Review deleted" });
    }
  );
});

// ══════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════
app.get("/reports", (req, res) => {
  const sql = `
    SELECT r.*, s.namee AS store_name
    FROM report_tab r
    JOIN store_tab s ON r.store_id = s.store_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/reports", (req, res) => {
  const { c_username, store_id, issue_des, status, report_date } = req.body;
  const sql = "INSERT INTO report_tab (c_username, store_id, issue_des, status, report_date) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [c_username, store_id, issue_des, status || "open", report_date || new Date().toISOString().split("T")[0]], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report submitted", report_id: result.insertId });
  });
});

app.put("/reports/:id/status", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE report_tab SET status=? WHERE report_id=?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report status updated" });
  });
});

app.delete("/reports/:id", (req, res) => {
  db.query("DELETE FROM report_tab WHERE report_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report deleted" });
  });
});

// ══════════════════════════════════════════
// ADMINS
// ══════════════════════════════════════════
app.get("/admins", (req, res) => {
  db.query("SELECT * FROM admin_tab", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/admins", (req, res) => {
  const { passwordd } = req.body;
  db.query("INSERT INTO admin_tab (passwordd) VALUES (?)", [passwordd], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Admin added", admin_id: result.insertId });
  });
});

app.put("/admins/:id", (req, res) => {
  const { passwordd } = req.body;
  db.query("UPDATE admin_tab SET passwordd=? WHERE admin_id=?", [passwordd, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Admin updated" });
  });
});

app.delete("/admins/:id", (req, res) => {
  db.query("DELETE FROM admin_tab WHERE admin_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Admin deleted" });
  });
});

// ══════════════════════════════════════════
// SESSIONS
// ══════════════════════════════════════════
app.get("/sessions", (req, res) => {
  db.query("SELECT * FROM session_tab ORDER BY login_time DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/sessions", (req, res) => {
  const { user_type, customer_username, owner_id, admin_id } = req.body;
  const sql = "INSERT INTO session_tab (user_type, customer_username, owner_id, admin_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [user_type, customer_username || null, owner_id || null, admin_id || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Session created", session_id: result.insertId });
  });
});

app.put("/sessions/:id/logout", (req, res) => {
  db.query("UPDATE session_tab SET logout_time=NOW() WHERE session_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Session closed" });
  });
});

app.delete("/sessions/:id", (req, res) => {
  db.query("DELETE FROM session_tab WHERE session_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Session deleted" });
  });
});

// ══════════════════════════════════════════
// SENDS
// ══════════════════════════════════════════
app.get("/sends", (req, res) => {
  const sql = `
    SELECT se.*, s.namee AS store_name, r.issue_des
    FROM sends_tab se
    JOIN store_tab s ON se.store_id = s.store_id
    JOIN report_tab r ON se.report_id = r.report_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/sends", (req, res) => {
  const { store_id, report_id, session_id } = req.body;
  db.query("INSERT INTO sends_tab (store_id, report_id, session_id) VALUES (?, ?, ?)", [store_id, report_id, session_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Send created", send_id: result.insertId });
  });
});

app.delete("/sends/:id", (req, res) => {
  db.query("DELETE FROM sends_tab WHERE send_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Send deleted" });
  });
});

// ══════════════════════════════════════════
// LOGS
// ══════════════════════════════════════════
app.get("/logs", (req, res) => {
  db.query("SELECT * FROM log_tab ORDER BY log_timestamp DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/logs", (req, res) => {
  const { admin_id, send_id, action_text } = req.body;
  db.query("INSERT INTO log_tab (admin_id, send_id, action_text) VALUES (?, ?, ?)", [admin_id, send_id, action_text], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Log added", log_id: result.insertId });
  });
});

app.delete("/logs/:id", (req, res) => {
  db.query("DELETE FROM log_tab WHERE log_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Log deleted" });
  });
});

// ══════════════════════════════════════════
app.listen(5000, () => console.log("Server running on http://localhost:5000 🚀"));
