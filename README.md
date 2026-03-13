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
