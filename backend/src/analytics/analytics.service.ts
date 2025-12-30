import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import {
  getStartOfMonth,
  getEndOfMonth,
  getStartOfQuarter,
  getEndOfQuarter,
  addMonths,
  isWithinDays,
  getDaysUntil,
} from "../utils/dateHelpers";

export class AnalyticsService {
  async getDashboardSummary(userId: string) {
    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = getEndOfMonth(now);

    // Get all accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    // Calculate net balance (sum of all account balances)
    const netBalance = accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );

    // Get monthly income
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const monthlyIncome = Number(incomeResult._sum.amount || 0);

    // Get monthly expenses
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "expense",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const monthlyExpenses = Number(expenseResult._sum.amount || 0);

    // Calculate savings
    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // Get previous month for comparison
    const prevMonthStart = getStartOfMonth(addMonths(now, -1));
    const prevMonthEnd = getEndOfMonth(addMonths(now, -1));

    const prevIncomeResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income",
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const prevIncome = Number(prevIncomeResult._sum.amount || 0);
    const incomeChange = prevIncome > 0
      ? ((monthlyIncome - prevIncome) / prevIncome) * 100
      : 0;

    // Get previous month expenses
    const prevExpenseResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "expense",
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const prevExpenses = Number(prevExpenseResult._sum.amount || 0);

    // Get previous month net balance
    const prevNetBalance = netBalance - (monthlyIncome - monthlyExpenses) + (prevIncome - prevExpenses);

    return {
      netBalance: Number(netBalance.toFixed(2)),
      monthlyIncome: Number(monthlyIncome.toFixed(2)),
      monthlyExpenses: Number(monthlyExpenses.toFixed(2)),
      savings: Number(savings.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(2)),
      incomeChange: Number(incomeChange.toFixed(2)),
      balanceChange: Number((netBalance - prevNetBalance).toFixed(2)),
    };
  }

  async getCashFlow(userId: string, period: "month" | "quarter" = "month") {
    const now = new Date();
    const data: Array<{ name: string; income: number; expense: number }> = [];

    if (period === "month") {
      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthStart = getStartOfMonth(addMonths(now, -i));
        const monthEnd = getEndOfMonth(addMonths(now, -i));
        const monthName = monthStart.toLocaleDateString("en-US", {
          month: "short",
        });

        const income = await prisma.transaction.aggregate({
          where: {
            userId,
            type: "income",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        const expense = await prisma.transaction.aggregate({
          where: {
            userId,
            type: "expense",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        data.push({
          name: monthName,
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
        });
      }
    } else {
      // Get last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const quarterStart = getStartOfQuarter(addMonths(now, -i * 3));
        const quarterEnd = getEndOfQuarter(addMonths(now, -i * 3));
        const quarterName = `Q${Math.floor(quarterStart.getMonth() / 3) + 1}`;

        const income = await prisma.transaction.aggregate({
          where: {
            userId,
            type: "income",
            date: { gte: quarterStart, lte: quarterEnd },
          },
          _sum: { amount: true },
        });

        const expense = await prisma.transaction.aggregate({
          where: {
            userId,
            type: "expense",
            date: { gte: quarterStart, lte: quarterEnd },
          },
          _sum: { amount: true },
        });

        data.push({
          name: quarterName,
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
        });
      }
    }

    return data;
  }

  async getCategorySpend(userId: string) {
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const transactions = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categories = await prisma.category.findMany({
      where: {
        userId,
        type: "expense",
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return transactions
      .map((t) => {
        const category = categoryMap.get(t.categoryId || "");
        if (!category) return null;

        return {
          categoryId: t.categoryId,
          categoryName: category.name,
          amount: Number(t._sum.amount || 0),
          color: category.color,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.amount - a.amount);
  }

  async getSpendType(userId: string) {
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    // Get recurring transactions (fixed expenses)
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        type: "expense",
        isActive: true,
      },
    });

    const fixedExpenses = recurringTransactions.reduce(
      (sum, rt) => sum + Number(rt.amount),
      0
    );

    // Get all expenses this month
    const allExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "expense",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = Number(allExpenses._sum.amount || 0);
    const variableExpenses = totalExpenses - fixedExpenses;

    return {
      fixed: Number(fixedExpenses.toFixed(2)),
      variable: Number(Math.max(0, variableExpenses).toFixed(2)),
      total: Number(totalExpenses.toFixed(2)),
    };
  }

  async getInsights(userId: string) {
    const insights: Array<{
      id: string;
      type: "info" | "warning" | "success";
      title: string;
      description: string;
      action?: string;
    }> = [];

    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = getEndOfMonth(now);

    // Check for upcoming commitments
    const upcomingCommitments = await prisma.commitment.findMany({
      where: {
        userId,
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    upcomingCommitments.forEach((commitment) => {
      const daysUntil = getDaysUntil(commitment.dueDate);
      insights.push({
        id: `commitment-${commitment.id}`,
        type: daysUntil <= 3 ? "warning" : "info",
        title: `${commitment.name} Due Soon`,
        description: `${commitment.name} payment of ₹${Number(commitment.amount).toLocaleString("en-IN")} is due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}.`,
        action: "View Commitment",
      });
    });

    // Check budget alerts
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    for (const budget of budgets) {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "expense",
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      });

      const spentAmount = Number(spent._sum.amount || 0);
      const limit = Number(budget.monthlyLimit);
      const percentage = limit > 0 ? (spentAmount / limit) * 100 : 0;

      if (spentAmount > limit) {
        insights.push({
          id: `budget-exceeded-${budget.id}`,
          type: "warning",
          title: `Budget Exceeded: ${budget.category.name}`,
          description: `You've exceeded your ${budget.category.name} budget by ₹${(spentAmount - limit).toLocaleString("en-IN")}.`,
          action: "View Budget",
        });
      } else if (
        budget.alertThreshold &&
        percentage >= Number(budget.alertThreshold)
      ) {
        insights.push({
          id: `budget-alert-${budget.id}`,
          type: "warning",
          title: `Budget Alert: ${budget.category.name}`,
          description: `You've used ${percentage.toFixed(0)}% of your ${budget.category.name} budget.`,
          action: "View Budget",
        });
      }
    }

    // Check credit card utilization
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
    });

    creditCards.forEach((card) => {
      const limit = Number(card.limit);
      const used = Number(card.used);
      const utilization = limit > 0 ? (used / limit) * 100 : 0;

      if (utilization >= 75) {
        insights.push({
          id: `card-utilization-${card.id}`,
          type: "warning",
          title: `High Card Utilization: ${card.name}`,
          description: `Your ${card.name} is at ${utilization.toFixed(0)}% utilization. Consider paying down.`,
          action: "View Card",
        });
      }
    });

    // Check for expected recurring income
    const recurringIncome = await prisma.recurringTransaction.findFirst({
      where: {
        userId,
        type: "income",
        isActive: true,
        nextDate: {
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { nextDate: "asc" },
    });

    if (recurringIncome) {
      const daysUntil = getDaysUntil(recurringIncome.nextDate);
      insights.push({
        id: `income-expected-${recurringIncome.id}`,
        type: "success",
        title: "Income Expected",
        description: `Your ${recurringIncome.description} of ₹${Number(recurringIncome.amount).toLocaleString("en-IN")} is expected in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}.`,
      });
    }

    return insights;
  }

  async getNetWorth(userId: string) {
    // Get all accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    const totalAccountBalance = accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );

    // Get all investments
    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    const totalInvestmentValue = investments.reduce(
      (sum, investment) => sum + Number(investment.currentValue),
      0
    );

    // Get credit card debt (used amount)
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
    });

    const totalCreditCardDebt = creditCards.reduce(
      (sum, card) => sum + Number(card.used),
      0
    );

    const netWorth = totalAccountBalance + totalInvestmentValue - totalCreditCardDebt;

    return {
      accounts: Number(totalAccountBalance.toFixed(2)),
      investments: Number(totalInvestmentValue.toFixed(2)),
      creditCardDebt: Number(totalCreditCardDebt.toFixed(2)),
      netWorth: Number(netWorth.toFixed(2)),
    };
  }
}

export const analyticsService = new AnalyticsService();

