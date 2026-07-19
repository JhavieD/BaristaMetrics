import { NextRequest, NextResponse } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: jest.fn().mockReturnValue({
    from: jest.fn(() => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.insert = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.order = jest.fn().mockReturnValue(chain);
      chain.limit = jest.fn().mockReturnValue(chain);
      chain.range = jest.fn().mockReturnValue(chain);
      chain.single = jest.fn().mockResolvedValue({ data: { item_id: 1 }, error: null });
      chain.then = jest.fn((resolve: (value: unknown) => void) => {
        resolve({ data: [], error: null, count: 0 });
      });
      return chain;
    }),
  }),
}));

jest.mock("@/lib/supabase/middleware", () => ({
  requireAdmin: jest.fn().mockResolvedValue({ user: { email: "jana@admin.com" } }),
}));

import { POST as inventoryPost } from "@/app/api/inventory/route";
import { GET as logsGet } from "@/app/api/logs/route";

function createInventoryRequest(): NextRequest {
  return new NextRequest("http://localhost/api/inventory", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify({
      branch_id: "jaen",
      item_name: "Espresso Beans",
      category: "powder",
      unit: "kg",
      starting_stock: 10,
    }),
  });
}

function createLogsRequest(branch?: string): NextRequest {
  const url = branch
    ? `http://localhost/api/logs?branch=${branch}`
    : "http://localhost/api/logs";
  return new NextRequest(url, {
    method: "GET",
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

describe("Concurrent Submissions Load Test", () => {
  it("handles 10 concurrent POST requests to /api/inventory without crashing", async () => {
    const requests = Array.from({ length: 10 }, () => createInventoryRequest());

    const results = await Promise.allSettled(
      requests.map((req) => inventoryPost(req))
    );

    results.forEach((result) => {
      expect(result.status).toBe("fulfilled");
    });

    const fulfilled = results.filter(
      (r) => r.status === "fulfilled"
    ) as PromiseFulfilledResult<NextResponse<unknown>>[];
    fulfilled.forEach(({ value }) => {
      expect(value).toBeDefined();
      expect(value.status).toBeDefined();
    });
  });

  it("handles 20 concurrent GET requests to /api/logs without crashing", async () => {
    const requests = Array.from({ length: 20 }, () => createLogsRequest());

    const results = await Promise.allSettled(
      requests.map((req) => logsGet(req))
    );

    results.forEach((result) => {
      expect(result.status).toBe("fulfilled");
    });

    const fulfilled = results.filter(
      (r) => r.status === "fulfilled"
    ) as PromiseFulfilledResult<NextResponse<unknown>>[];
    fulfilled.forEach(({ value }) => {
      expect(value).toBeDefined();
      expect(value.status).toBeDefined();
    });
  });

  it("handles rapid branch switches without race conditions", async () => {
    const branches = ["jaen", "mallorca", "san-antonio"];
    const requests = Array.from({ length: 30 }, (_, i) =>
      createLogsRequest(branches[i % branches.length])
    );

    const results = await Promise.allSettled(
      requests.map((req) => logsGet(req))
    );

    results.forEach((result) => {
      expect(result.status).toBe("fulfilled");
    });

    const fulfilled = results.filter(
      (r) => r.status === "fulfilled"
    ) as PromiseFulfilledResult<NextResponse<unknown>>[];
    fulfilled.forEach(({ value }) => {
      expect(value).toBeDefined();
      expect(value.status).toBeDefined();
    });
  });
});
