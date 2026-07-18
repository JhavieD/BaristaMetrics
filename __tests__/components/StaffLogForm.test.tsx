import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockGetSession = jest.fn();
const mockFrom = jest.fn();
const mockToast = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

jest.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: mockToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/lib/utils/activity", () => ({
  logActivity: jest.fn(),
}));

jest.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    disabled,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/modals/LoadingSkeleton", () => ({
  LoadingSkeleton: ({ rows }: { rows?: number }) => (
    <div data-testid="loading-skeleton" data-rows={rows} />
  ),
}));

import { StaffLogForm } from "@/components/forms/StaffLogForm";

function createMockQueryChain(result: { data: unknown; error: null | { message: string } }) {
  const chain: Record<string, jest.Mock> = {};
  ["select", "insert", "update", "delete", "eq", "order", "limit", "range"].forEach(
    (m) => {
      chain[m] = jest.fn(() => chain);
    }
  );
  chain.single = jest.fn(() => Promise.resolve(result));
  chain.maybeSingle = jest.fn(() => Promise.resolve(result));
  chain.then = (resolve: (...args: unknown[]) => unknown) =>
    resolve({ data: result.data, error: result.error, count: 0 });
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StaffLogForm", () => {
  describe("branch selection for admin", () => {
    it("renders branch picker when session has no branch_id", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: { user: { user_metadata: {}, email: "admin@test.com" } },
        },
      });
      mockFrom.mockReturnValue(
        createMockQueryChain({ data: [], error: null })
      );

      render(<StaffLogForm />);

      await waitFor(() => {
        expect(
          screen.getByText("Select a branch to log inventory for:")
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Jaen")).toBeInTheDocument();
      expect(screen.getByText("Mallorca")).toBeInTheDocument();
      expect(screen.getByText("San Antonio")).toBeInTheDocument();
    });
  });

  describe("no branch assigned", () => {
    it("shows 'No branch assigned' when there is no session", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      });

      render(<StaffLogForm />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "No branch assigned to your account. Contact admin."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("form with branch selected", () => {
    const mockItems = [
      {
        item_id: 1,
        item_name: "Espresso Beans",
        category: "powder",
        expected_remaining_stock: 20,
      },
      {
        item_id: 2,
        item_name: "Oat Milk",
        category: "liquid",
        expected_remaining_stock: 15,
      },
      {
        item_id: 3,
        item_name: "Vanilla Syrup",
        category: "addon",
        expected_remaining_stock: 8,
      },
    ];

    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              user_metadata: { branch_id: "jaen" },
              email: "staff@test.com",
            },
          },
        },
      });
      mockFrom.mockReturnValue(
        createMockQueryChain({ data: mockItems, error: null })
      );
    });

    it("renders the form when branch is set via session", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("New Log Entry")).toBeInTheDocument();
      });

      expect(screen.getByText("Jaen")).toBeInTheDocument();
      expect(screen.getByText("Submit Log")).toBeInTheDocument();
    });

    it("renders category tabs", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("New Log Entry")).toBeInTheDocument();
      });

      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Powder")).toBeInTheDocument();
      expect(screen.getByText("Liquid")).toBeInTheDocument();
      expect(screen.getByText("Addon")).toBeInTheDocument();
    });

    it("renders search input", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("New Log Entry")).toBeInTheDocument();
      });

      expect(
        screen.getByPlaceholderText("Search ingredient...")
      ).toBeInTheDocument();
    });

    it("search input filters items by name", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("Espresso Beans")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search ingredient...");
      fireEvent.change(searchInput, { target: { value: "Espresso" } });

      expect(screen.getByText("Espresso Beans")).toBeInTheDocument();
      expect(screen.queryByText("Oat Milk")).not.toBeInTheDocument();
      expect(screen.queryByText("Vanilla Syrup")).not.toBeInTheDocument();
    });

    it("category tab filters items", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("Espresso Beans")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Liquid"));

      expect(screen.queryByText("Espresso Beans")).not.toBeInTheDocument();
      expect(screen.getByText("Oat Milk")).toBeInTheDocument();
      expect(screen.queryByText("Vanilla Syrup")).not.toBeInTheDocument();
    });

    it("shows action type buttons for deduction and delivery", async () => {
      render(<StaffLogForm />);

      await waitFor(() => {
        expect(screen.getByText("New Log Entry")).toBeInTheDocument();
      });

      expect(screen.getByText("Used / Refill")).toBeInTheDocument();
      expect(screen.getByText("New Delivery")).toBeInTheDocument();
    });
  });
});
