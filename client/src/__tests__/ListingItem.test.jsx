import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const mockListingEmptyImages = {
  _id: "3",
  imageUrls: [],
  offer: false,
  regularPrice: 1500,
  type: "rent",
  name: "Suburban House",
  address: "789 Pine Road",
  description: "A spacious loft in downtown.",
  //setting bedrooms 2 covers line 42
  bedrooms: 2,
  bathrooms: 1,
};

const mockListingUndefinedImages = {
  _id: "4",
  imageUrls: undefined,
  offer: false,
  regularPrice: 1800,
  type: "rent",
  name: "Modern Studio",
  address: "321 Cedar Lane",
  description: "A sleek studio apartment.",
  bedrooms: 1,
  bathrooms: 1,
};

const fallbackImage =
  "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg";

describe("ListingItem Component", () => {
  it("uses fallback image when imageUrls is empty", () => {
    render(
      <BrowserRouter>
        <ListingItem listing={mockListingEmptyImages} />
      </BrowserRouter>
    );

    const image = screen.getByAltText(/listing cover/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", fallbackImage);
  });

  it("uses fallback image when imageUrls is undefined", () => {
    render(
      <BrowserRouter>
        <ListingItem listing={mockListingUndefinedImages} />
      </BrowserRouter>
    );

    // Optional chaining (?.) prevents errors when imageUrls is undefined or null,
    // enabling testing of fallback image behavior.
    const image = screen.getByAltText(/listing cover/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", fallbackImage);
  });
});
