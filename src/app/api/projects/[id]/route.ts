import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const projectRef = adminDb.collection('projects').doc(id);

    // Check if project exists and belongs to user
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = projectDoc.data();
    if (projectData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData = {
      name,
      description,
      updatedAt: new Date(),
    };

    await projectRef.update(updateData);

    // Get the updated project
    const updatedProjectDoc = await projectRef.get();
    const updatedProject = {
      id: updatedProjectDoc.id,
      ...updatedProjectDoc.data(),
      createdAt: updatedProjectDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedProjectDoc.data()?.updatedAt?.toDate(),
    };

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error: unknown) {
    console.error('Update project error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update project';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const projectRef = adminDb.collection('projects').doc(id);

    // Check if project exists and belongs to user
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = projectDoc.data();
    if (projectData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the project
    await projectRef.delete();

    // Also delete all tasks associated with this project
    const tasksRef = adminDb.collection('tasks');
    const tasksQuery = await tasksRef
      .where('projectId', '==', id)
      .where('userId', '==', userId)
      .get();

    const batch = adminDb.batch();
    tasksQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete project error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete project';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
