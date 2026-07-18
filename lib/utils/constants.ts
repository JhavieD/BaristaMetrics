export const ALLOWED_BRANCHES = ["jaen", "mallorca", "san-antonio"] as const;

export const ADMIN_EMAIL = "jana@admin.com";

export const LOG_TYPES = ["deduction", "delivery"] as const;

export const VALID_UNITS = ["kg", "grams", "packs"] as const;

export const CATEGORIES = ["powder", "liquid", "addon"] as const;

export const DEFAULT_BRANCH = "jaen";

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_GENERAL: 100,
  MAX_ADMIN: 10,
  MAX_AUTH: 5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

export const SESSION = {
  TIMEOUT_MS: 24 * 60 * 60 * 1000,
  MAX_CONCURRENT: 3,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
} as const;

export const CACHE = {
  TTL_MS: 5 * 60 * 1000,
  STALE_WHILE_REVALIDATE_MS: 30 * 1000,
} as const;

export const OFFLINE = {
  MAX_QUEUE_SIZE: 50,
  QUEUE_EXPIRY_MS: 24 * 60 * 60 * 1000,
} as const;

export const EXPORT = {
  MAX_ROWS: 10000,
} as const;

export const LOW_STOCK_THRESHOLD_PERCENT = 20;

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";
