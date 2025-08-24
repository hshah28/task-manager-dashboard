import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const authHeader = request.headers.get('authorization');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    const tasksRef = adminDb.collection('tasks');
    const querySnapshot = await tasksRef
      .where('projectId', '==', projectId)
      .where('userId', '==', userId)
      .get();

    // Sort tasks by createdAt in memory (no index required)
    const tasks = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
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
      tasks,
    });
  } catch (error: unknown) {
    console.error('Fetch tasks error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch tasks';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, projectId, dueDate } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and project ID are required' },
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

    const taskData = {
      title,
      status: 'Todo' as const,
      projectId,
      userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('tasks').add(taskData);

    const task = {
      id: docRef.id,
      ...taskData,
    };

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: unknown) {
    console.error('Create task error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
