import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <Link to="/">
        <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
          <span className="text-slate">Walid</span>
          <span className="text-slate-700">Estate</span>
        </h1>
      </Link>
      Header
    </header>
  );
}

export default Header;
