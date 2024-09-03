import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Listing = () => {
  const [listing, setListing] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`/server/listing/get/${params.listingId}`);

        const data = res.data;
        if (data.success === false) {
          return;
        }
        setListing(data);
      } catch (error) {}
    };
    fetchListing();
  }, []);

  console.log("Listing of listing page", listing);

  return <div>{listing && listing.name}</div>;
};

export default Listing;
