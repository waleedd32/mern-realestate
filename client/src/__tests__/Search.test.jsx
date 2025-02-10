import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Search from "../pages/Search";

vi.mock("axios");

// To test handleSubmit (and check if navigation URL is correct),
// we need to override the useNavigate hook.
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  // Import all from react-router-dom normally.
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});
// ----------------
describe("Search Component", () => {
  beforeEach(() => {
    // Clearing all mocks to ensure no calls from previous tests affect the next
    vi.clearAllMocks();
  });

  it("renders the search form inputs and buttons", async () => {
    // Mocking an empty response so the component doesn't error
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Our component will call axios.get on mount so we wait for it to finish.
    await waitFor(() => {
      // Checking the presence of main form elements
      expect(screen.getByTestId("search-term-input")).toBeInTheDocument();
      expect(screen.getByTestId("all-type")).toBeInTheDocument();
      expect(screen.getByTestId("rent-type")).toBeInTheDocument();
      expect(screen.getByTestId("sale-type")).toBeInTheDocument();
      expect(screen.getByTestId("offer-type")).toBeInTheDocument();
      expect(screen.getByTestId("parking")).toBeInTheDocument();
      expect(screen.getByTestId("furnished")).toBeInTheDocument();
      expect(screen.getByTestId("sort-order")).toBeInTheDocument();
      expect(screen.getByTestId("search-button")).toBeInTheDocument();
    });
  });

  it("displays 'No listing found!' if the response data array is empty", async () => {
    // Mocking an empty array of listings
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Waiting for fetch to complete, then check for "No listing found!"
    await waitFor(() => {
      expect(screen.getByText("No listing found!")).toBeInTheDocument();
    });
  });

  it("displays listings when the API returns data", async () => {
    // Mocking some listings data
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "1",
          name: "Cozy Apartment",
          imageUrls: ["apartment.jpg"],
          regularPrice: 800,
          offer: false,
          type: "rent",
        },
        {
          _id: "2",
          name: "Beach House",
          imageUrls: ["beach.jpg"],
          regularPrice: 300000,
          offer: false,
          type: "sale",
        },
      ],
    });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Cozy Apartment")).toBeInTheDocument();
      expect(screen.getByText("Beach House")).toBeInTheDocument();
    });
  });

  it("should update the 'type' when a type checkbox is changed", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Initially, the type is "all" so the "all-type" checkbox is checked.
    const allType = screen.getByTestId("all-type");
    const rentType = screen.getByTestId("rent-type");
    const saleType = screen.getByTestId("sale-type");

    expect(allType.checked).toBe(true);
    expect(rentType.checked).toBe(false);
    expect(saleType.checked).toBe(false);

    // Simulating clicking on the "rent" checkbox.
    fireEvent.click(rentType);

    // Waiting for the state update.
    await waitFor(() => {
      expect(rentType.checked).toBe(true);
      expect(allType.checked).toBe(false);
      expect(saleType.checked).toBe(false);
    });
  });

  it("updates searchTerm when input changes", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByTestId("search-term-input");
      fireEvent.change(searchInput, { target: { value: "apartment" } });

      expect(searchInput.value).toBe("apartment");
    });
  });

  it("updates boolean checkboxes (parking, furnished, offer) when changed", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    const parkingCheckbox = screen.getByTestId("parking");
    const furnishedCheckbox = screen.getByTestId("furnished");
    const offerCheckbox = screen.getByTestId("offer-type");

    // Checking initial values and then click to update them.
    expect(parkingCheckbox.checked).toBe(false);
    fireEvent.click(parkingCheckbox);
    await waitFor(() => {
      expect(parkingCheckbox.checked).toBe(true);
    });

    expect(furnishedCheckbox.checked).toBe(false);
    fireEvent.click(furnishedCheckbox);
    await waitFor(() => {
      expect(furnishedCheckbox.checked).toBe(true);
    });

    expect(offerCheckbox.checked).toBe(false);
    fireEvent.click(offerCheckbox);
    await waitFor(() => {
      expect(offerCheckbox.checked).toBe(true);
    });
  });

  it("updates sort and order when sort select changes", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      const sortSelect = screen.getByTestId("sort-order");
      fireEvent.change(sortSelect, { target: { value: "regularPrice_asc" } });

      expect(sortSelect.value).toBe("regularPrice_asc");
    });
  });
  it("Fetches and displays additional listings on 'Show more' click", async () => {
    // following is simpler way of doing it using map function change getByText to (/1 Listing/)
    // const initialListings = Array(9)
    // .fill(null)
    // .map((_, index) => ({
    //   _id: `${index + 1}`,
    //   name: `${index + 1} Listing `,
    //   description: "A nice place",
    //   address: `${index + 1}23 Test St`,
    //   regularPrice: 1000,
    //   discountPrice: 900,
    //   type: "rent",
    //   offer: true,
    //   imageUrls: ["test1.jpg"],
    //   furnished: true,
    //   parking: true,
    //   bedrooms: 2,
    //   bathrooms: 1,
    // }));

    // Creating 9 initial listings
    const initialListings = [
      {
        _id: "1",
        name: "First Listing",
        description: "A nice place",
        address: "123 Test St",
        regularPrice: 1000,
        discountPrice: 900,
        type: "rent",
        offer: true,
        imageUrls: ["test1.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "2",
        name: "Second Listing",
        description: "Another nice place",
        address: "456 Test Ave",
        regularPrice: 2000,
        discountPrice: 1800,
        type: "sale",
        offer: true,
        imageUrls: ["test2.jpg"],
        furnished: false,
        parking: true,
        bedrooms: 3,
        bathrooms: 2,
      },
      // Adding 7 more of the same type  to go over 8
      {
        _id: "3",
        name: "Third Listing",
        description: "Nice place",
        address: "789 Test St",
        regularPrice: 1200,
        discountPrice: 1100,
        type: "rent",
        offer: true,
        imageUrls: ["test3.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "4",
        name: "Fourth Listing",
        description: "Nice place",
        address: "101 Test St",
        regularPrice: 1300,
        discountPrice: 1200,
        type: "rent",
        offer: true,
        imageUrls: ["test4.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "5",
        name: "Fifth Listing",
        description: "Nice place",
        address: "102 Test St",
        regularPrice: 1400,
        discountPrice: 1300,
        type: "rent",
        offer: true,
        imageUrls: ["test5.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "6",
        name: "Sixth Listing",
        description: "Nice place",
        address: "103 Test St",
        regularPrice: 1500,
        discountPrice: 1400,
        type: "rent",
        offer: true,
        imageUrls: ["test6.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "7",
        name: "Seventh Listing",
        description: "Nice place",
        address: "104 Test St",
        regularPrice: 1600,
        discountPrice: 1500,
        type: "rent",
        offer: true,
        imageUrls: ["test7.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "8",
        name: "Eighth Listing",
        description: "Nice place",
        address: "105 Test St",
        regularPrice: 1700,
        discountPrice: 1600,
        type: "rent",
        offer: true,
        imageUrls: ["test8.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        _id: "9",
        name: "Ninth Listing",
        description: "Nice place",
        address: "106 Test St",
        regularPrice: 1800,
        discountPrice: 1700,
        type: "rent",
        offer: true,
        imageUrls: ["test9.jpg"],
        furnished: true,
        parking: true,
        bedrooms: 2,
        bathrooms: 1,
      },
    ];

    const additionalListings = [
      {
        _id: "10",
        name: "Additional Listing",
        description: "Yet another nice place",
        address: "789 Test Blvd",
        regularPrice: 1500,
        discountPrice: 1400,
        type: "rent",
        offer: true,
        imageUrls: ["test3.jpg"],
        furnished: true,
        parking: false,
        bedrooms: 1,
        bathrooms: 1,
      },
    ];

    // First call returns initial listings (>8 items)
    axios.get.mockResolvedValueOnce({ data: initialListings });
    // Second call returns additional listings
    axios.get.mockResolvedValueOnce({ data: additionalListings });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Waiting for initial listings to load
    await waitFor(() => {
      expect(screen.getByText(/First Listing/i)).toBeInTheDocument();
    });

    // Now the "Show more" button should be visible
    const showMoreButton = screen.getByText("Show more");
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getByText(/Additional Listing/i)).toBeInTheDocument();
    });
  });

  it("sets sidebardata based on URL query parameters", async () => {
    // We are making fake URL query parameters.
    // In this test, we want to check if URL has values,
    // then inside state (and also displayed form) must show same.
    const queryString =
      "?searchTerm=TestTerm&type=sale&parking=true&furnished=true&offer=true&sort=custom&order=asc";
    window.history.pushState({}, "Test page", queryString);

    // When component is created, it is calling API to get data, so we make fake API response.
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Waiting until the useEffect has run and the input value is updated.
    await waitFor(() => {
      expect(screen.getByTestId("search-term-input").value).toBe("TestTerm");
    });

    // Checking that the "type" radio/checkbox state is set based on the URL:
    // since type is "sale", only the sale checkbox should be checked.
    expect(screen.getByTestId("sale-type").checked).toBe(true);
    expect(screen.getByTestId("all-type").checked).toBe(false);
    expect(screen.getByTestId("rent-type").checked).toBe(false);

    // Verifying the boolean checkboxes:
    const parkingCheckbox = screen.getByTestId("parking");
    const furnishedCheckbox = screen.getByTestId("furnished");
    const offerCheckbox = screen.getByTestId("offer-type");

    expect(parkingCheckbox.checked).toBe(true);
    expect(furnishedCheckbox.checked).toBe(true);
    expect(offerCheckbox.checked).toBe(true);
  });

  it("navigates with the correct URL query string on form submission", async () => {
    // Set the URL with query parameters so the component’s state is pre‑populated.
    const queryString =
      "?searchTerm=TestTerm&type=sale&parking=true&furnished=true&offer=true&sort=custom&order=asc";
    window.history.pushState({}, "Test page", queryString);

    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Wait for the form to show the initial search term from the URL.
    await waitFor(() => {
      expect(screen.getByTestId("search-term-input").value).toBe("TestTerm");
    });

    // Simulate clicking "Search" button to send form.
    const searchButton = screen.getByTestId("search-button");
    fireEvent.click(searchButton);

    // handleSubmit function must make query string from sidebar data.
    // Component puts query parameters in this order:
    // searchTerm, type, parking, furnished, offer, sort, order.
    // With our URL values, we expect this query string.
    const expectedQuery =
      "searchTerm=TestTerm&type=sale&parking=true&furnished=true&offer=true&sort=custom&order=asc";
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        `/search?${expectedQuery}`
      );
    });
  });

  it("should handle form submission with default values", async () => {
    // Reset URL to clean state before test
    window.history.pushState({}, "Test page", "/search");

    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    // Submit form without changing any values
    fireEvent.submit(screen.getByTestId("search-button"));

    // Verify navigation with default values
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/search?")
      );
      const navigateArg = mockedUsedNavigate.mock.calls[0][0];
      expect(navigateArg).toContain("searchTerm=");
      expect(navigateArg).toContain("type=all");
      expect(navigateArg).toContain("parking=false");
      expect(navigateArg).toContain("furnished=false");
      expect(navigateArg).toContain("offer=false");
    });
  });
});
