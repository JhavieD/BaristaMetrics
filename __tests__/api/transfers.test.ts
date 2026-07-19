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

jest.mock("@/lib/supabase/middleware", () => ({
  requireAdmin: jest.fn().mockResolvedValue({ email: "jana@admin.com" }),
  getAuthUser: jest.fn().mockResolvedValue({ email: "jana@admin.com" }),
  isAdmin: jest.fn().mockReturnValue(true),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { POST } from "@/app/api/transfers/route";

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
  mock.maybeSingle = jest.fn(() =>
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/transfers", () => {
  it("creates a transfer with deduction and delivery logs", async () => {
    const mockTransfer = {
      transfer_id: 1,
      source_branch: "jaen",
      destination_branch: "mallorca",
      item_id: 1,
      quantity: 5,
      initiated_by: "jana@admin.com",
    };

    let callIndex = 0;
    const fromCalls = [
      createMockQuery({
        data: { expected_remaining_stock: 10 },
        error: null,
      }),
      createMockQuery({ data: { item_name: "Espresso", unit: "kg" }, error: null }),
      createMockQuery({ data: { item_id: 2 }, error: null }),
      createMockQuery({ data: { item_id: 2 }, error: null }),
      createMockQuery({ data: mockTransfer, error: null }),
      createMockQuery({ data: null, error: null }),
    ];

    (getSupabaseAdmin().from as jest.Mock).mockImplementation(() => {
      return fromCalls[callIndex++] || createMockQuery({ data: null, error: null });
    });

    const request = new NextRequest("http://localhost/api/transfers", {
      method: "POST",
      body: JSON.stringify({
        source_branch: "jaen",
        destination_branch: "mallorca",
        item_id: 1,
        quantity: 5,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTransfer);
  });

  it("rejects transfer when source and destination are the same", async () => {
    const request = new NextRequest("http://localhost/api/transfers", {
      method: "POST",
      body: JSON.stringify({
        source_branch: "jaen",
        destination_branch: "jaen",
        item_id: 1,
        quantity: 5,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.message).toBe(
      "Source and destination must be different"
    );
  });

  it("rejects transfer when source has insufficient stock", async () => {
    let callIndex = 0;
    (getSupabaseAdmin().from as jest.Mock).mockImplementation(() => {
      if (callIndex === 0) {
        callIndex++;
        return createMockQuery({
          data: { expected_remaining_stock: 2 },
          error: null,
        });
      }
      return createMockQuery({ data: null, error: null });
    });

    const request = new NextRequest("http://localhost/api/transfers", {
      method: "POST",
      body: JSON.stringify({
        source_branch: "jaen",
        destination_branch: "mallorca",
        item_id: 1,
        quantity: 10,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Insufficient stock at source branch");
  });
});
