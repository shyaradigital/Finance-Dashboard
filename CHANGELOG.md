# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-XX

### Added
- Complete full-stack Finance Tracker application
- React frontend with TypeScript and Vite
- Express backend API with TypeScript
- PostgreSQL database with Prisma ORM
- User authentication and authorization (JWT)
- Transaction management (income/expense tracking)
- Budget planning and tracking
- Account management (bank accounts, credit/debit cards)
- Investment tracking (stocks, mutual funds, SIPs, etc.)
- Secure vault for sensitive documents
- Commitments tracking (bills, subscriptions, loans)
- Analytics dashboard with charts and insights
- Automation rules for transaction categorization
- Settings page with user-defined options
- Initial setup/onboarding flow for new users
- Render deployment configuration (`render.yaml`)
- Comprehensive deployment documentation
- Secret generation script

### Features
- **User-Controlled Data**: All data is user-defined and stored in database, no hardcoded values
- **Custom Options**: Users can define their own investment types, account types, categories, etc.
- **Responsive Design**: Mobile-friendly UI with shadcn/ui components
- **Real-time Analytics**: Dashboard with cash flow charts, category spending, and insights
- **Secure Storage**: Encrypted vault for sensitive information
- **Budget Alerts**: Automatic budget tracking with threshold alerts
- **Export Functionality**: Export transactions and reports to Excel/PDF

### Technical
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- Authentication: JWT with refresh tokens
- Security: bcrypt password hashing, rate limiting, CORS protection
- Deployment: Render-ready with automatic database migrations

### Documentation
- README.md with setup instructions
- DEPLOYMENT.md with detailed deployment guide
- RENDER_QUICK_START.md for quick deployment
- DEPLOYMENT_CHECKLIST.md for pre-deployment verification
- API documentation in backend README

### Fixed
- 401 authentication error handling
- Token refresh mechanism
- Credit card due date validation (numeric day of month)
- Initial setup tab visibility
- DOM nesting warnings
- React Query cache invalidation on logout
- Database cascade deletes for user data

