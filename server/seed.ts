import { db } from "./db";
import { users, chatChannels, specializations } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));

    if (existingAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        fullName: "System Administrator",
        email: "admin@yemenhybrid.com",
        username: "admin",
        hashedPassword,
        role: "admin",
        preferredLanguage: "en",
        isActive: true,
        specialization: null,
      });
      console.log("✅ Admin user created (username: admin, password: admin123)");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create default chat channels
    const existingChannels = await db.select().from(chatChannels);
    if (existingChannels.length === 0) {
      await db.insert(chatChannels).values([
        {
          name: "General",
          type: "general",
          description: "General discussions",
          isActive: true,
        },
        {
          name: "Tech",
          type: "tech",
          description: "Technical discussions",
          isActive: true,
        },
        {
          name: "Sales",
          type: "sales",
          description: "Sales team discussions",
          isActive: true,
        },
      ]);
      console.log("✅ Default chat channels created");
    } else {
      console.log("ℹ️  Chat channels already exist");
    }

    // Create default specializations
    const existingSpecs = await db.select().from(specializations);
    if (existingSpecs.length === 0) {
      await db.insert(specializations).values([
        {
          code: "electric",
          nameAr: "كهربائي",
          nameEn: "Electrical",
        },
        {
          code: "mechanic",
          nameAr: "ميكانيكي",
          nameEn: "Mechanical",
        },
        {
          code: "battery",
          nameAr: "بطاريات",
          nameEn: "Battery",
        },
        {
          code: "ac",
          nameAr: "تكييف",
          nameEn: "Air Conditioning",
        },
      ]);
      console.log("✅ Default specializations created");
    } else {
      console.log("ℹ️  Specializations already exist");
    }

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
