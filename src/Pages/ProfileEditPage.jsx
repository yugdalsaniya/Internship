import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FaChevronLeft, FaFileMedical, FaBars, FaTimes, FaShare, FaCopy } from "react-icons/fa";
import SidebarItem from "../Components/profile/SidebarItem";
import BasicDetails from "../Components/profile/BasicDetails";
import Resume from "../Components/profile/Resume";
import About from "../Components/profile/About";
import Skills from "../Components/profile/Skills";
import Education from "../Components/profile/Education";
import WorkExperience from "../Components/profile/WorkExperience";
import Accomplishments from "../Components/profile/Accomplishments";
import PersonalDetails from "../Components/profile/PersonalDetails";
import SocialLinks from "../Components/profile/SocialLinks";
import CompanyDetails from "../Components/profile/CompanyDetails";
import OrganizationDetails from "../Components/profile/OrganizationDetails";
import MentorBasicDetails from "../Components/profile/MentorBasicDetails";
import MentorProfessionalDetails from "../Components/profile/MentorProfessionalDetails";
import MentorAvailability from "../Components/profile/MentorAvailability";
import CreateResume from "./CreateResume.jsx";
import CreateMentorResume from "./CreateMentorResume.jsx";
import { fetchSectionData } from "../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Preference from "../Components/profile/Preference.jsx";

const ProfileEditPage = () => {
  const [activeSection, setActiveSection] = useState("Personal Details");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const pendingUser = JSON.parse(localStorage.getItem("pendingUser")) || {};
  const allowedRoles = ["company", "academy"];
  const mentorRoleId = "1747902955524";  

  const [preferredRegion, setPreferredRegion] = useState('');
  const [locationjson, setLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);


// Custom select styles
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      '&:hover': {
        border: '1px solid #3b82f6'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#e3f2fd' : 'white',
      color: '#333',
      '&:hover': {
        backgroundColor: '#e3f2fd'
      }
    })
  };

  const userData = {
    ...pendingUser,
    ...user,
    userid: user.userid || pendingUser.userid || "",
    legalname: user.name || pendingUser.legalname || "",
    email: user.email || pendingUser.email || "",
    role: user.role || pendingUser.role || "",
    roleId: user.roleId || pendingUser.roleId || "",
    companyId: user.companyId || "",
    academyname: pendingUser.academyname || "",
  };

  // Generate share URL with actual student name
  const generateShareUrl = () => {
    const name = studentName || 
                 userData.legalname || 
                 userData.fullname || 
                 userData.name || 
                 `${userData.firstname || ''} ${userData.lastname || ''}`.trim() ||
                 userData.email?.split('@')[0] ||
                 "Student";
    
    const formattedName = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const basePath = '/ph';
    return `${window.location.origin}${basePath}/profile/share?student=${formattedName}&id=${userData.userid}`;
  };

  // Copy URL to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Profile URL copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Profile URL copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (fallbackErr) {
        toast.error("Failed to copy URL", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      document.body.removeChild(textArea);
    }
  };

  // Share Profile Modal Component
  const ShareProfileModal = () => {
    const shareUrl = generateShareUrl();

    const handleNativeShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${studentName || 'Student'}'s Profile`,
            text: `Check out ${studentName || 'this'} professional profile`,
            url: shareUrl,
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboard(shareUrl);
          }
        }
      } else {
        copyToClipboard(shareUrl);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share Your Profile</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes size={16} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Share your profile with potential employers, mentors, or collaborators.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 truncate flex-1 mr-2 font-mono">
                {shareUrl}
              </span>
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <FaCopy size={12} />
                Copy
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowShareModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleNativeShare}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaShare size={12} />
              Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
  }, [userData]);

  const pathToSection = {
    "basic-details": "Basic Details",
    "mentor-basic-details": "Basic Details",
    resume: "Resume",
    "create-resume": "Create Resume",
    "create-mentor-resume": "Create Resume",
    about: "About",
    skills: "Skills",
    education: "Education",
    "work-experience": "Work Experience",
    "accomplishments-and-initiatives": "Accomplishments & Initiatives",
    "personal-details": "Personal Details",
    "social-links": "Social Links",
    "company-details": "Personal Details",
    "organization-details": "Organization Details",
    "mentor-professional-details": "Professional Details",
    "mentor-availability": "Availability",
    preference: "Preference",
  };

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    let defaultSection = "Basic Details";

    if (allowedRoles.includes(userData.role)) {
      defaultSection = "Personal Details";
    } else if (userData.roleId === mentorRoleId) {
      defaultSection = "Basic Details";
    }

    const section = pathToSection[path] || defaultSection;
    setActiveSection(section);
  }, [location, userData.role, userData.roleId]);

  const updateCompletionStatus = useCallback((section, status) => {
    setCompletionStatus((prev) => {
      const newStatus = { ...prev, [section]: status };
      return newStatus;
    });
  }, []);

  useEffect(() => {
    const fetchCompletionStatuses = async () => {
      try {
        const userId = userData.userid;
        const companyId = userData.companyId;
        if (!userId) {
          console.error("User ID not found in userData:", userData);
          return;
        }

        const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              return await fn();
            } catch (err) {
              if (i === retries - 1) throw err;
              console.warn(`Retry ${i + 1} for fetchSectionData:`, err.message);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        };

        const userResponse = await fetchWithRetry(() =>
          fetchSectionData({
            appName: "app8657281202648",
            collectionName: "appuser",
            query: { _id: userId },
            projection: {
              "sectionData.appuser.legalname": 1,
              "sectionData.appuser.fullname": 1,
              "sectionData.appuser.firstname": 1,
              "sectionData.appuser.lastname": 1,
              "sectionData.appuser.name": 1,
              "sectionData.appuser.resume": 1,
              "sectionData.appuser.about": 1,
              "sectionData.appuser.skills": 1,
              "sectionData.appuser.pronouns": 1,
              "sectionData.appuser.dOB": 1,
              "sectionData.appuser.addressline1": 1,
              "sectionData.appuser.zipcode1": 1,
              "sectionData.appuser.location1": 1,
              "sectionData.appuser.addressline3": 1,
              "sectionData.appuser.zipcode2": 1,
              "sectionData.appuser.location2": 1,
              "sectionData.appuser.copycurrentaddress": 1,
              "sectionData.appuser.hobbies": 1,
              "sectionData.appuser.linkedIn": 1,
              "sectionData.appuser.facebook": 1,
              "sectionData.appuser.instagram": 1,
              "sectionData.appuser.x": 1,
              "sectionData.appuser.git": 1,
              "sectionData.appuser.medium": 1,
              "sectionData.appuser.reddit": 1,
              "sectionData.appuser.slack": 1,
              "sectionData.appuser.dribbble": 1,
              "sectionData.appuser.behance": 1,
              "sectionData.appuser.workexperience2": 1,
              "sectionData.appuser.education": 1,
              "sectionData.appuser.intermediateeducation": 1,
              "sectionData.appuser.highschooleducation": 1,
              "sectionData.appuser.email": 1,
              "sectionData.appuser.mobile": 1,
              "sectionData.appuser.organisationcollege": 1,
              "sectionData.appuser.post": 1,
              "sectionData.appuser.certificatesdetails": 1,
              "sectionData.appuser.projectdetails": 1,
              "sectionData.appuser.achievementsdetails": 1,
              "sectionData.appuser.responsibilitydetails": 1,
              "sectionData.appuser.mentorExpertise": 1,
              "sectionData.appuser.mentorExperience": 1,
              "sectionData.appuser.mentorSpecializations": 1,
              "sectionData.appuser.mentorAvailability": 1,
            },
          })
        );

        // Extract and set student name
        if (userResponse && userResponse.length > 0) {
          const appuser = userResponse[0].sectionData.appuser;
          const name = appuser.legalname || 
                       appuser.fullname || 
                       appuser.name || 
                       `${appuser.firstname || ''} ${appuser.lastname || ''}`.trim() ||
                       userData.email?.split('@')[0] ||
                       "Student";
          setStudentName(name);
        }

        let organizationData = {};
        if (allowedRoles.includes(userData.role) && companyId) {
          const companyResponse = await fetchWithRetry(() =>
            fetchSectionData({
              appName: "app8657281202648",
              collectionName: "company",
              query: { _id: companyId },
              projection: {
                "sectionData.Company.organizationName": 1,
                "sectionData.Company.organizationcity": 1,
                "sectionData.Company.industry": 1,
                "sectionData.Company.noofemployees": 1,
              },
            })
          );
          organizationData = companyResponse[0]?.sectionData?.Company || {};
        }

       
        const apiData = userResponse[0]?.sectionData?.appuser || {};

        const newCompletionStatus = {
          Resume: !!apiData.resume,
          About: !!apiData.about?.trim(),
          Skills: !!apiData.skills?.length,
          "Personal Details": allowedRoles.includes(userData.role)
            ? !!apiData.legalname &&
              !!apiData.email &&
              !!apiData.mobile &&
              (userData.roleId !== "1747903042943" ||
                (!!apiData.organisationcollege && !!apiData.post))
            : !!apiData.addressline1 &&
              !!apiData.zipcode1 &&
              !!apiData.location1 &&
              (apiData.copycurrentaddress ||
                (!!apiData.addressline3 &&
                  !!apiData.zipcode2 &&
                  !!apiData.location2)),
          "Social Links":
            !!apiData.linkedIn ||
            !!apiData.facebook ||
            !!apiData.instagram ||
            !!apiData.x ||
            !!apiData.git ||
            !!apiData.medium ||
            !!apiData.reddit ||
            !!apiData.slack ||
            !!apiData.dribbble ||
            !!apiData.behance,
          "Work Experience": !!apiData.workexperience2?.length,
          Education:
            !!apiData.education?.length ||
            !!apiData.intermediateeducation?.length ||
            !!apiData.highschooleducation?.length,
          "Organization Details":
            !!organizationData.organizationName &&
            !!organizationData.organizationcity &&
            !!organizationData.industry?.length &&
            !!organizationData.noofemployees,
          "Accomplishments & Initiatives":
            !!apiData.certificatesdetails?.length ||
            !!apiData.projectdetails?.length ||
            !!apiData.achievementsdetails?.length ||
            !!apiData.responsibilitydetails?.length,
             "Preference": !!apiData.preferredregion && !!apiData.preferredlocation,
        };

        if (userData.roleId === mentorRoleId) {
          newCompletionStatus["Basic Details"] =
            !!apiData.legalname && !!apiData.email && !!apiData.mobile;
          newCompletionStatus["Professional Details"] =
            !!apiData.mentorExpertise &&
            !!apiData.mentorExperience &&
            !!apiData.mentorSpecializations?.length;
          newCompletionStatus["Availability"] = !!apiData.mentorAvailability;
        }

        setCompletionStatus(newCompletionStatus);
      } catch (err) {
        console.error(
          "Error fetching completion statuses:",
          err.message,
          err.stack
        );
        toast.error("Failed to load completion statuses. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    if (userData.userid) {
      fetchCompletionStatuses();
    }
  }, [userData.userid, userData.companyId, userData.role, userData.roleId, userData.email]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  let sections = [];

  if (allowedRoles.includes(userData.role)) {
    sections = [
      {
        label: "Personal Details",
        path: "company-details",
        completed: completionStatus["Personal Details"] || false,
        required: false,
      },
      ...(userData.roleId !== "1747903042943"
        ? [
            {
              label: "Organization Details",
              path: "organization-details",
              completed: completionStatus["Organization Details"] || false,
              required: false,
            },
          ]
        : []),
    ];
  } else if (userData.roleId === mentorRoleId) {
    sections = [
      {
        label: "Basic Details",
        path: "mentor-basic-details",
        completed: completionStatus["Basic Details"] || false,
        required: true,
      },
      {
        label: "Professional Details",
        path: "mentor-professional-details",
        completed: completionStatus["Professional Details"] || false,
        required: true,
      },
      {
        label: "Availability",
        path: "mentor-availability",
        completed: completionStatus["Availability"] || false,
        required: true,
      },
      {
        label: "Resume",
        path: "resume",
        completed: completionStatus["Resume"] || false,
        required: true,
      },
    ];
  } else {
    sections = [
      {
        label: "Basic Details",
        path: "basic-details",
        completed: completionStatus["Basic Details"] || true,
        required: true,
      },
      {
        label: "Resume",
        path: "resume",
        completed: completionStatus["Resume"] || false,
        required: true,
      },
      {
        label: "About",
        path: "about",
        completed: completionStatus["About"] || false,
        required: true,
      },
      {
        label: "Skills",
        path: "skills",
        completed: completionStatus["Skills"] || false,
        required: true,
      },
      {
        label: "Education",
        path: "education",
        completed: completionStatus["Education"] || false,
        required: false,
      },
      {
        label: "Work Experience",
        path: "work-experience",
        completed: completionStatus["Work Experience"] || false,
        required: false,
      },
      {
        label: "Accomplishments & Initiatives",
        path: "accomplishments-and-initiatives",
        completed: completionStatus["Accomplishments & Initiatives"] || false,
        required: false,
      },
      {
        label: "Personal Details",
        path: "personal-details",
        completed: completionStatus["Personal Details"] || false,
        required: false,
      },
      {
        label: "Social Links",
        path: "social-links",
        completed: completionStatus["Social Links"] || false,
        required: false,
      },{
        label: "Preference",
        path: "preference",
        completed: completionStatus["Preference"] || false,
        required: false,
      },
    ];
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />

      <div className="flex flex-col md:flex-row flex-1">
        <div
className={`w-full md:w-[320px] border-r bg-white fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col z-10 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}        >
          <div className="p-4 md:hidden">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <FaTimes className="text-gray-600 text-lg" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {!allowedRoles.includes(userData.role) && (
              <>
                {userData.roleId !== mentorRoleId ? (
                  <>
                    <div className="flex items-center justify-center">
                      <Link to="/editprofile/create-resume">
                        <button className="bg-[#0073e6] text-white font-semibold px-14 py-2 rounded flex items-center gap-2 hover:bg-[#005bb5] transition-colors">
                          <FaFileMedical className="text-white text-lg" />
                          Create your Resume
                        </button>
                      </Link>
                    </div>
                    
                    {/* Share Profile Button */}
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="bg-green-600 text-white font-semibold px-14 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors w-full justify-center"
                      >
                        <FaShare className="text-white text-lg" />
                        Share Profile
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mentor Create Resume Button */}
                    <div className="flex items-center justify-center">
                      <Link to="/editprofile/create-mentor-resume">
                        <button className="bg-[#0073e6] text-white font-semibold px-14 py-2 rounded flex items-center gap-2 hover:bg-[#005bb5] transition-colors">
                          <FaFileMedical className="text-white text-lg" />
                          Create your Resume
                        </button>
                      </Link>
                    </div>
                    
                    {/* Share Profile Button */}
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="bg-green-600 text-white font-semibold px-14 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors w-full justify-center"
                      >
                        <FaShare className="text-white text-lg" />
                        Share Profile
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-sm">Enhance your Profile</h3>
              <p className="text-xs text-gray-500 mt-1">
                Stay ahead of the competition by regularly updating your
                profile.
              </p>
              <div className="w-full bg-gray-300 h-2 rounded-full mt-3 relative">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-right text-xs font-semibold mt-1 text-gray-700">
                75%
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {sections.map((section) => (
              <Link
                to={`/editprofile/${section.path}`}
                key={section.label}
                onClick={() => {
                  setActiveSection(section.label);
                  setIsSidebarOpen(false);
                }}
              >
                <SidebarItem
                  completed={section.completed}
                  label={section.label}
                  isActive={activeSection === section.label}
                  isRequired={section.required}
                />
              </Link>
            ))}
          </div>
        </div>

        <div
          className={`w-full md:w-[calc(100%-320px)] md:ml-[320px] bg-white px-6 overflow-y-auto min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen
              ? "opacity-50 pointer-events-none md:opacity-100 md:pointer-events-auto"
              : ""
          }`}
        >
          <div className="top-20 left-80 right-0 bg-white border-b shadow-sm z-20 h-16">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Link to="/">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                    <FaChevronLeft className="text-gray-600 text-sm" />
                  </button>
                </Link>
                <h1 className="text-base font-semibold text-gray-800">
                  Edit Profile
                </h1>
              </div>
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? (
                  <FaTimes className="text-gray-600 text-lg" />
                ) : (
                  <FaBars className="text-gray-600 text-lg" />
                )}
              </button>
            </div>
          </div>

          <Routes>
            {allowedRoles.includes(userData.role) ? (
              <>
                <Route
                  path="company-details"
                  element={
                    <CompanyDetails
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                {userData.roleId !== "1747903042943" && (
                  <Route
                    path="organization-details"
                    element={
                      <OrganizationDetails
                        userData={userData}
                        updateCompletionStatus={updateCompletionStatus}
                      />
                    }
                  />
                )}
                <Route
                  path="*"
                  element={
                    <Navigate to="/editprofile/company-details" replace />
                  }
                />
              </>
            ) : userData.roleId === mentorRoleId ? (
              <>
                <Route
                  path="mentor-basic-details"
                  element={
                    <MentorBasicDetails
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="mentor-professional-details"
                  element={
                    <MentorProfessionalDetails
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="mentor-availability"
                  element={
                    <MentorAvailability
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="resume"
                  element={
                    <Resume
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route path="create-mentor-resume" element={<CreateMentorResume userData={userData} />} />
                <Route
                  path="*"
                  element={
                    <MentorBasicDetails
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path="basic-details"
                  element={<BasicDetails userData={userData} />}
                />
                <Route
                  path="resume"
                  element={
                    <Resume
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route path="create-resume" element={<CreateResume />} />
                <Route
                  path="about"
                  element={
                    <About
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="skills"
                  element={
                    <Skills
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="education"
                  element={
                    <Education
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="work-experience"
                  element={
                    <WorkExperience
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="accomplishments-and-initiatives"
                  element={
                    <Accomplishments
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="personal-details"
                  element={
                    <PersonalDetails
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
                <Route
                  path="social-links"
                  element={
                    <SocialLinks
                      userData={userData}
                      updateCompletionStatus={updateCompletionStatus}
                    />
                  }
                />
<Route
  path="preference"
  element={
    <Preference
      userData={userData}
      updateCompletionStatus={updateCompletionStatus}
      preferredRegion={preferredRegion}
        setPreferredRegion={setPreferredRegion}
        locationjson={locationjson}
        setLocation={setLocation}
        isProcessing={isProcessing}
        customSelectStyles={customSelectStyles}
    />
  }
/>

                <Route
                  path="*"
                  element={<BasicDetails userData={userData} />}
                />
                
              </>
            )}
          </Routes>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-5 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Share Profile Modal */}
      {showShareModal && <ShareProfileModal />}
    </div>
  );
};

export default ProfileEditPage;