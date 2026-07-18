import { calculateVariance, formatPercent, isLowStock, cn, formatQuantity } from "@/lib/utils/helpers";

describe("calculateVariance", () => {
  it("returns 0 when both values are 0", () => {
    expect(calculateVariance(0, 0)).toBe(0);
  });

  it("returns 100 when expected is 0 but actual is positive", () => {
    expect(calculateVariance(0, 5)).toBe(100);
  });

  it("calculates positive variance", () => {
    expect(calculateVariance(10, 12)).toBeCloseTo(20);
  });

  it("calculates negative variance", () => {
    expect(calculateVariance(10, 8)).toBeCloseTo(-20);
  });

  it("calculates exact 50% variance", () => {
    expect(calculateVariance(100, 150)).toBeCloseTo(50);
  });
});

describe("formatPercent", () => {
  it("formats positive with plus sign", () => {
    expect(formatPercent(15.3)).toBe("+15.3%");
  });

  it("formats negative with minus sign", () => {
    expect(formatPercent(-10.5)).toBe("-10.5%");
  });

  it("formats zero without sign", () => {
    expect(formatPercent(0)).toBe("+0.0%");
  });
});

describe("isLowStock", () => {
  it("returns true when value equals threshold", () => {
    expect(isLowStock(5, 5)).toBe(true);
  });

  it("returns true when value is below threshold", () => {
    expect(isLowStock(3, 5)).toBe(true);
  });

  it("returns false when value is above threshold", () => {
    expect(isLowStock(10, 5)).toBe(false);
  });
});

describe("formatQuantity", () => {
  it("formats with 2 decimal places", () => {
    expect(formatQuantity(5, "packs")).toBe("5.00 packs");
  });

  it("formats with unit", () => {
    expect(formatQuantity(0, "kg")).toBe("0.00 kg");
  });
});

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string for no truthy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
