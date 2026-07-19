import { NextRequest } from "next/server";

jest.mock("@/lib/middleware/rate-limiter", () => ({
  checkRateLimit: jest.fn().mockReturnValue({
    allowed: true,
    remaining: 99,
    resetTime: Date.now() + 60000,
  }),
  applyRateLimitHeaders: jest.fn(),
}));

jest.mock("@/lib/middleware/request-logger", () => ({
  logRequest: jest.fn(),
  extractRequestInfo: jest.fn().mockReturnValue({
    userAgent: "test-agent",
    ipAddress: "127.0.0.1",
  }),
}));

jest.mock("@/lib/middleware/security-headers", () => ({
  securityHeaders: {},
}));

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: jest.fn().mockReturnValue({ from: jest.fn() }),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { GET } from "@/app/api/logs/route";

function createMockQuery(result: {
  data: unknown;
  error: null | { message: string };
  count?: number;
}) {
  const mock: Record<string, jest.Mock> = {};
  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "order",
    "limit",
    "range",
  ];
  chainMethods.forEach((m) => {
    mock[m] = jest.fn(() => mock);
  });
  mock.single = jest.fn(() =>
    Promise.resolve({ data: result.data, error: result.error })
  );
  (mock as Record<string, unknown>).then = (resolve: (...args: unknown[]) => unknown) =>
    resolve({
      data: result.data,
      error: result.error,
      count: result.count ?? 0,
    });
  return mock;
}

function mockFrom(returnQuery: ReturnType<typeof createMockQuery>) {
  (getSupabaseAdmin().from as jest.Mock).mockReturnValue(returnQuery);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/logs", () => {
  it("returns logs from daily_logs table with join", async () => {
    const mockLogs = [
      {
        log_id: 1,
        branch_id: "jaen",
        item_id: 2,
        log_type: "deduction",
        quantity_opened: 3,
        inventory_master: { item_name: "Espresso Beans", unit: "kg" },
      },
    ];
    const query = createMockQuery({ data: mockLogs, error: null, count: 1 });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/logs");
    const response = await GET(request);
    const body = await response.json();

    expect(getSupabaseAdmin().from).toHaveBeenCalledWith("daily_logs");
    expect(query.select).toHaveBeenCalledWith(
      "*, inventory_master(item_name, unit)"
    );
    expect(query.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(body.success).toBe(true);
    expect(body.data.logs).toEqual(mockLogs);
    expect(body.data.total).toBe(1);
  });

  it("filters by branch when branch param provided", async () => {
    const query = createMockQuery({ data: [], error: null, count: 0 });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/logs?branch=jaen");
    await GET(request);

    expect(query.eq).toHaveBeenCalledWith("branch_id", "jaen");
  });

  it("filters by item_id when provided", async () => {
    const query = createMockQuery({ data: [], error: null, count: 0 });
    mockFrom(query);

    const request = new NextRequest(
      "http://localhost/api/logs?item_id=5"
    );
    await GET(request);

    expect(query.eq).toHaveBeenCalledWith("item_id", 5);
  });

  it("applies pagination with offset and limit", async () => {
    const query = createMockQuery({ data: [], error: null, count: 0 });
    mockFrom(query);

    const request = new NextRequest(
      "http://localhost/api/logs?offset=10&limit=5"
    );
    await GET(request);

    expect(query.range).toHaveBeenCalledWith(10, 14);
  });

  it("uses default pagination (offset=0, limit=25)", async () => {
    const query = createMockQuery({ data: [], error: null, count: 0 });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/logs");
    await GET(request);

    expect(query.range).toHaveBeenCalledWith(0, 24);
  });

  it("returns logs and total count in response", async () => {
    const mockLogs = [
      { log_id: 1, log_type: "deduction" },
      { log_id: 2, log_type: "delivery" },
    ];
    const query = createMockQuery({
      data: mockLogs,
      error: null,
      count: 2,
    });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/logs");
    const response = await GET(request);
    const body = await response.json();

    expect(body.data.logs).toHaveLength(2);
    expect(body.data.total).toBe(2);
  });
});
