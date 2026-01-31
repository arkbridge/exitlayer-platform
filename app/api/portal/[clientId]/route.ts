import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    // Build path to client folder
    const clientDir = path.join(process.cwd(), '..', 'projects', 'clients', clientId);

    // Check if the client folder exists
    try {
      await fs.access(clientDir);
    } catch {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Read metadata and score files
    const metadataPath = path.join(clientDir, '00-metadata.json');
    const scorePath = path.join(clientDir, '02-exitlayer-score.json');

    let metadata, score;

    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch {
      return NextResponse.json(
        { error: 'Client metadata not found' },
        { status: 404 }
      );
    }

    try {
      const scoreContent = await fs.readFile(scorePath, 'utf8');
      score = JSON.parse(scoreContent);
    } catch {
      return NextResponse.json(
        { error: 'Client score not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      metadata,
      score,
    });

  } catch (error) {
    console.error('Portal API error:', error);
    return NextResponse.json(
      { error: 'Failed to load client data' },
      { status: 500 }
    );
  }
}
