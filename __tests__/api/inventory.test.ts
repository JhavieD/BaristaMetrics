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
  supabaseAdmin: { from: jest.fn() },
}));

jest.mock("@/lib/supabase/middleware", () => ({
  requireAdmin: jest.fn().mockResolvedValue({ email: "jana@admin.com" }),
  getAuthUser: jest.fn().mockResolvedValue({ email: "jana@admin.com" }),
  isAdmin: jest.fn().mockReturnValue(true),
}));

import { supabaseAdmin } from "@/lib/supabase/server";
import { GET, POST } from "@/app/api/inventory/route";
import { PUT, DELETE } from "@/app/api/inventory/[itemId]/route";

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
  mock.single = jest.fn(() => Promise.resolve({ data: result.data, error: result.error }));
  mock.maybeSingle = jest.fn(() => Promise.resolve({ data: result.data, error: result.error }));
  mock.then = (resolve: (...args: unknown[]) => unknown) =>
    resolve({ data: result.data, error: result.error, count: result.count ?? 0 });
  return mock;
}

function mockFrom(returnQuery: ReturnType<typeof createMockQuery>) {
  (supabaseAdmin.from as jest.Mock).mockReturnValue(returnQuery);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/inventory", () => {
  it("calls supabase with correct table", async () => {
    const mockItems = [
      { item_id: 1, item_name: "Espresso Beans", branch_id: "jaen" },
    ];
    const query = createMockQuery({ data: mockItems, error: null });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/inventory");
    const response = await GET(request);
    const body = await response.json();

    expect(supabaseAdmin.from).toHaveBeenCalledWith("current_inventory_status");
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.order).toHaveBeenCalledWith("item_name");
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockItems);
  });

  it("filters by branch when branch query param provided", async () => {
    const query = createMockQuery({ data: [], error: null });
    mockFrom(query);

    const request = new NextRequest(
      "http://localhost/api/inventory?branch=jaen"
    );
    await GET(request);

    expect(query.eq).toHaveBeenCalledWith("branch_id", "jaen");
  });

  it("does not filter by branch when no branch param", async () => {
    const query = createMockQuery({ data: [], error: null });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/inventory");
    await GET(request);

    expect(query.eq).not.toHaveBeenCalledWith(
      "branch_id",
      expect.anything()
    );
  });
});

describe("POST /api/inventory", () => {
  it("inserts validated item data", async () => {
    const insertedItem = {
      item_id: 10,
      branch_id: "jaen",
      item_name: "Oat Milk",
      category: "liquid",
      unit: "packs",
      starting_stock: 50,
    };
    const query = createMockQuery({ data: insertedItem, error: null });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/inventory", {
      method: "POST",
      body: JSON.stringify({
        branch_id: "jaen",
        item_name: "Oat Milk",
        category: "liquid",
        unit: "packs",
        starting_stock: 50,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(supabaseAdmin.from).toHaveBeenCalledWith("inventory_master");
    expect(query.insert).toHaveBeenCalledWith({
      branch_id: "jaen",
      item_name: "Oat Milk",
      category: "liquid",
      unit: "packs",
      starting_stock: 50,
    });
    expect(query.select).toHaveBeenCalled();
    expect(query.single).toHaveBeenCalled();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(insertedItem);
  });
});

describe("PUT /api/inventory/[itemId]", () => {
  it("updates correct item by id", async () => {
    const updatedItem = {
      item_id: 5,
      item_name: "Updated Name",
    };
    const query = createMockQuery({ data: updatedItem, error: null });
    mockFrom(query);

    const request = new NextRequest("http://localhost/api/inventory/5", {
      method: "PUT",
      body: JSON.stringify({ item_name: "Updated Name" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ itemId: "5" }),
    });
    const body = await response.json();

    expect(supabaseAdmin.from).toHaveBeenCalledWith("inventory_master");
    expect(query.update).toHaveBeenCalledWith({ item_name: "Updated Name" });
    expect(query.eq).toHaveBeenCalledWith("item_id", 5);
    expect(query.select).toHaveBeenCalled();
    expect(query.single).toHaveBeenCalled();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updatedItem);
  });

  it("returns error for non-numeric itemId", async () => {
    const request = new NextRequest("http://localhost/api/inventory/abc", {
      method: "PUT",
      body: JSON.stringify({ item_name: "Nope" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ itemId: "abc" }),
    });
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Invalid item ID");
  });
});

describe("DELETE /api/inventory/[itemId]", () => {
  it("deletes daily_logs, transfers, then the item", async () => {
    const logsQuery = createMockQuery({ data: null, error: null });
    const transfersQuery = createMockQuery({ data: null, error: null });
    const itemQuery = createMockQuery({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "daily_logs") return logsQuery;
      if (table === "transfers") return transfersQuery;
      return itemQuery;
    });

    const request = new NextRequest("http://localhost/api/inventory/3", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ itemId: "3" }),
    });
    const body = await response.json();

    expect(supabaseAdmin.from).toHaveBeenCalledWith("daily_logs");
    expect(logsQuery.delete).toHaveBeenCalled();
    expect(logsQuery.eq).toHaveBeenCalledWith("item_id", 3);

    expect(supabaseAdmin.from).toHaveBeenCalledWith("transfers");
    expect(transfersQuery.delete).toHaveBeenCalled();
    expect(transfersQuery.eq).toHaveBeenCalledWith("item_id", 3);

    expect(supabaseAdmin.from).toHaveBeenCalledWith("inventory_master");
    expect(itemQuery.delete).toHaveBeenCalled();
    expect(itemQuery.eq).toHaveBeenCalledWith("item_id", 3);

    expect(body.success).toBe(true);
    expect(body.data).toEqual({ deleted: true });
  });
});
