import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const tasksRef = adminDb.collection("tasks");
    const querySnapshot = await tasksRef
      .where("projectId", "==", projectId)
      .get();

    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error: unknown) {
    console.error("Fetch tasks error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch tasks";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, projectId, userId, dueDate } = await request.json();

    if (!title || !projectId || !userId) {
      return NextResponse.json(
        { error: "Title, project ID, and user ID are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const taskData = {
      title,
      status: "Todo" as const,
      projectId,
      userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("tasks").add(taskData);

    const task = {
      id: docRef.id,
      ...taskData,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: unknown) {
    console.error("Create task error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
