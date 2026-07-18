export interface RequestLog {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  userEmail?: string;
  ipAddress?: string;
  bodySize?: number;
  responseSize?: number;
  error?: string;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function logRequest(log: RequestLog): void {
  if (process.env.NODE_ENV === "development") {
    const { requestId, method, path, statusCode, duration, error } = log;
    console.log(
      `[${requestId}] ${method} ${path} ${statusCode} ${duration}ms${error ? ` ERROR: ${error}` : ""}`
    );
  } else {
    console.log(JSON.stringify(log));
  }
}

export function extractRequestInfo(request: Request) {
  return {
    userAgent: request.headers.get("user-agent") || "unknown",
    ipAddress: getClientIp(request),
    bodySize: request.headers.get("content-length")
      ? parseInt(request.headers.get("content-length") || "0")
      : undefined,
  };
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
