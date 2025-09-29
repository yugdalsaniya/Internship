import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDocumentTitle } from "../Utils/useDocumentTitle";
import { getPageTitle } from "../Utils/titles";
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
import RequestedInternshipsPage from "../Pages/student/RequestedInternshipsPage";
import ScrollToTop from "../ScrollToTop";
import AboutUsPage from "../Pages/AboutUsPage";
import ContactUsPage from "../Pages/ContactUsPage";
import CategoryInternshipsPage from "../Pages/CategoryInternshipsPage";
import PrivacyPolicyPage from "../Pages/PrivacyPolicyPage";
import StudentInternshipList from "../Pages/company/StudentInternshipList";
import CompanyProfilePage from "../Pages/company/CompanyProfilePage";
import NewsAndBlogPage from "../Pages/student/NewsAndBlogPage";
import AllEmployers from "../Components/home/AllEmployers";
import AllAcademies from "../Components/home/AllAcademies";
import AcademyProfilePage from "../Pages/Academy/AcademyProfilePage";
import AcademyMOAPage from "../Pages/Academy/AcademyMOAPage";
import AllNewsAndBlogs from "../Components/home/AllNewsAndBlogs";
import SidebarItem from "../Components/profile/SidebarItem";
import EditInternship from "../Pages/company/EditInternship"; // Import the EditInternship component
import PublicRoute from "../routes/PublicRoute";
import SubscriptionPlans from "../Pages/company/SubscriptionPlans"; // Import SubscriptionPlans component
import MentorProfilePage from "../Pages/Mentor/MentorProfilePage";
import AllMentors from "../Components/home/AllMentors";
import CreateResume from "../Pages/CreateResume.jsx";
import CreateMentorResume from "../Pages/CreateMentorResume.jsx";
import PostMentorship from "../Pages/Mentor/PostMentorship.jsx";
import PostMentorshipForm from "../Pages/Mentor/PostMentorshipForm.jsx";
import ManageMentorships from "../Pages/Mentor/ManageMentorships.jsx";
import AllMentorships from "../Pages/Mentor/AllMentorships.jsx";
import StudentProfile from "../Pages/student/StudentProfile.jsx";

function AppRoutesInner() {
  const location = useLocation();
  const title = getPageTitle(location.pathname, location);
  useDocumentTitle(title);

  return (
    <Routes>
      {/* Public routes: Only accessible to unauthenticated users */}
      <Route element={<PublicRoute />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/:role" element={<SignUpPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<SignInPage />} />
      </Route>
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route element={<MainLayout />}>
        <Route path="/editprofile/*" element={<ProfileEditPage />} />
        <Route path="/sidebar/*" element={<SidebarItem />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/internship" element={<InternshipPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route
          path="/internshipdetail/:id"
          element={<InternshipDetailPage />}
        />
        <Route
          path="/applyinternshipform/:id"
          element={<ApplyInternshipForm />}
        />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route
          path="/requested-internships"
          element={<RequestedInternshipsPage />}
        />
        <Route
          path="/:categoryname/internships/:id"
          element={<CategoryInternshipsPage />}
        />
        <Route path="/post-internship" element={<PostInternship />} />
        <Route
          path="/post-internship/form"
          element={<PostInternshipForm />}
          管理Internships
        />
        <Route path="/manage-internships" element={<ManageInternships />} />
        <Route
          path="/internship/:id/candidates"
          element={<InternshipCandidates />}
        />
        <Route path="/edit-internship/:id" element={<EditInternship />} />{" "}
        {/* New route */}
        <Route path="/StudentPostForm" element={<StudentPostForm />} />
        <Route path="/interns" element={<StudentInternshipList />} />
        <Route path="/company/:id" element={<CompanyProfilePage />} />
        <Route path="/newsandblog/:slug/:id" element={<NewsAndBlogPage />} />
        <Route path="/:companySlug/:id" element={<CompanyProfilePage />} />
        <Route path="/all-employers" element={<AllEmployers />} />
        <Route path="/all-academies" element={<AllAcademies />} />
        <Route path="/all-mentors" element={<AllMentors />} />
        <Route path="/editprofile/create-resume" element={<CreateResume />} />
        <Route path="/editprofile/create-mentor-resume" element={<CreateMentorResume />} />
        <Route path="/academy/:slug/:id" element={<AcademyProfilePage />} />
        <Route path="/academy-moa" element={<AcademyMOAPage />} />
        <Route path="/academy-moa-list" element={<Navigate to="/academy-moa" replace />} />
        <Route path="/mentor/:slug/:id" element={<MentorProfilePage />} />
        <Route path="/news-and-blog" element={<AllNewsAndBlogs />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/mentorship-programs" element={<PostMentorship />} />
        <Route path="/post-mentorship-form" element={<PostMentorshipForm />} />
        <Route
          path="/post-mentorship-form/:id"
          element={<PostMentorshipForm />}
        />
        <Route path="/manage-mentorship" element={<ManageMentorships />} />
        <Route path="/allmentorships" element={<AllMentorships />} />
                <Route path="/profile/share" element={<StudentProfile />} />

      </Route>
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <Router basename="/ph">
      {/* <ScrollToTop /> */}
      <AppRoutesInner />
    </Router>
  );
}
