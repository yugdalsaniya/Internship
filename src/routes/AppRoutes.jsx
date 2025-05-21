import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomePage from "../Pages/HomePage"; // Import your homepage component
import Internship from "../Pages/InternshipPage"; // Import your internship page component
import InternshipDetailPage from "../Pages/InternshipDetailPage";
import SignUpPage from "../Pages/SignUpPage";
import OtpPage from "../Pages/OtpPage";
import SignInPage from "../Pages/SignInPage";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>

        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/login" element={<SignInPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} /> {/* Add this for the root path */}
          <Route path="/internship" element={<Internship  />} /> {/* Add this for the internship page */}
          <Route path="/internshipdetail" element={<InternshipDetailPage  />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}