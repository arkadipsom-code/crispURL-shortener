# CrispURL | Low-Latency Scalable Link Shortener

CrispURL is a high-performance, full-stack URL shortening and redirection engine engineered with a modular, decoupled architecture. The system uses a **Counter-to-Base62 compression algorithm** and an isolated database transaction model to guarantee data integrity, zero token collisions, and sub-millisecond route resolution.

## 🚀 Live Links
* **Frontend Web Application:** [https://crisp-url-shortener.vercel.app](https://crisp-url-shortener.vercel.app)
* **Backend API Gateway:** [https://crispurl-shortener-backend.onrender.com](https://crispurl-shortener-backend.onrender.com)

---

## 🛠️ Tech Stack & Infrastructure
* **Frontend:** Single Page Application (SPA) built with semantic HTML5, modern vanilla JavaScript (ES6+), and responsive CSS utilizing **Tailwind CSS**. Hosted on **Vercel**.
* **Backend:** Event-driven REST API powered by **Node.js** and **Express.js**, implementing modular Routing, Controller, and Service layer patterns. Hosted on **Render**.
* **Database:** Cloud-managed, serverless **Neon PostgreSQL** cluster optimized with explicit connection pooling and structured indexing.

---

## 🧭 System Core Workflow

The system maintains a clean separation of concerns across two distinct runtime pathways:

### 1. The Shortening Workflow (Write Path)
* The client sends a `POST` request containing a raw `longUrl` to `/api/v1/urls/shorten`.
* The controller validates the protocol (`http:`/`https:`) and structure of the payload.
* **Deduplication Check:** The service layer queries the database. If the `long_url` already exists, it instantly returns the existing record, eliminating redundant rows.
* **Atomic Transaction:** If it is a new URL, a database transaction block (`BEGIN`/`COMMIT`) opens:
  1. Inserts the `long_url` to let PostgreSQL generate a sequentially unique 64-bit numerical integer `id`.
  2. Passes the integer `id` to the specialized Base62 utility module to compute a highly compressed alphanumeric key string.
  3. Updates the specific row, writing the computed string into the `short_code` column explicitly.
* The API returns the completed short URL link string to the client interface.

### 2. The Redirection Workflow (Read Path)
* A browser navigates to the short path gateway: `https://crispurl-shortener-backend.onrender.com/:shortCode`.
* The server intercepts the dynamic `:shortCode` path parameter token.
* The service runs an optimized lookup query directly checking the indexed text column `short_code`.
* If found, the application increments the click metric log count asynchronously in the background via a fast atomic update query.
* The server responds with an explicit **HTTP 302 Temporary Redirect** header, pointing the client browser to the destination `long_url`.

---

## 📐 Computational Mathematics: Base62 Compression

A core design choice of CrispURL is utilizing mathematical base conversion instead of arbitrary hash slicing.

### Why Base62?
Standard URL formatting restricts characters to alphanumeric symbols to avoid character escaping issues. We use an alphabet pool size of exactly 62 unique elements:
* `0-9` (10 symbols)
* `a-z` (26 symbols)
* `A-Z` (26 symbols)
* **Total Base ($B$) = 62**

### Capacity & Key-Space Math
The unique token space capacity scales exponentially based on the allowed length ($N$) of the short code:
* For a **6-character token length**:
  $$62^6 = 56,800,235,584 \text{ unique combinations (56.8 Billion)}$$
* For a **7-character token length**:
  $$62^7 = 3,521,614,606,208 \text{ unique combinations (3.5 Trillion)}$$

Even at an extreme production load of generating **1 million new shortened links every single day**, a 6-character short code space will take over **155 years to completely exhaust**, demonstrating maximum storage efficiency.

### Encoding Logic Algorithm (Base-10 to Base-62)
To convert a database numerical integer ID into a string, the system performs a successive modulo and division routine:

### Conversion Process

**Given ID:** `12593`

1. Calculate the remainder when divided by 62:
   - `12593 % 62 = 7` → `Alphabet[7] = '7'`

2. Divide by 62:
   - `12593 / 62 = 203`

3. Repeat the process with the quotient:
   - `203 % 62 = 17` → `Alphabet[17] = 'h'`
   - `203 / 62 = 3`

4. Continue with the new quotient:
   - `3 % 62 = 3` → `Alphabet[3] = '3'`
   - `3 / 62 = 0` (Loop terminates)

### Result String

The final encoded string is: **"3h7"**.

---

## 🗄️ Database Schema & Optimization

The relational system uses a highly optimized physical table map built in PostgreSQL:

```sql
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crucial Performance Optimization Index
CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);
```
---
## Engineering Rationale for Indexing

By applying a **UNIQUE** constraint and an explicit index on the `short_code` column, PostgreSQL generates a highly optimized underlying **B-Tree Data Structure**.

Without an index, verifying a short code during a redirection request requires a **Full Table Scan**, which drops to `$O(N)$` linear time complexity.

With the B-Tree index map applied, searching for a text code drops to `$O(\log N)$` logarithmic time complexity. Even across millions of records, row resolution requires only a few node jumps, ensuring sub-millisecond response lookups under load.

---
## Modular Directory Blueprint
## Backend
- **config/**
  - `db.js` — Secure connection pooling configuration for Neon Postgres
- **controllers/**
  - `url.controller.js` — Payload validation, route handling logic, and status code injection
- **routes/**
  - `url.route.js` — Isolated endpoint mapping parameters
- **services/**
  - `url.service.js` — SQL transaction handlers and data mutation commands
- **utils/**
  - `base62.js` — Decoupled core mathematical compression engine
- `server.js` — Express gateway configuration, global CORS rules, and port bindings

## Frontend
- `index.html` — Tailwind client presentation UI and async fetch execution scripts
- `app.js`
