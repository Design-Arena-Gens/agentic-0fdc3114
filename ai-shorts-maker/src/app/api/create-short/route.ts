import { NextResponse } from "next/server";
import { createShortRequestSchema } from "@/lib/schemas";
import { runPipeline } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createShortRequestSchema.parse(json);

    const result = await runPipeline(parsed);

    return NextResponse.json(
      {
        success: true,
        plan: result.plan,
        videoBase64: result.videoBase64,
        thumbnailBase64: result.thumbnailBase64,
        totalDuration: result.totalDuration,
        youtubeUrl: result.youtubeUrl ?? null,
        youtubeId: result.youtubeId ?? null,
        logs: result.logs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pipeline failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
