// Data Export Service
// Handles exporting user data to Excel, CSV, and PDF formats

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
// @ts-ignore - jspdf-autotable extends jsPDF prototype
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Get all finance data for export
const getFinanceData = () => {
  // This will be called from components that have access to useFinance hook
  // For now, we'll accept data as parameters
  return null;
};

// Export to Excel
export const exportToExcel = (
  transactions: any[],
  budgets: any[],
  accounts: any[],
  creditCards: any[],
  debitCards: any[],
  investments: any[],
  sips: any[],
  categories: any[]
) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Transactions sheet
    if (transactions.length > 0) {
      const transactionsData = transactions.map(t => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        Description: t.description,
        Amount: t.amount,
        Account: t.account,
        Recurring: t.isRecurring ? "Yes" : "No",
      }));
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");
    }

    // Budgets sheet
    if (budgets.length > 0) {
      const budgetsData = budgets.map(b => ({
        Category: b.name,
        Budget: b.budget,
        Spent: b.spent,
        Remaining: b.budget - b.spent,
      }));
      const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
      XLSX.utils.book_append_sheet(workbook, budgetsSheet, "Budgets");
    }

    // Accounts sheet
    if (accounts.length > 0) {
      const accountsData = accounts.map(a => ({
        Name: a.name,
        Bank: a.bank,
        Type: a.type,
        Balance: a.balance,
        AccountNumber: a.accountNumber,
      }));
      const accountsSheet = XLSX.utils.json_to_sheet(accountsData);
      XLSX.utils.book_append_sheet(workbook, accountsSheet, "Accounts");
    }

    // Credit Cards sheet
    if (creditCards.length > 0) {
      const cardsData = creditCards.map(c => ({
        Name: c.name,
        Bank: c.bank,
        LastFour: c.lastFour,
        Limit: c.limit,
        Used: c.used,
        Available: c.limit - c.used,
        DueDate: c.dueDate,
        MinDue: c.minDue,
      }));
      const cardsSheet = XLSX.utils.json_to_sheet(cardsData);
      XLSX.utils.book_append_sheet(workbook, cardsSheet, "Credit Cards");
    }

    // Debit Cards sheet
    if (debitCards.length > 0) {
      const debitData = debitCards.map(d => ({
        Name: d.name,
        Bank: d.bank,
        LastFour: d.lastFour,
        LinkedAccount: d.linkedAccount,
        Network: d.cardNetwork,
        ExpiryDate: d.expiryDate,
        Active: d.isActive ? "Yes" : "No",
      }));
      const debitSheet = XLSX.utils.json_to_sheet(debitData);
      XLSX.utils.book_append_sheet(workbook, debitSheet, "Debit Cards");
    }

    // Investments sheet
    if (investments.length > 0) {
      const investmentsData = investments.map(i => ({
        Name: i.name,
        Type: i.type,
        Invested: i.invested,
        Current: i.current,
        Returns: i.returns,
        ReturnPercentage: `${i.returns}%`,
      }));
      const investmentsSheet = XLSX.utils.json_to_sheet(investmentsData);
      XLSX.utils.book_append_sheet(workbook, investmentsSheet, "Investments");
    }

    // SIPs sheet
    if (sips.length > 0) {
      const sipsData = sips.map(s => ({
        Name: s.name,
        Amount: s.amount,
        Frequency: s.frequency,
        NextDate: s.nextDate,
        TotalInvested: s.totalInvested,
      }));
      const sipsSheet = XLSX.utils.json_to_sheet(sipsData);
      XLSX.utils.book_append_sheet(workbook, sipsSheet, "SIPs");
    }

    // Categories sheet
    if (categories.length > 0) {
      const categoriesData = categories.map(c => ({
        Name: c.name,
        Type: c.type,
        TransactionCount: c.count,
      }));
      const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories");
    }

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0];
    const filename = `financeflow-export-${date}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
    return { success: true, filename };
  } catch (error) {
    console.error("Excel export error:", error);
    return { success: false, error: "Failed to export to Excel" };
  }
};

// Export to CSV
export const exportToCSV = (
  transactions: any[],
  budgets: any[],
  accounts: any[],
  creditCards: any[],
  debitCards: any[],
  investments: any[],
  sips: any[],
  categories: any[]
) => {
  try {
    const date = new Date().toISOString().split("T")[0];
    
    // Combine all data into a single CSV
    const allData: any[] = [];
    
    // Add transactions
    transactions.forEach(t => {
      allData.push({
        Type: "Transaction",
        Date: t.date,
        Category: t.category,
        Description: t.description,
        Amount: t.amount,
        Account: t.account,
        Details: t.isRecurring ? "Recurring" : "One-time",
      });
    });

    // Add budgets
    budgets.forEach(b => {
      allData.push({
        Type: "Budget",
        Category: b.name,
        Budget: b.budget,
        Spent: b.spent,
        Remaining: b.budget - b.spent,
        Details: "",
      });
    });

    // Add accounts
    accounts.forEach(a => {
      allData.push({
        Type: "Account",
        Name: a.name,
        Bank: a.bank,
        Balance: a.balance,
        AccountType: a.type,
        Details: a.accountNumber,
      });
    });

    // Add credit cards
    creditCards.forEach(c => {
      allData.push({
        Type: "Credit Card",
        Name: c.name,
        Bank: c.bank,
        Limit: c.limit,
        Used: c.used,
        Available: c.limit - c.used,
        Details: `Due: ${c.dueDate}`,
      });
    });

    // Add debit cards
    debitCards.forEach(d => {
      allData.push({
        Type: "Debit Card",
        Name: d.name,
        Bank: d.bank,
        LinkedAccount: d.linkedAccount,
        Network: d.cardNetwork,
        Details: `Expiry: ${d.expiryDate}`,
      });
    });

    // Add investments
    investments.forEach(i => {
      allData.push({
        Type: "Investment",
        Name: i.name,
        Invested: i.invested,
        Current: i.current,
        Returns: i.returns,
        Details: i.type,
      });
    });

    // Add SIPs
    sips.forEach(s => {
      allData.push({
        Type: "SIP",
        Name: s.name,
        Amount: s.amount,
        Frequency: s.frequency,
        TotalInvested: s.totalInvested,
        Details: `Next: ${s.nextDate}`,
      });
    });

    // Add categories
    categories.forEach(c => {
      allData.push({
        Type: "Category",
        Name: c.name,
        CategoryType: c.type,
        TransactionCount: c.count,
        Details: "",
      });
    });

    // Convert to CSV
    if (allData.length === 0) {
      return { success: false, error: "No data to export" };
    }

    const headers = Object.keys(allData[0]);
    const csvRows = [
      headers.join(","),
      ...allData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === "string" && value.includes(",") 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financeflow-export-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, filename: `financeflow-export-${date}.csv` };
  } catch (error) {
    console.error("CSV export error:", error);
    return { success: false, error: "Failed to export to CSV" };
  }
};

// Export to PDF
export const exportToPDF = (
  transactions: any[],
  budgets: any[],
  accounts: any[],
  creditCards: any[],
  debitCards: any[],
  investments: any[],
  sips: any[],
  categories: any[]
) => {
  try {
    const doc = new jsPDF();
    const date = new Date().toISOString().split("T")[0];
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text("FinanceFlow Data Export", 14, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPosition);
    yPosition += 15;

    // Transactions
    if (transactions.length > 0) {
      doc.setFontSize(14);
      doc.text("Transactions", 14, yPosition);
      yPosition += 8;

      const transactionsData = transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.description,
        `₹${t.amount.toLocaleString('en-IN')}`,
        t.account,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Date", "Type", "Category", "Description", "Amount", "Account"]],
        body: transactionsData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
      });

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 50;
    }

    // Budgets
    if (budgets.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text("Budgets", 14, yPosition);
      yPosition += 8;

      const budgetsData = budgets.map(b => [
        b.name,
        `₹${b.budget.toLocaleString('en-IN')}`,
        `₹${b.spent.toLocaleString('en-IN')}`,
        `₹${(b.budget - b.spent).toLocaleString('en-IN')}`,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Category", "Budget", "Spent", "Remaining"]],
        body: budgetsData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
      });

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 50;
    }

    // Accounts
    if (accounts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text("Accounts", 14, yPosition);
      yPosition += 8;

      const accountsData = accounts.map(a => [
        a.name,
        a.bank,
        a.type,
        `₹${a.balance.toLocaleString('en-IN')}`,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Name", "Bank", "Type", "Balance"]],
        body: accountsData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
      });

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 50;
    }

    // Investments
    if (investments.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text("Investments", 14, yPosition);
      yPosition += 8;

      const investmentsData = investments.map(i => [
        i.name,
        i.type,
        `₹${i.invested.toLocaleString('en-IN')}`,
        `₹${i.current.toLocaleString('en-IN')}`,
        `${i.returns}%`,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Name", "Type", "Invested", "Current", "Returns"]],
        body: investmentsData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Save PDF
    const filename = `financeflow-export-${date}.pdf`;
    doc.save(filename);
    return { success: true, filename };
  } catch (error) {
    console.error("PDF export error:", error);
    return { success: false, error: "Failed to export to PDF" };
  }
};

