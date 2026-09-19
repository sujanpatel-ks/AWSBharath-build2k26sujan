import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock aws-amplify/auth — no real Cognito calls in unit tests
vi.mock("aws-amplify/auth", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  confirmSignUp: vi.fn(),
  resendSignUpCode: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ username: "test-farmer", userId: "sub-123" }),
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      idToken: { toString: () => "mock-id-token" },
    },
  }),
}));

// Mock aws-amplify/utils Hub
vi.mock("aws-amplify/utils", () => ({
  Hub: {
    listen: vi.fn(() => () => {}),
  },
}));

// Mock amplify config (no-op in tests)
vi.mock("@/api/amplify-config", () => ({
  configureAmplify: vi.fn(),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}));

// Suppress console.error noise from expected errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("ErrorBoundary caught")) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});
