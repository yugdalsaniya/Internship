import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomePage from "../Pages/HomePage";
import InternshipPage from "../Pages/InternshipPage";
import InternshipDetailPage from "../Pages/InternshipDetailPage";
import SignUpPage from "../Pages/SignUpPage";
import OtpPage from "../Pages/OtpPage";
import SignInPage from "../Pages/SignInPage";
import ForgotPasswordPage from "../Pages/ForgotPasswordPage";
import ProfileEditPage from "../Pages/ProfileEditPage";
import PostInternship from "../Pages/company/PostInternship";
import PostInternshipForm from "../Pages/company/PostInternshipForm";
import ManageInternships from "../Pages/company/ManageInternships";
import StudentInternshipPage from "../Pages/student/StudentInternshipPage";
import StudentPostForm from "../Pages/student/StudentPostForm";
import ApplyInternshipForm from "../Pages/student/ApplyInternshipForm";
import InternshipCandidates from "../Pages/company/InternshipCandidates";
import MyApplicationsPage from "../Pages/student/MyApplicationsPage";
import ScrollToTop from "../ScrollToTop";
import AboutUsPage from "../Pages/AboutUsPage";
import ContactUsPage from "../Pages/ContactUsPage";
import CategoryInternshipsPage from "../Pages/CategoryInternshipsPage";

export default function AppRoutes() {
  return (
    <Router basename="/ph">
      {/* <ScrollToTop /> */}
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/:role" element={<SignUpPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/editprofile/*" element={<ProfileEditPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/internship" element={<InternshipPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/internshipdetail/:id" element={<InternshipDetailPage />} />
          <Route path="/applyinternshipform/:id" element={<ApplyInternshipForm />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/:categoryname/internships" element={<CategoryInternshipsPage />} />
          <Route path="/post-internship" element={<PostInternship />} />
          <Route path="/post-internship/form" element={<PostInternshipForm />} />
          <Route path="/manage-internships" element={<ManageInternships />} />
          <Route path="/internship/:id/candidates" element={<InternshipCandidates />} />

          {/* <Route path="/StudentInternshipPage" element={<StudentInternshipPage />} /> */}
          <Route path="/StudentPostForm" element={<StudentPostForm />} />

        </Route>
      </Routes>
    </Router>
  );
}