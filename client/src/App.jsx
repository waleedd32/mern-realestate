import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/about" element={<About />} />

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
