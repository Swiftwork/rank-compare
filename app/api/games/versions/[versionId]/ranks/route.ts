import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { versionId: string } },
) {
  const { versionId } = await params;

  try {
    const ranks = await prisma.rank.findMany({
      where: {
        gameVersionId: parseInt(versionId),
      },
      include: {
        tiers: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(ranks);
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Failed to fetch ranks for version ${versionId}:`,
        error.stack,
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch ranks' },
      { status: 500 },
    );
  } finally {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
  }
}
