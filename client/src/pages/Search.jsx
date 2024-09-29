import React from "react";

const Search = () => {
  return (
    <div className="">
      <div className="p-7 border-b-2">
        <form>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap">Search Term:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
            />
          </div>
        </form>
      </div>
      <div className="">
        <h1>Listing results:</h1>
      </div>
    </div>
  );
};

export default Search;
