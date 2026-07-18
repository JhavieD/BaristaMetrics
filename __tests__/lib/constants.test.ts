import {
  ALLOWED_BRANCHES,
  LOG_TYPES,
  VALID_UNITS,
  RATE_LIMIT,
  PAGINATION,
  SESSION,
  PASSWORD,
  CACHE,
  OFFLINE,
  EXPORT,
  LOW_STOCK_THRESHOLD_PERCENT,
} from "@/lib/utils/constants";

describe("constants", () => {
  it("has 3 allowed branches", () => {
    expect(ALLOWED_BRANCHES).toHaveLength(3);
    expect(ALLOWED_BRANCHES).toContain("jaen");
    expect(ALLOWED_BRANCHES).toContain("mallorca");
    expect(ALLOWED_BRANCHES).toContain("san-antonio");
  });

  it("has 2 log types", () => {
    expect(LOG_TYPES).toHaveLength(2);
    expect(LOG_TYPES).toContain("deduction");
    expect(LOG_TYPES).toContain("delivery");
  });

  it("has 3 valid units", () => {
    expect(VALID_UNITS).toHaveLength(3);
    expect(VALID_UNITS).toContain("kg");
    expect(VALID_UNITS).toContain("grams");
    expect(VALID_UNITS).toContain("packs");
  });

  it("has valid rate limits", () => {
    expect(RATE_LIMIT.WINDOW_MS).toBe(15 * 60 * 1000);
    expect(RATE_LIMIT.MAX_GENERAL).toBeGreaterThan(0);
    expect(RATE_LIMIT.MAX_ADMIN).toBeGreaterThan(0);
    expect(RATE_LIMIT.MAX_AUTH).toBeGreaterThan(0);
  });

  it("has valid pagination defaults", () => {
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(PAGINATION.MAX_PAGE_SIZE).toBeGreaterThanOrEqual(PAGINATION.DEFAULT_PAGE_SIZE);
  });

  it("has valid session timeout", () => {
    expect(SESSION.TIMEOUT_MS).toBeGreaterThan(0);
    expect(SESSION.MAX_CONCURRENT).toBeGreaterThan(0);
  });

  it("has valid password config", () => {
    expect(PASSWORD.MIN_LENGTH).toBeGreaterThanOrEqual(8);
    expect(typeof PASSWORD.REQUIRE_UPPERCASE).toBe("boolean");
    expect(typeof PASSWORD.REQUIRE_NUMBER).toBe("boolean");
  });

  it("has valid cache config", () => {
    expect(CACHE.TTL_MS).toBeGreaterThan(0);
    expect(CACHE.STALE_WHILE_REVALIDATE_MS).toBeGreaterThan(0);
  });

  it("has valid offline config", () => {
    expect(OFFLINE.MAX_QUEUE_SIZE).toBeGreaterThan(0);
    expect(OFFLINE.QUEUE_EXPIRY_MS).toBeGreaterThan(0);
  });

  it("has valid export limit", () => {
    expect(EXPORT.MAX_ROWS).toBeGreaterThan(0);
  });

  it("has valid low stock threshold", () => {
    expect(LOW_STOCK_THRESHOLD_PERCENT).toBeGreaterThan(0);
    expect(LOW_STOCK_THRESHOLD_PERCENT).toBeLessThanOrEqual(100);
  });
});
