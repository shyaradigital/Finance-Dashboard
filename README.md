# FinanceFlow - Personal Finance Tracker

A comprehensive personal finance management application built with React, TypeScript, and Node.js. Track expenses, manage budgets, monitor investments, and gain insights into your financial health.

## Features

- 💰 **Transaction Management** - Track income and expenses with categories
- 📊 **Budget Planning** - Set monthly budgets with automatic tracking and alerts
- 💳 **Account Management** - Manage bank accounts, credit cards, and debit cards
- 📈 **Investment Tracking** - Monitor investments, SIPs, and calculate net worth
- 🔒 **Secure Vault** - Store sensitive documents and information securely
- 📅 **Commitments** - Track upcoming bills, subscriptions, and loan payments
- 🤖 **Automation Rules** - Automate categorization and alerts
- 📱 **Analytics Dashboard** - Visual insights into your financial patterns

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **React Hook Form + Zod** - Form validation

### Backend
- **Node.js** with Express
- **TypeScript**
- **Prisma ORM** - Database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Project Structure

```
.
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── backend/               # Backend API
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── transactions/  # Transaction management
│   │   ├── budgets/       # Budget management
│   │   ├── accounts/      # Account management
│   │   ├── analytics/     # Analytics endpoints
│   │   └── ...
│   └── prisma/            # Database schema
└── public/                # Static assets
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use the provided Render database)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your values
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens (32+ characters)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (32+ characters)
- `ENCRYPTION_KEY` - Key for vault encryption (32+ characters)
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 3000)

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

### Quick Start (Both Frontend & Backend)

Use the provided PowerShell script to start both servers:

```powershell
.\run-local.ps1
```

This script will:
- Check for Node.js and npm
- Install dependencies if needed
- Generate Prisma client if needed
- Start backend in a separate window
- Start frontend in the current window

## API Documentation

The backend API is available at `http://localhost:3000/api`

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `DELETE /api/auth/account` - Delete account

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/summary` - Budget summary

### Accounts & Cards
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `GET /api/cards/credit` - List credit cards
- `GET /api/cards/debit` - List debit cards

### Analytics
- `GET /api/analytics/dashboard` - Dashboard summary
- `GET /api/analytics/cash-flow` - Cash flow data
- `GET /api/analytics/insights` - Smart insights
- `GET /api/analytics/net-worth` - Net worth calculation

See `backend/README.md` for complete API documentation.

## Building for Production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend
npm run build
npm start
```

## Deployment

### Deploy to Render (Recommended)

We've included a `render.yaml` file for easy deployment to Render.

**Quick Start:**
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and deploy everything

**See detailed instructions:**
- [RENDER_QUICK_START.md](./RENDER_QUICK_START.md) - 5-minute quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide with troubleshooting

**What gets deployed:**
- ✅ PostgreSQL database (automatically created)
- ✅ Backend API service (Node.js/Express)
- ✅ Frontend static site (React/Vite)
- ✅ Database migrations (run automatically)

**Required Environment Variables:**
- Backend: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `ENCRYPTION_KEY` (optional)
- Frontend: `VITE_API_URL`

Generate secure secrets:
```bash
node scripts/generate-secrets.js
```

### Manual Deployment

#### Frontend (Vercel/Netlify/Static Hosting)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set `VITE_API_URL` environment variable to your backend URL

#### Backend (Render/Heroku/AWS)
1. Connect your repository to your hosting service
2. Set environment variables in dashboard
3. Set build command: `cd backend && npm install && npm run build && npm run prisma:generate`
4. Set start command: `cd backend && npm run prisma:migrate:deploy && npm start`

## Environment Variables

### Frontend
No environment variables required for frontend (API URL can be configured in code if needed).

### Backend
See `backend/.env.example` for all required variables.

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
