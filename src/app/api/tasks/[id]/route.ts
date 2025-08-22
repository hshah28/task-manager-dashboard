import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { status, title, dueDate } = await request.json();

    if (!status && !title && !dueDate) {
      return NextResponse.json(
        { error: "At least one field to update is required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const taskRef = adminDb.collection("tasks").doc(id);
    const updateData: Record<string, string | Date | null> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    await taskRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error: unknown) {
    console.error("Update task error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const taskRef = adminDb.collection("tasks").doc(id);
    await taskRef.delete();

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete task error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
