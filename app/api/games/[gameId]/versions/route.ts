import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } },
) {
  const { gameId } = await params;

  try {
    const versions = await prisma.gameVersion.findMany({
      where: {
        gameId: parseInt(gameId),
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(versions);
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Failed to fetch versions for game ${gameId}:`,
        error.stack,
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch game versions' },
      { status: 500 },
    );
  } finally {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
  }
}
