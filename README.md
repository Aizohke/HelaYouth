# 🏦 Hela Youth Self Help Group
### *The Billionaire Club* — Full-Stack Web Application

A comprehensive MERN stack web application for a youth self-help group featuring member management, contribution tracking, project monitoring, and a content hub — secured with Clerk Authentication.

---

## 📁 Project Structure

```
hela-youth/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.js # Clerk + role guards
│   ├── models/
│   │   ├── User.js           # Member schema
│   │   ├── Contribution.js   # Financial entries
│   │   ├── Project.js        # Group projects
│   │   └── index.js          # Article, Event, SiteContent
│   ├── routes/
│   │   ├── auth.routes.js    # Sync + profile
│   │   ├── member.routes.js  # Portfolio
│   │   ├── admin.routes.js   # Admin management
│   │   ├── contribution.routes.js
│   │   ├── content.routes.js # Projects, events, site content
│   │   └── article.routes.js # Mindset hub
│   ├── server.js             # Entry point
│   └── .env.example
│
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   └── shared/
    │   │       └── index.jsx  # Reusable UI components
    │   ├── context/
    │   │   └── UserContext.jsx # Global user state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── MemberPortfolio.jsx
    │   │   ├── AdminDashboard.jsx  # Full admin with sub-routes
    │   │   ├── MindsetHub.jsx
    │   │   ├── ArticleDetail.jsx
    │   │   ├── RecruitmentPage.jsx
    │   │   └── index.jsx       # Auth pages, Pending, 404
    │   ├── services/
    │   │   └── api.js          # Axios API service layer
    │   ├── App.jsx             # Router + route guards
    │   ├── main.jsx
    │   └── index.css           # Tailwind + custom components
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** Atlas account (free tier works)
- **Clerk** account (free tier works)

---

## ⚙️ Environment Setup

### 1. Clerk Setup

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Enable **Email/Password** sign-in method
3. From the Clerk Dashboard → **API Keys**, copy:
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

### 2. MongoDB Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a cluster
2. Create a database user with read/write permissions
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Copy the **connection string** (replace `<username>` and `<password>`)

---

## 🔧 Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/hela-youth
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Install dependencies and start:

```bash
npm install
npm run dev        # Development (with nodemon)
npm start          # Production
```

The API will run at **http://localhost:5000**

---

## 🎨 Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 🔐 Role & Auth System

### How it works

| Step | Action |
|------|--------|
| 1 | User signs up via Clerk |
| 2 | After sign-up, frontend calls `POST /api/auth/sync` |
| 3 | MongoDB user is created with `status: "pending"` |
| 4 | **First user ever** is automatically set as `admin` + `approved` |
| 5 | Admin logs in → approves members from `/admin/members` |
| 6 | Approved members gain access to their portfolio |

### Roles

| Role | Permissions |
|------|-------------|
| `pending` | Can sign in, sees "Pending Approval" page |
| `member` (approved) | Portfolio, Mindset Hub, write articles |
| `admin` (approved) | All of the above + Admin Dashboard |

### Admin Dashboard Tabs

| Tab | Features |
|-----|----------|
| **Overview** | Stats: total members, funds, pending approvals |
| **Members** | Approve/Reject, change roles, add contributions |
| **Finance** | Per-member contribution history, add entries |
| **Projects** | Create/edit/delete projects with progress tracking |
| **Events** | Create/edit/delete upcoming events |
| **Content** | Edit hero text, Quote of the Week |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/sync` | Clerk | Create/sync user after sign-up |
| GET | `/api/auth/me` | Clerk | Get current user |

### Members
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/members/me` | approved | Full portfolio + contributions |
| PATCH | `/api/members/me` | approved | Update bio/phone |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET | `/api/admin/members` | admin | Paginated member list |
| PATCH | `/api/admin/members/:id/status` | admin | Approve/reject |
| PATCH | `/api/admin/members/:id/role` | admin | Change role |

### Contributions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contributions/my` | approved | Own contributions |
| GET | `/api/contributions/summary` | public | Fund totals |
| POST | `/api/contributions` | admin | Add contribution |
| GET | `/api/contributions/member/:id` | admin | Member's history |
| DELETE | `/api/contributions/:id` | admin | Delete entry |

### Content
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/content/projects` | public | Active projects |
| POST/PUT/DELETE | `/api/content/projects/:id` | admin | Manage projects |
| GET | `/api/content/events` | public | Upcoming events |
| POST/PUT/DELETE | `/api/content/events/:id` | admin | Manage events |
| GET | `/api/content/site/:key` | public | Get site content |
| PUT | `/api/content/site/:key` | admin | Update site content |

**Site content keys:**
- `quote_of_week` — `{ text, author }`
- `hero_content` — `{ title, subtitle }`

### Articles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/articles` | public | List articles |
| GET | `/api/articles/:slug` | public | Single article |
| POST | `/api/articles` | approved | Create article |
| PUT | `/api/articles/:id` | author/admin | Edit |
| DELETE | `/api/articles/:id` | author/admin | Delete |
| POST | `/api/articles/:id/like` | approved | Toggle like |

---

## 🗄️ Database Schemas

### User
```js
{ clerkId, email, firstName, lastName, phone, profileImageUrl,
  role: 'member'|'admin', status: 'pending'|'approved'|'rejected',
  bio, joinedAt, approvedAt, approvedBy }
```

### Contribution
```js
{ member: ObjectId, amount: Number, currency, 
  type: 'monthly'|'special'|'fine'|'registration',
  description, recordedBy, contributionDate, receiptNumber }
```

### Project
```js
{ title, description, targetAmount, raisedAmount, currency,
  status: 'planning'|'ongoing'|'completed'|'paused',
  category, startDate, endDate, createdBy, isPublic, order }
```

### Article
```js
{ title, content, excerpt, author: ObjectId, category, tags,
  isPublished, likes: [ObjectId], views, readTime, slug }
```

### Event
```js
{ title, description, eventDate, endDate, location,
  isOnline, meetingLink, type, isPublic, createdBy, attendees }
```

### SiteContent
```js
{ key: String (unique), value: Mixed, updatedBy }
```

---

## 📱 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Homepage with stats, projects, events |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk sign-up |
| `/recruitment` | Public | Join CTA + Constitution download |
| `/mindset` | Public | Article hub |
| `/mindset/:slug` | Public | Article detail |
| `/pending` | Signed-in | Pending approval screen |
| `/portfolio` | Approved member | Personal savings dashboard |
| `/admin/*` | Admin only | Full admin suite |

---

## 📄 Constitution PDF

Place your PDF file at:
```
frontend/public/hela-youth-constitution.pdf
```

The "Download Constitution" button on the Recruitment page links directly to this file.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Auth | Clerk (sign-in, sign-up, JWT sessions) |
| Icons | Lucide React |
| Backend | Node.js, Express 4, ES Modules |
| Database | MongoDB Atlas, Mongoose 8 |
| Fonts | Playfair Display, DM Sans (Google Fonts) |

---

## 🚢 Deployment

### Backend (e.g. Railway, Render, Heroku)
1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Update `CLIENT_URL` to your frontend domain

### Frontend (e.g. Vercel, Netlify)
1. Set `VITE_CLERK_PUBLISHABLE_KEY` in your deployment dashboard
2. Set `VITE_API_URL` to your backend's production URL
3. In Clerk Dashboard → **Redirect URLs**, add your production domain

### Clerk Production Checklist
- [ ] Add production domain to **Allowed Origins**
- [ ] Add production frontend URL to **Redirect URLs**
- [ ] Switch to production API keys

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with 💚 for the Hela Youth Self Help Group — The Billionaire Club*
