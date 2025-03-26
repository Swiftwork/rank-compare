import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Create a new PrismaClient instance for this request
const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch games:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  } finally {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
  }
}
