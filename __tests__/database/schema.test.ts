import {
  inventoryItemSchema,
  logSubmissionSchema,
  inventoryUpdateSchema,
  transferSchema,
} from "@/lib/validations/inventory";

describe("Database Schema Validation", () => {
  describe("inventoryItemSchema", () => {
    it("rejects negative starting_stock", () => {
      const result = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "Espresso Beans",
        category: "powder",
        unit: "kg",
        starting_stock: -10,
      });
      expect(result.success).toBe(false);
    });

    it("accepts zero starting_stock", () => {
      const result = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "Espresso Beans",
        category: "powder",
        unit: "kg",
        starting_stock: 0,
      });
      expect(result.success).toBe(true);
    });

    it("requires valid category (powder/liquid/addon)", () => {
      const valid = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "Milk",
        category: "liquid",
        unit: "kg",
        starting_stock: 10,
      });
      expect(valid.success).toBe(true);

      const invalid = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "Milk",
        category: "invalid-category",
        unit: "kg",
        starting_stock: 10,
      });
      expect(invalid.success).toBe(false);
    });

    it("requires valid branch_id", () => {
      const valid = inventoryItemSchema.safeParse({
        branch_id: "mallorca",
        item_name: "Sugar",
        category: "powder",
        unit: "kg",
        starting_stock: 5,
      });
      expect(valid.success).toBe(true);

      const invalid = inventoryItemSchema.safeParse({
        branch_id: "nonexistent-branch",
        item_name: "Sugar",
        category: "powder",
        unit: "kg",
        starting_stock: 5,
      });
      expect(invalid.success).toBe(false);
    });

    it("requires item_name 1-100 chars", () => {
      const valid = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "Espresso Beans",
        category: "powder",
        unit: "kg",
        starting_stock: 20,
      });
      expect(valid.success).toBe(true);

      const emptyName = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "",
        category: "powder",
        unit: "kg",
        starting_stock: 20,
      });
      expect(emptyName.success).toBe(false);

      const tooLong = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "x".repeat(101),
        category: "powder",
        unit: "kg",
        starting_stock: 20,
      });
      expect(tooLong.success).toBe(false);

      const exactly100 = inventoryItemSchema.safeParse({
        branch_id: "jaen",
        item_name: "x".repeat(100),
        category: "powder",
        unit: "kg",
        starting_stock: 20,
      });
      expect(exactly100.success).toBe(true);
    });
  });

  describe("logSubmissionSchema", () => {
    it("requires positive quantity_opened", () => {
      const valid = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: 5,
        unit: "packs",
      });
      expect(valid.success).toBe(true);

      const negative = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: -1,
        unit: "packs",
      });
      expect(negative.success).toBe(false);

      const zero = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: 0,
        unit: "packs",
      });
      expect(zero.success).toBe(false);
    });

    it("requires valid log_type (deduction/delivery)", () => {
      const deduction = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: 5,
        unit: "packs",
      });
      expect(deduction.success).toBe(true);

      const delivery = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "delivery",
        quantity_opened: 10,
        unit: "kg",
      });
      expect(delivery.success).toBe(true);

      const invalid = logSubmissionSchema.safeParse({
        branch_id: "jaen",
        item_id: 1,
        log_type: "return",
        quantity_opened: 5,
        unit: "packs",
      });
      expect(invalid.success).toBe(false);
    });

    it("requires valid branch_id", () => {
      const valid = logSubmissionSchema.safeParse({
        branch_id: "san-antonio",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: 3,
        unit: "grams",
      });
      expect(valid.success).toBe(true);

      const invalid = logSubmissionSchema.safeParse({
        branch_id: "unknown",
        item_id: 1,
        log_type: "deduction",
        quantity_opened: 3,
        unit: "grams",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("inventoryUpdateSchema", () => {
    it("allows partial updates", () => {
      const nameOnly = inventoryUpdateSchema.safeParse({ item_name: "New Name" });
      expect(nameOnly.success).toBe(true);

      const categoryOnly = inventoryUpdateSchema.safeParse({ category: "addon" });
      expect(categoryOnly.success).toBe(true);

      const stockOnly = inventoryUpdateSchema.safeParse({ starting_stock: 50 });
      expect(stockOnly.success).toBe(true);
    });

    it("allows null actual_physical_count", () => {
      const result = inventoryUpdateSchema.safeParse({
        actual_physical_count: null,
      });
      expect(result.success).toBe(true);
    });

    it("allows empty object (no changes)", () => {
      const result = inventoryUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects invalid values in partial fields", () => {
      const negativeStock = inventoryUpdateSchema.safeParse({
        starting_stock: -5,
      });
      expect(negativeStock.success).toBe(false);

      const invalidCategory = inventoryUpdateSchema.safeParse({
        category: "invalid",
      });
      expect(invalidCategory.success).toBe(false);
    });
  });

  describe("transferSchema", () => {
    it("requires positive quantity", () => {
      const valid = transferSchema.safeParse({
        source_branch: "jaen",
        destination_branch: "mallorca",
        item_id: 1,
        quantity: 10,
      });
      expect(valid.success).toBe(true);

      const negative = transferSchema.safeParse({
        source_branch: "jaen",
        destination_branch: "mallorca",
        item_id: 1,
        quantity: -5,
      });
      expect(negative.success).toBe(false);

      const zero = transferSchema.safeParse({
        source_branch: "jaen",
        destination_branch: "mallorca",
        item_id: 1,
        quantity: 0,
      });
      expect(zero.success).toBe(false);
    });

    it("requires valid source and destination branches", () => {
      const valid = transferSchema.safeParse({
        source_branch: "jaen",
        destination_branch: "san-antonio",
        item_id: 1,
        quantity: 5,
      });
      expect(valid.success).toBe(true);

      const invalidSource = transferSchema.safeParse({
        source_branch: "invalid",
        destination_branch: "jaen",
        item_id: 1,
        quantity: 5,
      });
      expect(invalidSource.success).toBe(false);

      const invalidDest = transferSchema.safeParse({
        source_branch: "jaen",
        destination_branch: "invalid",
        item_id: 1,
        quantity: 5,
      });
      expect(invalidDest.success).toBe(false);
    });
  });
});
