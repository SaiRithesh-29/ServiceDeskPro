# ServiceDesk Pro - IT Helpdesk & Asset Management Platform

A production-quality IT helpdesk and asset management platform built with the MERN stack. This is a complete SaaS application designed for enterprise IT support operations.

## 🌟 Features

### Core Functionality
- **Complete Ticket Management** - Create, track, and resolve support tickets with full workflow
- **Asset Management** - Complete IT asset lifecycle management with history tracking
- **SLA System** - Real-time SLA monitoring with business hours calculation
- **Knowledge Base** - Self-service portal with article search and suggestions
- **User & Team Management** - Complete RBAC with role-based access control
- **Audit Logging** - Complete audit trail for compliance
- **Notifications** - Real-time notifications for ticket events
- **Analytics & Reports** - Comprehensive dashboards and analytics

### Technical Features
- JWT authentication with refresh token flow
- Role-based access control (5 roles)
- Responsive design (mobile, tablet, desktop)
- Real-time SLA tracking with business hours
- File attachment support
- Advanced search and filtering
- Pagination for large datasets
- Dark mode support

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router** - Routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with Zod validation
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Recharts** - Data visualization

### Backend Stack
- **Node.js + Express.js** - HTTP server
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Zod** - Validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Rate Limiting** - API protection

## 📁 Project Structure

```
ServiceDeskpro/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── features/               # Feature modules
│   │   ├── services/               # API clients
│   │   ├── context/                # React context (Auth)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── types/                  # TypeScript types
│   │   ├── utils/                  # Utilities
│   │   ├── styles/                 # CSS/Tailwind
│   │   ├── App.tsx                 # Main component
│   │   └── main.tsx                # Entry point
│   └── vite.config.ts
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── models/                 # Mongoose schemas
│   │   ├── routes/                 # API routes
│   │   ├── services/               # Business logic
│   │   ├── middleware/             # Express middleware
│   │   ├── validators/             # Zod schemas
│   │   ├── jobs/                   # Background jobs
│   │   ├── utils/                  # Utilities
│   │   ├── config/                 # Configuration
│   │   ├── app.ts                  # Express app
│   │   ├── server.ts               # Server setup
│   │   └── index.ts                # Entry point
│   ├── tests/                      # Test files
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                           # Documentation
├── scripts/                        # Utility scripts
├── .env.example
├── README.md
└── PROJECT_PLAN.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ServiceDeskpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Server (.env):
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your values
   ```
   
   Client (.env.local):
   ```bash
   cp client/.env.example client/.env.local
   # Edit client/.env.local if needed
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

### Running the Application

**Development Mode:**
```bash
npm run dev
```

This will start both server (port 5000) and client (port 5173) concurrently.

**Production Build:**
```bash
npm run build
```

**Run Production:**
```bash
npm run start:server
npm run start:client
```

## 🔐 Demo Credentials

After seeding the database, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| IT Manager | manager@example.com | password123 |
| Technician | tech@example.com | password123 |
| Employee | employee@example.com | password123 |
| Asset Manager | assetmgr@example.com | password123 |

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - List tickets (filtered, paginated)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/status` - Change status
- `POST /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/comments` - Add comment
- `POST /api/tickets/:id/work-logs` - Add work log
- `POST /api/tickets/:id/attachments` - Upload attachment

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets/:id/assign` - Assign asset
- `GET /api/assets/:id/history` - Asset history

### Other Endpoints
- `GET /api/knowledge-base` - Knowledge articles
- `GET /api/users` - User management
- `GET /api/teams` - Team management
- `GET /api/sla` - SLA policies
- `GET /api/reports/*` - Analytics and reports
- `GET /api/audit-logs` - Audit logs
- `GET /api/notifications` - Notifications
- `GET /api/settings` - System settings

## 🔑 Key Features Explained

### Role-Based Access Control
The application has 5 roles with different permissions:
- **Admin** - Full system access
- **IT Manager** - Manage tickets, assets, users, teams
- **Technician** - Work on assigned tickets
- **Employee** - Create and track own tickets
- **Asset Manager** - Manage asset inventory

### SLA System
- Automatic SLA deadline calculation
- Business hours consideration
- Real-time breach detection
- Escalation rules based on time/priority
- SLA compliance reporting

### Ticket Workflow
```
Open → Assigned → In Progress → Pending → Resolved → Closed
                    ↓
                 Escalated
```

### Asset Lifecycle
```
Procured → Available → Assigned → Under Repair → Retired
```

## 🧪 Testing

Run backend tests:
```bash
npm run test --workspace=server
```

## 📊 Database Schema

Key collections:
- **Users** - System users with roles
- **Tickets** - Support tickets with full workflow
- **Assets** - IT asset inventory
- **KnowledgeArticles** - Self-service content
- **SLAPolicies** - SLA rules and thresholds
- **Notifications** - User notifications
- **AuditLogs** - Activity audit trail
- **Departments** - Organizational structure
- **Teams** - IT support teams

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Refresh token mechanism
- RBAC enforcement on backend
- Input validation with Zod
- Rate limiting on API
- Helmet security headers
- CORS configuration
- File upload validation

## 🚀 Performance Optimizations

- Server-side pagination
- Database query optimization
- MongoDB indexing
- React Query caching
- Lazy loading components
- Debounced search
- Asset optimization

## 📱 Responsive Design

Fully responsive across:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎯 Next Steps / TODO

High priority enhancements:
- [ ] Email notifications
- [ ] Advanced report builder
- [ ] Time tracking integration
- [ ] Multi-language support
- [ ] API rate limiting per user
- [ ] WebSocket for real-time updates
- [ ] File preview functionality
- [ ] Advanced search with Elasticsearch
- [ ] Integration with AD/LDAP
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a capstone project. For improvements:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Educational Use Only

## 📧 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ as a production-quality capstone project**
