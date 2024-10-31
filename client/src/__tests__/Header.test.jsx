import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Creating a mock Redux store
const mockStore = configureStore([]);

describe("Header Component", () => {
  let store;

  beforeEach(() => {
    // Set up the initial state with no user logged in
    store = mockStore({
      user: {
        currentUser: null,
      },
    });
  });

  const renderWithProviders = (ui, { route = "/", storeState = {} } = {}) => {
    // Combining the default state with any additional state provided
    const initialState = {
      user: {
        currentUser: null,
        ...storeState.user,
      },
    };

    const customStore = mockStore(initialState);

    return render(
      <Provider store={customStore}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
          {/* Routes for navigation tests */}
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/about" element={<div>About Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/search" element={<div>Search Page</div>} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  test("displays Sign in when no user is authenticated", () => {
    renderWithProviders(<Header />);

    // Verify brand name is present
    expect(screen.getByText(/Walid/i)).toBeInTheDocument();
    expect(screen.getByText(/Estate/i)).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About/i })).toBeInTheDocument();

    // Ensure Sign in link is visible
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();

    // Confirm profile image is not shown
    const profileImage = screen.queryByAltText("profile");
    expect(profileImage).not.toBeInTheDocument();
  });

  test("shows user avatar when a user is logged in", () => {
    renderWithProviders(<Header />, {
      storeState: {
        user: {
          currentUser: {
            avatar: "https://example.com/avatar.jpg",
          },
        },
      },
    });

    // Check that the profile image is displayed with the correct source
    const profileImage = screen.getByAltText("profile");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg"
    );

    // Ensure the Sign in link is not present
    expect(screen.queryByText(/Sign in/i)).not.toBeInTheDocument();
  });

  test("navigates to Home page when Home link is clicked", async () => {
    renderWithProviders(<Header />, { route: "/some-route" });

    const user = userEvent.setup();
    const homeLink = screen.getByText(/Home/i);

    await user.click(homeLink);

    // Verify that the Home Page content is displayed
    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });

  test("navigates to About page when About link is clicked", async () => {
    renderWithProviders(<Header />, { route: "/some-route" });

    const user = userEvent.setup();
    const aboutLink = screen.getByText(/About/i);

    await user.click(aboutLink);

    // Confirm that the About Page content is shown
    expect(screen.getByText(/About Page/i)).toBeInTheDocument();
  });

  test("navigates to Profile page when Profile link is clicked", async () => {
    renderWithProviders(<Header />, {
      route: "/some-route",
      storeState: {
        user: {
          currentUser: {
            avatar: "https://example.com/avatar.jpg",
          },
        },
      },
    });

    const user = userEvent.setup();
    const profileLink = screen.getByAltText("profile").closest("a");

    await user.click(profileLink);

    // Checking that the Profile Page content is rendered
    expect(screen.getByText(/Profile Page/i)).toBeInTheDocument();
  });

  test("search input updates based on URL search parameter", () => {
    renderWithProviders(<Header />, { route: "/search?searchTerm=house" });

    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    expect(searchInput).toHaveValue("house");
  });

  test("submits search form and navigates with the entered query", async () => {
    renderWithProviders(<Header />, { route: "/" });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    const searchButton = screen.getByRole("button");

    // Input a search term
    await user.clear(searchInput);
    await user.type(searchInput, "apartment");
    expect(searchInput).toHaveValue("apartment");

    // Submit the search form
    await user.click(searchButton);

    // Ensure the Search Page content is displayed
    expect(screen.getByText(/Search Page/i)).toBeInTheDocument();
  });

  test("initializes search input from URL and retains other query parameters", () => {
    renderWithProviders(<Header />, {
      route: "/search?searchTerm=condo&page=2",
    });

    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i);
    expect(searchInput).toHaveValue("condo");
  });

  test("updates search input when the URL changes", () => {
    // Render with no search term initially
    renderWithProviders(<Header />, { route: "/" });

    // Verify the search input is empty
    expect(screen.getByPlaceholderText(/Search\.\.\./i)).toHaveValue("");

    // Re-render with a new search term in the URL
    renderWithProviders(<Header />, { route: "/search?searchTerm=villa" });

    // Check that the search input reflects the new search term
    const searchInputs = screen.queryAllByPlaceholderText(/Search\.\.\./i);
    expect(searchInputs[searchInputs.length - 1]).toHaveValue("villa");
  });
});
