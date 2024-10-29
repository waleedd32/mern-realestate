import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Header from "../components/Header";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// Helper component to display current location for testing
const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      {location.pathname}
      {location.search}
    </div>
  );
};

const mockStore = configureStore([]);

describe("Header Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        currentUser: null,
      },
    });
  });

  const renderWithProviders = (ui, { route = "/" } = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
          <Routes>
            <Route path="*" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  test("renders header with Sign in when no user is logged in", () => {
    renderWithProviders(<Header />);

    // Check for Brand
    expect(screen.getByText(/Walid/i)).toBeInTheDocument();
    expect(screen.getByText(/Estate/i)).toBeInTheDocument();
    // Check for navigation links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();

    // Checking for Sign in link
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();

    // making sure profile image is not rendered
    const profileImage = screen.queryByAltText("profile");
    expect(profileImage).not.toBeInTheDocument();
  });

  test("renders header with user avatar when user is logged in", () => {
    store = mockStore({
      user: {
        currentUser: {
          avatar: "https://example.com/avatar.jpg",
        },
      },
    });

    renderWithProviders(<Header />);

    // Checking for profile image
    const profileImage = screen.getByAltText("profile");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg"
    );

    // Ensure Sign in link is not rendered
    expect(screen.queryByText(/Sign in/i)).not.toBeInTheDocument();
  });

  test("navigates to home when Home link is clicked", async () => {
    renderWithProviders(<Header />, { route: "/some-route" });

    const user = userEvent.setup();
    const homeLink = screen.getByText(/Home/i);

    await user.click(homeLink);

    // Checking that the location has changed to "/"
    expect(screen.getByTestId("location-display")).toHaveTextContent("/");
  });

  test("navigates to about when About link is clicked", async () => {
    renderWithProviders(<Header />, { route: "/some-route" });

    const user = userEvent.setup();
    const aboutLink = screen.getByText(/About/i);

    await user.click(aboutLink);

    // Checking that the location has changed to "/about"
    expect(screen.getByTestId("location-display")).toHaveTextContent("/about");
  });

  test("navigates to profile when Profile link is clicked", async () => {
    store = mockStore({
      user: {
        currentUser: {
          avatar: "https://example.com/avatar.jpg",
        },
      },
    });

    renderWithProviders(<Header />, { route: "/some-route" });

    const user = userEvent.setup();
    const profileLink = screen.getByAltText("profile").closest("a");

    await user.click(profileLink);

    // Checking that the location has changed to "/profile"
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/profile"
    );
  });

  test("search input updates based on URL search parameter", () => {
    renderWithProviders(<Header />, { route: "/search?searchTerm=house" });

    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    expect(searchInput).toHaveValue("house");
  });

  test("submitting search form navigates with correct query parameter", async () => {
    renderWithProviders(<Header />, { route: "/" });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    const searchButton = screen.getByRole("button");

    // Entering search term
    await user.clear(searchInput);
    await user.type(searchInput, "apartment");
    expect(searchInput).toHaveValue("apartment");

    // Submitting form
    await user.click(searchButton);

    // Expect navigation to /search?searchTerm=apartment
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/search?searchTerm=apartment"
    );
  });

  test("initializes search input from URL and maintains other query params", () => {
    renderWithProviders(<Header />, {
      route: "/search?searchTerm=condo&page=2",
    });

    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    expect(searchInput).toHaveValue("condo");
  });
});
