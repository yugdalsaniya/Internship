import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomePage from "../Pages/HomePage";
import Internship from "../Pages/InternshipPage";
import InternshipDetailPage from "../Pages/InternshipDetailPage";
import SignUpPage from "../Pages/SignUpPage";
import OtpPage from "../Pages/OtpPage";
import SignInPage from "../Pages/SignInPage";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/:role" element={<SignUpPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/internship" element={<Internship />} />
          <Route path="/internshipdetail" element={<InternshipDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}