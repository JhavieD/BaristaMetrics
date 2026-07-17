import { NextResponse } from "next/server";
import { AppError, generateRequestId } from "@/lib/utils/errors";
import { APP_VERSION } from "@/lib/utils/constants";

export function successResponse<T>(data: T, requestId?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
      version: APP_VERSION,
    },
  });
}

export function errorResponse(
  error: unknown,
  requestId?: string
): NextResponse {
  const id = requestId || generateRequestId();
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        metadata: { timestamp, requestId: id, version: APP_VERSION },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error("API Error:", { requestId: id, error: error.message, stack: error.stack });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error.message,
        },
        metadata: { timestamp, requestId: id, version: APP_VERSION },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unknown error",
      },
      metadata: { timestamp, requestId: id, version: APP_VERSION },
    },
    { status: 500 }
  );
}
