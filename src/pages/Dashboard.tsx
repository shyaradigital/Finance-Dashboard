import { Helmet } from "react-helmet";
import SummaryStrip from "@/components/dashboard/SummaryStrip";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import CategorySpendChart from "@/components/dashboard/CategorySpendChart";
import SpendTypeChart from "@/components/dashboard/SpendTypeChart";
import InsightCards from "@/components/dashboard/InsightCards";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | FinanceFlow - Personal Finance Tracker</title>
        <meta name="description" content="View your financial overview, track spending patterns, and make smart money decisions with FinanceFlow dashboard." />
      </Helmet>

      <div className="space-y-6">
        {/* Summary Strip */}
        <SummaryStrip />

        {/* Main Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cash Flow Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CashFlowChart />
          </div>
          
          {/* Quick Actions - Takes 1 column */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>

        {/* Secondary Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategorySpendChart />
          <SpendTypeChart />
        </div>

        {/* Insights Section */}
        <InsightCards />
      </div>
    </>
  );
}
