function calculateExpectedRemaining(
  startingStock: number,
  totalAdded: number,
  totalDeducted: number
): number {
  return startingStock + totalAdded - totalDeducted;
}

function calculateVariance(expected: number, actual: number): number {
  return actual - expected;
}

function calculateVariancePercent(expected: number, actual: number): number {
  if (expected === 0) return 0;
  return ((actual - expected) / expected) * 100;
}

describe("current_inventory_status view calculations", () => {
  describe("calculateExpectedRemaining", () => {
    it("expected stock = starting + added - deducted", () => {
      expect(calculateExpectedRemaining(100, 50, 30)).toBe(120);
    });

    it("handles zero added and deducted", () => {
      expect(calculateExpectedRemaining(100, 0, 0)).toBe(100);
    });

    it("handles large values", () => {
      expect(calculateExpectedRemaining(10000, 5000, 3000)).toBe(12000);
    });

    it("handles decimal values", () => {
      expect(calculateExpectedRemaining(10.5, 2.3, 5.8)).toBeCloseTo(7.0);
    });

    it("returns negative when over-deducted", () => {
      expect(calculateExpectedRemaining(10, 0, 20)).toBe(-10);
    });

    it("zero starting stock", () => {
      expect(calculateExpectedRemaining(0, 50, 30)).toBe(20);
    });
  });

  describe("calculateVariance", () => {
    it("variance = actual - expected", () => {
      expect(calculateVariance(100, 95)).toBe(-5);
    });

    it("positive variance when actual exceeds expected", () => {
      expect(calculateVariance(80, 90)).toBe(10);
    });

    it("zero variance when actual matches expected", () => {
      expect(calculateVariance(50, 50)).toBe(0);
    });

    it("handles negative expected (over-deducted)", () => {
      expect(calculateVariance(-10, 0)).toBe(10);
    });
  });

  describe("calculateVariancePercent", () => {
    it("variance percent calculation", () => {
      expect(calculateVariancePercent(100, 95)).toBe(-5);
    });

    it("zero division handling returns 0", () => {
      expect(calculateVariancePercent(0, 10)).toBe(0);
    });

    it("exact match returns 0%", () => {
      expect(calculateVariancePercent(50, 50)).toBe(0);
    });

    it("100% variance", () => {
      expect(calculateVariancePercent(100, 200)).toBe(100);
    });

    it("-50% variance (half remaining)", () => {
      expect(calculateVariancePercent(100, 50)).toBe(-50);
    });

    it("handles negative expected stock", () => {
      expect(calculateVariancePercent(-10, 0)).toBe(-100);
    });
  });
});
