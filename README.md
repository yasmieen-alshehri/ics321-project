# E-Commerce DB System

## 1. What This Project Is

This is a simple e-commerce database app.

It has three parts:

- Frontend: static HTML, CSS, and JavaScript
- Backend: Node.js and Express
- Database: remote MySQL

The frontend shows pages like Dashboard, Products, Orders, Reports, Customers, Stores, Reviews, and Admin Logs. The backend connects to MySQL and provides the API used by the frontend.

## 2. Create `backend/.env`

The backend needs database settings in a file named `backend/.env`.

First go to the backend folder:

```powershell
cd backend
```

Copy the example file:

```powershell
copy .env.example .env
```

Open `.env` and fill in your real database values:

```env
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

Do not commit real database credentials. Keep them only in `.env`.

## 3. Run The Backend

From the project root:

```powershell
cd backend
npm install
npm start
```

The backend should run at:

```text
http://localhost:5000
```

Successful output should include:

```text
Server running on http://localhost:5000
Connected to MySQL
```

## 4. Run The Frontend

Open a second terminal from the project root:

```powershell
cd frontend
npx http-server -p 8080
```

If `http-server` is not installed, use the same command:

```powershell
npx http-server -p 8080
```

Then open:

```text
http://127.0.0.1:8080
```

## 5. Common Errors

### Backend says database is not connected

Check:

- `backend/.env` exists.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correct.
- The remote MySQL database is running.
- The remote MySQL database allows your computer to connect.

### Frontend does not load data

Check:

- The backend is running.
- The backend URL is `http://localhost:5000`.
- `frontend/script.js` has:

```js
const API = "http://localhost:5000";
```

### `npm` does not run in PowerShell

Use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd start
```

### Log files

Generated `*.log` files should not be committed.
