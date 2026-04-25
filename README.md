# 🏙️ CivicPulse — Smart City Complaint Management System

A full-stack MERN application with JWT Authentication and integrated DSA algorithms.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | **JWT Auth** |
| Styling | Custom CSS with design tokens |
| DSA | BubbleSort, InsertionSort, SelectionSort, Searching, Array Operations |

---

## ⚙️ Setup Instructions


###  Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your JWT Admin SDK credentials and MongoDB URI
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

---

###  Frontend Setup

```bash
cd frontend
cp  .env
# Fill in your JWT Web App config
npm install
npm start
```

Frontend runs on: `http://localhost:1510`

---
## 👥 User Roles

| Role | Access |
|------|--------|
| **Citizen** | Submit complaints, view history, track status |
| **Authority** | View all complaints, update status, assign officers |
| **Admin** | Everything + manage user roles, delete complaints |

> To change a user's role, log in as admin and go to **Admin Panel → Users**

---

## 📄 API Endpoints

### Auth
- `GET /api/auth/me` — Get current user (auto-creates in MongoDB on first login)
- `PUT /api/auth/profile` — Update profile

### Complaints
- `POST /api/complaints` — Submit complaint
- `GET /api/complaints/my` — Citizen's own complaints
- `GET /api/complaints/all` — All complaints (authority/admin) with DSA sort/search
- `GET /api/complaints/search/:id` — Binary search by complaintId
- `PATCH /api/complaints/:id/status` — Update status
- `PATCH /api/complaints/:id/assign` — Assign to officer
- `PATCH /api/complaints/:id/upvote` — Upvote/downvote
- `DELETE /api/complaints/:id` — Delete (admin only)

### Admin
- `GET /api/admin/users` — All users
- `PATCH /api/admin/users/:id/role` — Change user role
- `GET /api/admin/stats` — Dashboard analytics

### Contact
- `POST /api/contact` — Submit contact message
- `GET /api/contact` — All messages (admin only)

---

## 🌐 Pages Overview

1. **Landing Page** — Hero, features, stats, CTA
2. **Login** — Email/Password + Google + GitHub OAuth
3. **Register** — Email/Password + Google OAuth
4. **Citizen Home** — 3-step complaint form with undo (Stack DSA)
5. **Authority Dashboard** — KMP search + InsertionSort + status management
6. **Admin Panel** — User management, role changes, analytics
7. **Services** — All 8 municipal service categories with SLA
8. **History** — Personal complaint history with Binary Search + KMP
9. **Contact** — Contact form with emergency numbers

---

## 🔒 Security

- Role-based access control (RBAC) on all protected routes
- MongoDB indexed queries for performance
- Input validation on all API endpoints

---

## 👨‍💻 Built By

**Manjot Kaur** — BTech CSE, Lovely Professional University  
Student ID: 12412384  
Stack: React • Node.js • Express • MongoDB • Firebase • DSA
