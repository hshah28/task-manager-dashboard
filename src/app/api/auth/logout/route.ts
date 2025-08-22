import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST() {
  try {
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Firebase admin auth not initialized" },
        { status: 500 }
      );
    }

    // Note: Admin SDK doesn't have signOut for server-side
    // This is typically handled client-side
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Logout failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
