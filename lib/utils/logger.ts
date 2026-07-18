type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === "development") {
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    return `[${entry.level.toUpperCase()}] ${entry.message}${ctx}`;
  }
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(formatLog({ level: "info", timestamp: new Date().toISOString(), message, context }));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatLog({ level: "warn", timestamp: new Date().toISOString(), message, context }));
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(formatLog({ level: "error", timestamp: new Date().toISOString(), message, context }));
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.log(formatLog({ level: "debug", timestamp: new Date().toISOString(), message, context }));
    }
  },
};
