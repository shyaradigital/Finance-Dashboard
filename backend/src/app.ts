import express from "express";
import cors from "cors";
import env from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { generalRateLimiter } from "./middleware/rateLimiter";
import authRoutes from "./auth/auth.routes";
import categoriesRoutes from "./categories/categories.routes";
import accountsRoutes from "./accounts/accounts.routes";
import cardsRoutes from "./cards/cards.routes";
import transactionsRoutes from "./transactions/transactions.routes";
import budgetsRoutes from "./budgets/budgets.routes";
import commitmentsRoutes from "./commitments/commitments.routes";
import investmentsRoutes from "./investments/investments.routes";
import vaultRoutes from "./vault/vault.routes";
import analyticsRoutes from "./analytics/analytics.routes";
import settingsRoutes from "./settings/settings.routes";
import automationRoutes from "./automation/automation.routes";

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
console.log("📋 Registering API routes...");
try {
  app.use("/api/auth", authRoutes);
  console.log("  ✓ /api/auth routes registered");
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/accounts", accountsRoutes);
  app.use("/api/cards", cardsRoutes);
  app.use("/api/transactions", transactionsRoutes);
  app.use("/api/budgets", budgetsRoutes);
  app.use("/api/commitments", commitmentsRoutes);
  app.use("/api/investments", investmentsRoutes);
  app.use("/api/vault", vaultRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/automation", automationRoutes);
  console.log("✅ All API routes registered successfully");
} catch (error) {
  console.error("❌ Error registering routes:", error);
  throw error;
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

