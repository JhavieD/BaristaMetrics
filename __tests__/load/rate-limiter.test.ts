import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RATE_LIMIT } from "@/lib/utils/constants";

let checkRateLimit: typeof import("@/lib/middleware/rate-limiter").checkRateLimit;
let applyRateLimitHeaders: typeof import("@/lib/middleware/rate-limiter").applyRateLimitHeaders;

beforeEach(() => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@/lib/middleware/rate-limiter");
  checkRateLimit = mod.checkRateLimit;
  applyRateLimitHeaders = mod.applyRateLimitHeaders;
});

function createRequest(ip: string): NextRequest {
  return new NextRequest("http://localhost", {
    headers: { "x-forwarded-for": ip },
  });
}

function createResponse(): NextResponse {
  return NextResponse.json({ ok: true });
}

describe("Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const request = createRequest("10.0.0.1");
    const result = checkRateLimit(request, 5);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const ip = "10.0.0.2";
    const maxRequests = 3;

    for (let i = 0; i < maxRequests; i++) {
      const result = checkRateLimit(createRequest(ip), maxRequests);
      expect(result.allowed).toBe(true);
    }

    const blocked = checkRateLimit(createRequest(ip), maxRequests);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const ip = "10.0.0.3";
    const windowMs = 5000;
    const spy = jest.spyOn(Date, "now");

    spy.mockReturnValue(1000);
    for (let i = 0; i < RATE_LIMIT.MAX_GENERAL; i++) {
      checkRateLimit(createRequest(ip), RATE_LIMIT.MAX_GENERAL, windowMs);
    }
    const blocked = checkRateLimit(createRequest(ip), RATE_LIMIT.MAX_GENERAL, windowMs);
    expect(blocked.allowed).toBe(false);

    spy.mockReturnValue(1000 + windowMs + 1);
    const reset = checkRateLimit(createRequest(ip), RATE_LIMIT.MAX_GENERAL, windowMs);
    expect(reset.allowed).toBe(true);
    expect(reset.remaining).toBe(RATE_LIMIT.MAX_GENERAL - 1);

    spy.mockRestore();
  });

  it("different IPs have separate limits", () => {
    const maxRequests = 2;

    for (let i = 0; i < maxRequests; i++) {
      checkRateLimit(createRequest("10.0.0.10"), maxRequests);
    }

    const blocked = checkRateLimit(createRequest("10.0.0.10"), maxRequests);
    expect(blocked.allowed).toBe(false);

    const otherIpAllowed = checkRateLimit(createRequest("10.0.0.11"), maxRequests);
    expect(otherIpAllowed.allowed).toBe(true);
  });

  it("sets headers correctly", () => {
    const response = createResponse();
    const headersSpy = jest.spyOn(response.headers, "set");

    applyRateLimitHeaders(response, 42, 1700000000000);

    expect(headersSpy).toHaveBeenCalledWith("X-RateLimit-Remaining", "42");
    expect(headersSpy).toHaveBeenCalledWith("X-RateLimit-Reset", "1700000000");

    headersSpy.mockRestore();
  });
});
