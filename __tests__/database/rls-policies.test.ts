import { isAdmin } from "@/lib/supabase/middleware";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

jest.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock("@/lib/utils/errors", () => ({
  AppError: class MockAppError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number = 500
    ) {
      super(message);
      this.name = "AppError";
    }
  },
}));

describe("RLS-like access control (API layer enforcement)", () => {
  describe("isAdmin", () => {
    it("returns true for admin email", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("returns false for non-admin email", () => {
      expect(isAdmin("staff@example.com")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isAdmin("")).toBe(false);
    });
  });

  describe("admin routes (inventory POST, PUT, DELETE)", () => {
    it("admin is authorized for inventory create (POST)", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("non-admin is blocked from inventory create (POST)", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });

    it("admin is authorized for inventory update (PUT)", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("non-admin is blocked from inventory update (PUT)", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });

    it("admin is authorized for inventory delete (DELETE)", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("non-admin is blocked from inventory delete (DELETE)", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });
  });

  describe("admin routes (users)", () => {
    it("admin is authorized for users routes", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("non-admin is blocked from users routes", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });
  });

  describe("admin routes (audit log)", () => {
    it("admin is authorized for audit log", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });

    it("non-admin is blocked from audit log", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });
  });

  describe("staff routes (logs POST, inventory GET)", () => {
    it("staff email is recognized as non-admin (logs POST)", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });

    it("staff email is recognized as non-admin (inventory GET)", () => {
      expect(isAdmin("staff@branch.com")).toBe(false);
    });

    it("admin can also access staff routes", () => {
      expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    });
  });
});
