import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Contact({ listing }) {
  // axios.defaults.withCredentials = true;

  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const response = await axios.get(`/server/user/${listing.userRef}`);

        setLandlord(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.response?.statusText ||
            error.message ||
            "Something went wrong. Please try again later."
        );
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  // Error Alert Component
  const ErrorAlert = ({ message }) => (
    <div
      data-testid="error-alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    >
      <span data-testid="error-alert-message" className="block sm:inline">
        {message}
      </span>
    </div>
  );

  if (isLoading) {
    return <ContactSkeleton />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  function ContactSkeleton() {
    return (
      <div data-testid="contact-skeleton" className="flex flex-col gap-2">
        <div
          className="skeleton-row"
          style={{ height: "24px", width: "80%" }}
        ></div>
        <div className="skeleton-row w-full" style={{ height: "80px" }}></div>
        <div className="skeleton-row w-full" style={{ height: "50px" }}></div>
      </div>
    );
  }

  return (
    <>
      {" "}
      {landlord && (
        <div data-testid="contact-form" className="flex flex-col gap-2">
          <p data-testid="contact-text">
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            data-testid="message-input"
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <Link
            data-testid="send-message-link"
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Send Message
          </Link>
        </div>
      )}
    </>
  );
}

export default Contact;
