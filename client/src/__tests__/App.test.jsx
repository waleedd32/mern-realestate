import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/user/userSlice";

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import App from "../App";
import { MemoryRouter } from "react-router-dom";

// Mocking SignIn so we don't load the real component
vi.mock("../pages/SignIn", () => ({
  default: () => <div data-testid="signin-heading">Sign In Page</div>,
}));

describe("App Routing", () => {
  // Create a mock store
  const createMockStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          currentUser: null,
          loading: false,
          error: null,
          ...initialState,
        },
      },
    });
  };

  it("renders Home page on default route (/)", async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    // By default, the route is "/", so Home should render
    expect(await screen.findByTestId("home-heading")).toBeInTheDocument();
  });

  // Alternate approach if <BrowserRouter> is inside <App>
  // (which includes Header, Routes, and Route):
  // Use `window.history.pushState({}, "", "/sign-in")` before rendering <App />
  // so <BrowserRouter> detects "/sign-in" as the current path and renders accordingly.

  //   it("renders SignIn page on /sign-in route", async () => {
  //     window.history.pushState({}, "", "/sign-in");
  //     const store = createMockStore();

  //     render(
  //       <Provider store={store}>
  //         <App />
  //       </Provider>
  //     );

  //     expect(screen.getByTestId("header")).toBeInTheDocument();
  //     expect(await screen.findByTestId("signin-heading")).toBeInTheDocument();
  //   });

  it("renders SignIn page on /sign-in route", async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        {/* Tell MemoryRouter to start at "/sign-in" */}
        <MemoryRouter initialEntries={["/sign-in"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(await screen.findByTestId("signin-heading")).toBeInTheDocument();
  });
});
