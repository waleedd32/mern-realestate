import React from "react";

function CreateListing() {
  return (
    <main>
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form>
        <div>
          <input
            type="text"
            placeholder="Name"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            id="description"
            required
          />
        </div>
      </form>
    </main>
  );
}

export default CreateListing;
