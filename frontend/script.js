const API = "http://localhost:5000";

// ===== NAVIGATION =====
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`page-${page}`).classList.add("active");

    loadPage(page);
  });
});

function loadPage(page) {
  const loaders = {
    dashboard: loadDashboard,
    products: loadProducts,
    customers: loadCustomers,
    stores: loadStores,
    orders: loadOrders,
    reviews: loadReviews,
    reports: loadReports,
    admins: loadAdmins,
  };

  if (loaders[page]) loaders[page]();
}

// ===== FETCH HELPERS =====
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API + endpoint);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (e) {
    setStatus(false);
    return null;
  }
}

async function apiPost(endpoint, data) {
  try {
    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return await res.json();
  } catch (e) {
    showToast("خطأ في الاتصال بالخادم", "error");
    return null;
  }
}

async function apiPut(endpoint, data) {
  try {
    const res = await fetch(API + endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return await res.json();
  } catch (e) {
    showToast("خطأ في الاتصال بالخادم", "error");
    return null;
  }
}

async function apiDelete(endpoint) {
  try {
    const res = await fetch(API + endpoint, { method: "DELETE" });
    return await res.json();
  } catch (e) {
    showToast("خطأ في الاتصال بالخادم", "error");
    return null;
  }
}

// ===== STATUS =====
function setStatus(connected, text) {
  const dot = document.getElementById("statusDot");
  const txt = document.getElementById("statusText");

  if (connected) {
    dot.className = "status-dot connected";
    txt.textContent = text || "Connected";
  } else {
    dot.className = "status-dot error";
    txt.textContent = text || "Disconnected";
  }
}

// ===== TOAST =====
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show " + type;

  setTimeout(() => {
    t.className = "toast";
  }, 3000);
}

// ===== MODAL =====
function showModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

document.querySelectorAll(".modal-overlay").forEach(m => {
  m.addEventListener("click", e => {
    if (e.target === m) m.classList.remove("open");
  });
});

// ===== FILTER TABLE =====
function filterTable(tableId, query) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  const q = query.toLowerCase();

  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

// ===== BADGES =====
function badge(status) {
  const s = (status || "").toLowerCase().replace(" ", "-");

  const map = {
    delivered: "badge-delivered",
    pending: "badge-pending",
    shipped: "badge-shipped",
    open: "badge-open",
    "in-progress": "badge-in-progress",
    closed: "badge-closed"
  };

  return `<span class="badge ${map[s] || ""}">${status || "—"}</span>`;
}

// ===== STARS =====
function stars(n) {
  n = Number(n) || 0;
  return `<span class="stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const data = await apiFetch("/dashboard/stats");

  if (!data) {
    document.getElementById("recentOrders").innerHTML =
      '<div class="loading-row">Failed to load dashboard</div>';
    return;
  }

  document.getElementById("stat-products").textContent = data.total_products;
  document.getElementById("stat-customers").textContent = data.total_customers;
  document.getElementById("stat-stores").textContent = data.total_stores;
  document.getElementById("stat-orders").textContent = data.total_orders;
  document.getElementById("stat-reviews").textContent = data.total_reviews;
  document.getElementById("stat-reports").textContent = data.total_reports;

  document.getElementById("stat-revenue").textContent =
    "$" + Number(data.total_revenue || 0).toFixed(2);

  document.getElementById("stat-low-stock").textContent = data.low_stock_products;
  document.getElementById("stat-pending-orders").textContent = data.pending_orders;
  document.getElementById("stat-open-reports").textContent = data.open_reports;

  document.querySelectorAll(".stat-card").forEach(card => {
    card.classList.remove("loading");
  });

  setStatus(true);

  const orders = await apiFetch("/orders");
  const tbody = document.getElementById("recentOrders");

  if (!orders) {
    tbody.innerHTML = '<div class="loading-row">Failed to load recent orders</div>';
    return;
  }

  const recent = orders.slice(0, 5);

  tbody.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Store</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${recent.map(o => `
          <tr>
            <td style="font-family:var(--mono)">#${o.order_id}</td>
            <td>${o.c_username}</td>
            <td>${o.store_name || o.store_id}</td>
            <td>${badge(o.status)}</td>
            <td>${formatDate(o.order_date)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ===== PRODUCTS =====
async function loadProducts() {
  const data = await apiFetch("/products");
  const tbody = document.getElementById("productBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  setStatus(true);

  tbody.innerHTML = data.map(p => `
    <tr>
      <td style="font-family:var(--mono);color:var(--text3)">${p.product_id}</td>
      <td><strong>${p.namee}</strong></td>
      <td>${p.store_name || p.store_id}</td>
      <td style="color:var(--success);font-family:var(--mono)">
        $${parseFloat(p.price).toFixed(2)}
      </td>
      <td>${p.available_units}</td>
      <td title="${p.descriptionn || ""}">${truncate(p.descriptionn, 40)}</td>
      <td>
        <button 
          class="btn-action"
          onclick='openEditProduct(${JSON.stringify(p)})'>
          Edit
        </button>
        <button 
          class="btn-action btn-delete" 
          onclick="deleteProduct(${p.product_id})">
          حذف
        </button>
      </td>
    </tr>
  `).join("");
}

async function addProduct() {
  const body = {
    store_id: +document.getElementById("new-product-store").value,
    namee: document.getElementById("new-product-name").value,
    price: +document.getElementById("new-product-price").value,
    available_units: +document.getElementById("new-product-units").value,
    descriptionn: document.getElementById("new-product-desc").value,
  };

  if (!body.namee || !body.store_id || !body.price) {
    showToast("يرجى ملء الحقول المطلوبة", "error");
    return;
  }

  const res = await apiPost("/products", body);

  if (res) {
    showToast("تم إضافة المنتج ✓", "success");
    closeModal("addProductModal");
    clearAddProductForm();
    loadProducts();
    loadDashboard();
  }
}

function openEditProduct(product) {
  document.getElementById("edit-product-id").value = product.product_id;
  document.getElementById("edit-product-name").value = product.namee;
  document.getElementById("edit-product-price").value = product.price;
  document.getElementById("edit-product-units").value = product.available_units;
  document.getElementById("edit-product-desc").value = product.descriptionn || "";

  showModal("editProductModal");
}

async function saveEditProduct() {
  const id = document.getElementById("edit-product-id").value;

  const body = {
    namee: document.getElementById("edit-product-name").value,
    price: +document.getElementById("edit-product-price").value,
    available_units: +document.getElementById("edit-product-units").value,
    descriptionn: document.getElementById("edit-product-desc").value,
  };

  if (!body.namee || !body.price) {
    showToast("يرجى ملء الحقول المطلوبة", "error");
    return;
  }

  const res = await apiPut(`/products/${id}`, body);

  if (res) {
    showToast("تم تحديث المنتج ✓", "success");
    closeModal("editProductModal");
    loadProducts();
    loadDashboard();
  }
}

async function deleteProduct(id) {
  if (!confirm("هل تريد حذف هذا المنتج؟")) return;

  const res = await apiDelete(`/products/${id}`);

  if (res) {
    showToast("تم الحذف", "success");
    loadProducts();
    loadDashboard();
  }
}

function clearAddProductForm() {
  document.getElementById("new-product-store").value = "";
  document.getElementById("new-product-name").value = "";
  document.getElementById("new-product-price").value = "";
  document.getElementById("new-product-units").value = "";
  document.getElementById("new-product-desc").value = "";
}

// ===== CUSTOMERS =====
async function loadCustomers() {
  const data = await apiFetch("/customers");
  const tbody = document.getElementById("customerBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${c.c_username}</strong></td>
      <td>${c.address}</td>
      <td style="color:var(--text2)">${c.bio || "—"}</td>
      <td style="font-family:var(--mono)">${c.phone_number || "—"}</td>
      <td>
        <button 
          class="btn-action btn-delete" 
          onclick="deleteCustomer('${c.c_username}')">
          حذف
        </button>
      </td>
    </tr>
  `).join("");
}

async function addCustomer() {
  const body = {
    c_username: document.getElementById("new-cust-username").value,
    passwordd: document.getElementById("new-cust-pass").value,
    address: document.getElementById("new-cust-address").value,
    phone_number: document.getElementById("new-cust-phone").value,
    bio: document.getElementById("new-cust-bio").value,
  };

  if (!body.c_username || !body.passwordd || !body.address) {
    showToast("يرجى ملء الحقول المطلوبة", "error");
    return;
  }

  const res = await apiPost("/customers", body);

  if (res) {
    showToast("تم إضافة العميل ✓", "success");
    closeModal("addCustomerModal");
    loadCustomers();
    loadDashboard();
  }
}

async function deleteCustomer(username) {
  if (!confirm("هل تريد حذف هذا العميل؟")) return;

  const res = await apiDelete(`/customers/${username}`);

  if (res) {
    showToast("تم الحذف", "success");
    loadCustomers();
    loadDashboard();
  }
}

// ===== STORES =====
async function loadStores() {
  const data = await apiFetch("/stores");
  const tbody = document.getElementById("storeBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(s => `
    <tr>
      <td style="font-family:var(--mono);color:var(--text3)">${s.store_id}</td>
      <td><strong>${s.namee}</strong></td>
      <td>${s.owner_username || s.owner_id}</td>
      <td>
        <button 
          class="btn-action btn-delete" 
          onclick="deleteStore(${s.store_id})">
          حذف
        </button>
      </td>
    </tr>
  `).join("");
}

async function addStore() {
  const body = {
    namee: document.getElementById("new-store-name").value,
    owner_id: +document.getElementById("new-store-owner").value,
  };

  if (!body.namee || !body.owner_id) {
    showToast("يرجى ملء الحقول المطلوبة", "error");
    return;
  }

  const res = await apiPost("/stores", body);

  if (res) {
    showToast("تم إضافة المتجر ✓", "success");
    closeModal("addStoreModal");
    loadStores();
    loadDashboard();
  }
}

async function deleteStore(id) {
  if (!confirm("هل تريد حذف هذا المتجر؟")) return;

  const res = await apiDelete(`/stores/${id}`);

  if (res) {
    showToast("تم الحذف", "success");
    loadStores();
    loadDashboard();
  }
}

// ===== ORDERS =====
async function loadOrders() {
  const data = await apiFetch("/orders");
  const tbody = document.getElementById("orderBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(o => `
    <tr>
      <td style="font-family:var(--mono)">#${o.order_id}</td>
      <td>${o.c_username}</td>
      <td>${o.store_name || o.store_id}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus(${o.order_id}, this.value)">
          <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Shipped" ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
        </select>
      </td>
      <td>${formatDate(o.order_date)}</td>
      <td>
        <button class="btn-action" onclick="viewOrderDetails(${o.order_id})">
          تفاصيل
        </button>
      </td>
    </tr>
  `).join("");
}

async function updateOrderStatus(orderId, status) {
  const res = await apiPut(`/orders/${orderId}/status`, { status });

  if (res) {
    showToast("تم تحديث حالة الطلب ✓", "success");
    loadOrders();
    loadDashboard();
  }
}

async function viewOrderDetails(orderId) {
  showModal("orderDetailModal");

  const body = document.getElementById("orderDetailBody");
  body.innerHTML = "Loading...";

  const data = await apiFetch(`/orders/${orderId}/details`);

  if (!data || data.length === 0) {
    body.innerHTML = "لا توجد تفاصيل";
    return;
  }

  body.innerHTML = `
    <table class="data-table" style="width:100%">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Name</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(d => `
          <tr>
            <td style="font-family:var(--mono)">${d.product_id}</td>
            <td>${d.namee || d.product_name || "—"}</td>
            <td>${d.quantity}</td>
            <td style="color:var(--success)">
              $${parseFloat(d.price || 0).toFixed(2)}
            </td>
            <td style="color:var(--success)">
              $${parseFloat(d.total_price || 0).toFixed(2)}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ===== REVIEWS =====
async function loadReviews() {
  const data = await apiFetch("/reviews");
  const tbody = document.getElementById("reviewBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.product_name || r.product_id}</td>
      <td>${r.c_username}</td>
      <td>${stars(r.rate || 0)}</td>
      <td title="${r.comment_text || ""}">${truncate(r.comment_text, 50)}</td>
      <td>${formatDate(r.review_date)}</td>
    </tr>
  `).join("");
}

// ===== REPORTS =====
async function loadReports() {
  const data = await apiFetch("/reports");
  const tbody = document.getElementById("reportBody");

  if (!data) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">فشل التحميل</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td style="font-family:var(--mono)">${r.report_id}</td>
      <td>${r.c_username}</td>
      <td>${r.store_name || r.store_id}</td>
      <td title="${r.issue_des || ""}">${truncate(r.issue_des, 50)}</td>
      <td>
        <select class="status-select" onchange="updateReportStatus(${r.report_id}, this.value)">
          <option value="Open" ${r.status === "Open" ? "selected" : ""}>Open</option>
          <option value="In Progress" ${r.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Closed" ${r.status === "Closed" ? "selected" : ""}>Closed</option>
        </select>
      </td>
      <td>${formatDate(r.report_date)}</td>
    </tr>
  `).join("");
}

async function updateReportStatus(reportId, status) {
  const res = await apiPut(`/reports/${reportId}/status`, { status });

  if (res) {
    showToast("تم تحديث حالة التقرير ✓", "success");
    loadReports();
    loadDashboard();
  }
}

// ===== ADMINS & LOGS =====
async function loadAdmins() {
  const admins = await apiFetch("/admins");
  const adminBody = document.getElementById("adminBody");

  if (admins) {
    adminBody.innerHTML = admins.map(a => `
      <tr>
        <td style="font-family:var(--mono)">${a.admin_id}</td>
        <td style="color:var(--text3)">••••••••</td>
      </tr>
    `).join("");
  }

  const logs = await apiFetch("/logs");
  const logBody = document.getElementById("logBody");

  if (logs) {
    logBody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-family:var(--mono)">${l.log_id}</td>
        <td>${l.admin_id}</td>
        <td title="${l.action_text || ""}">${truncate(l.action_text, 50)}</td>
        <td style="font-size:12px;color:var(--text3)">
          ${formatTimestamp(l.log_timestamp)}
        </td>
      </tr>
    `).join("");
  }
}

// ===== HELPERS =====
function truncate(str, n) {
  if (!str) return "—";
  return str.length > n ? str.substring(0, n) + "…" : str;
}

function formatDate(d) {
  if (!d) return "—";

  return new Date(d).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatTimestamp(ts) {
  if (!ts) return "—";

  return new Date(ts).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", () => {
  setStatus(false, "Connecting...");
  loadDashboard();
});