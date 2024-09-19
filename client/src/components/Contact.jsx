import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const response = await axios.get(`/server/user/${listing.userRef}`);

        setLandlord(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  return <div>Contact</div>;
}

export default Contact;
