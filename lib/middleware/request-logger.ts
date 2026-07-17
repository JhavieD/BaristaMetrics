export interface RequestLog {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  userAgent?: string;
  userEmail?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
}

export function logRequest(log: RequestLog): void {
  if (process.env.NODE_ENV === "development") {
    console.log(JSON.stringify(log));
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
