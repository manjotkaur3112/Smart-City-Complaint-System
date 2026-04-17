# 🏙️ CivicPulse — Smart City Complaint Management System

A full-stack MERN application with Firebase Authentication and integrated DSA algorithms.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | **Firebase Auth** (Email/Password + Google + GitHub) |
| Styling | Custom CSS with design tokens |
| DSA | BubbleSort, InsertionSort, SelectionSort, Searching, Array Operations |

---

## 📁 Project Structure

```
civicpulse/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # Firebase token verification
│   │   └── firebaseAdmin.js # Firebase Admin SDK init
│   ├── models/
│   │   ├── User.js          # MongoDB User model
│   │   ├── Complaint.js     # MongoDB Complaint model
│   │   └── Contact.js       # Contact messages
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
	│   │   ├── complaints.js    # CRUD + DSA (InsertionSort, KMP, BinarySearch)
│   │   ├── admin.js         # Admin endpoints
│   │   └── contact.js       # Contact form
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── dsa/index.js     # All DSA algorithms
    │   ├── context/AuthContext.js  # Firebase Auth context
    │   ├── utils/api.js     # Axios with Firebase token
    │   ├── firebase.js      # Firebase config
    │   ├── styles/global.css
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── Footer.js
    │   └── pages/
    │       ├── Landing.js         # 1. Landing Page
    │       ├── Login.js           # 2. Auth — Login
    │       ├── Register.js        # 3. Auth — Register
    │       ├── CitizenHome.js     # 4. Citizen — Submit Complaint
    │       ├── AuthorityDashboard.js  # 5. Authority Dashboard
    │       ├── AdminPanel.js      # 6. Admin Panel
    │       ├── Services.js        # 7. Services Page
    │       ├── History.js         # 8. History Page
    │       ├── Contact.js         # 9. Contact Page
    │       └── DSADemo.js         # 10. Interactive DSA Visualizer
    └── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 — Firebase Setup

1. Go to [Firebase Console](https:
2. Create a new project
3. Enable **Authentication** → Sign-in methods:
   - Email/Password ✅
   - Google ✅
   - GitHub ✅ (optional)
4. Go to **Project Settings → Your Apps → Add Web App**
5. Copy the config for frontend `.env`
6. Go to **Project Settings → Service Accounts → Generate new private key**
7. Use the values for backend `.env`

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your Firebase Admin SDK credentials and MongoDB URI
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in your Firebase Web App config
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🧠 DSA Algorithms Implemented

### Sorting
| Algorithm | Complexity | Used In |
|-----------|-----------|---------|
| **Merge Sort** | O(n log n) | Dashboard sort by priority/date, History page |
| **Quick Sort** | O(n log n) avg | DSA Demo visualizer |

### Searching
| Algorithm | Complexity | Used In |
|-----------|-----------|---------|
| **Linear Search** | O(n) | Admin user search |
| **Binary Search** | O(log n) | Search complaint by ID |
| **KMP String Search** | O(n+m) | Full-text search on complaints |

### Array Operations
| Operation | Complexity | Used In |
|-----------|-----------|---------|
| **Frequency Map** | O(n) | Category count in dashboard |
| **Group By** | O(n) | Group complaints by status |
| **Deduplicate** | O(n) | Remove duplicate complaints |
| **Sliding Window** | O(n) | Recent N-days complaints |

### Data Structures
| Structure | Used In |
|-----------|---------|
| **Stack (Undo)** | Complaint form undo history |
| **Hash Set** | Deduplication (O(1) lookup) |

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
10. **DSA Demo** — Interactive visualizer for all 10 DSA algorithms

---

## 🔒 Security

- Firebase ID tokens verified server-side using Firebase Admin SDK
- Role-based access control (RBAC) on all protected routes
- MongoDB indexed queries for performance
- Input validation on all API endpoints

---

## 👨‍💻 Built By

**Manjot Kaur** — BTech CSE, Lovely Professional University  
Student ID: 12412384  
Stack: React • Node.js • Express • MongoDB • Firebase • DSA
