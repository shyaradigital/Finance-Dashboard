import "dotenv/config";
import prisma from "../src/config/database";

async function clearAllData() {
  try {
    console.log("Starting data cleanup...");
    
    // Count existing users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} user(s) in the database.`);
    
    if (userCount === 0) {
      console.log("No users found. Database is already empty.");
      return;
    }
    
    // Delete all users (cascade will delete all related data)
    console.log("Deleting all users and their data...");
    const result = await prisma.user.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} user(s) and all their related data.`);
    console.log("\nDeleted data includes:");
    console.log("  - All transactions");
    console.log("  - All accounts");
    console.log("  - All credit cards");
    console.log("  - All debit cards");
    console.log("  - All categories");
    console.log("  - All budgets");
    console.log("  - All commitments");
    console.log("  - All investments");
    console.log("  - All SIPs");
    console.log("  - All vault items");
    console.log("  - All automation rules");
    console.log("  - All settings");
    console.log("  - All refresh tokens");
    console.log("\n✅ Database cleanup complete!");
    
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

