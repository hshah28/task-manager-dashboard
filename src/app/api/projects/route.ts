import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const projectsRef = adminDb.collection("projects");
    const querySnapshot = await projectsRef.where("userId", "==", userId).get();

    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: unknown) {
    console.error("Fetch projects error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch projects";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json();

    if (!name || !description || !userId) {
      return NextResponse.json(
        { error: "Name, description, and user ID are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Firestore not initialized" },
        { status: 500 }
      );
    }

    const projectData = {
      name,
      description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("projects").add(projectData);

    const project = {
      id: docRef.id,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: unknown) {
    console.error("Create project error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
