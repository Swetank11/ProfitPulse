// Import PrismaClient from your custom output path
const { PrismaClient } = require("../app/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword123",
      },
    });
    console.log("✅ User created:", user);

    const found = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    console.log("✅ User fetched:", found);
  } catch (err) {
    console.error("❌ Database error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();