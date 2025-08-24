import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Firestore not initialized' },
        { status: 500 }
      );
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const projectsRef = adminDb.collection('projects');
    const querySnapshot = await projectsRef.where('userId', '==', userId).get();

    // Sort projects by createdAt in memory (no index required)
    const projects = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }))
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: unknown) {
    console.error('Fetch projects error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Firestore not initialized' },
        { status: 500 }
      );
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const projectData = {
      name,
      description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('projects').add(projectData);

    const project = {
      id: docRef.id,
      ...projectData,
    };

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: unknown) {
    console.error('Create project error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
