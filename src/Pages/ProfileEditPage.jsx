import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FaChevronLeft, FaFileMedical, FaBars, FaTimes } from 'react-icons/fa';
import SidebarItem from '../Components/profile/SidebarItem';
import BasicDetails from '../Components/profile/BasicDetails';
import Resume from '../Components/profile/Resume';
import About from '../Components/profile/About';
import Skills from '../Components/profile/Skills';
import Education from '../Components/profile/Education';
import WorkExperience from '../Components/profile/WorkExperience';
import Accomplishments from '../Components/profile/Accomplishments';
import PersonalDetails from '../Components/profile/PersonalDetails';
import SocialLinks from '../Components/profile/SocialLinks';
import ComponyDetails from '../Components/profile/ComponyDetails';
import OrganizationDetails from '../Components/profile/OrganizationDetails';

const ProfileEditPage = () => {
  const [activeSection, setActiveSection] = useState('Compony Details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Get user and pendingUser from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const pendingUser = JSON.parse(localStorage.getItem('pendingUser')) || {};
  const allowedRoles = ['company', 'academy'];

  // Combine user and pendingUser data
  const userData = {
    ...pendingUser,
    ...user,
    legalname: user.legalname || pendingUser.legalname || '',
    email: user.email || pendingUser.email || '',
    role: user.role || pendingUser.role || '',
    roleId: user.roleId || pendingUser.roleId || '',
    companyId: user.companyId || '',
    academyname: pendingUser.academyname || '',
  };

  // Map URL paths to section labels
  const pathToSection = {
    'basic-details': 'Basic Details',
    resume: 'Resume',
    about: 'About',
    skills: 'Skills',
    education: 'Education',
    'work-experience': 'Work Experience',
    'accomplishments-and-initiatives': 'Accomplishments & Initiatives',
    'personal-details': 'Personal Details',
    'social-links': 'Social Links',
    'compony-details': 'Compony Details',
    'organization-details': 'Organization Details',
  };

  // Sync activeSection with URL on page load or URL change
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const section = pathToSection[path] || (allowedRoles.includes(userData.role) ? 'Compony Details' : 'Basic Details');
    setActiveSection(section);
  }, [location, userData.role]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Define sections based on user role
  const sections = allowedRoles.includes(userData.role)
    ? [
        { label: 'Compony Details', path: 'compony-details', completed: false, required: false },
        { label: 'Organization Details', path: 'organization-details', completed: false, required: false },
      ]
    : [
        { label: 'Basic Details', path: 'basic-details', completed: true, required: true },
        { label: 'Resume', path: 'resume', completed: false, required: true },
        { label: 'About', path: 'about', completed: false, required: true },
        { label: 'Skills', path: 'skills', completed: false, required: true },
        { label: 'Education', path: 'education', completed: false, required: false },
        { label: 'Work Experience', path: 'work-experience', completed: false, required: false },
        { label: 'Accomplishments & Initiatives', path: 'accomplishments-and-initiatives', completed: false, required: false },
        { label: 'Personal Details', path: 'personal-details', completed: false, required: false },
        { label: 'Social Links', path: 'social-links', completed: false, required: false },
      ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Upper Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-20 h-16">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                <FaChevronLeft className="text-gray-600 text-sm" />
              </button>
            </Link>
            <h1 className="text-base font-semibold text-gray-800">Edit Profile</h1>
          </div>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <div
          className={`w-full md:w-[320px] pt-16 border-r bg-white fixed top-0 left-0 h-screen flex flex-col z-10 transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:block`}
        >
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
              <div className="flex items-center justify-center">
                <button className="bg-[#0073e6] text-white font-semibold px-14 py-2 rounded flex items-center gap-2">
                  <FaFileMedical className="text-white text-lg" />
                  Create your Resume
                </button>
              </div>
            )}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-sm">Enhance your Profile</h3>
              <p className="text-xs text-gray-500 mt-1">
                Stay ahead of the competition by regularly updating your profile.
              </p>
              <div className="w-full bg-gray-300 h-2 rounded-full mt-3 relative">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-right text-xs font-semibold mt-1 text-gray-700">75%</p>
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

        {/* Main Content */}
        <div
          className={`w-full md:w-[calc(100%-320px)] md:ml-[320px] pt-16 bg-white p-6 overflow-y-auto min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen ? 'opacity-50 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''
          }`}
        >
          <Routes>
            {allowedRoles.includes(userData.role) ? (
              <>
                <Route path="compony-details" element={<ComponyDetails userData={userData} />} />
                <Route path="organization-details" element={<OrganizationDetails userData={userData} />} />
                <Route path="*" element={<Navigate to="/editprofile/compony-details" replace />} />
              </>
            ) : (
              <>
                <Route path="basic-details" element={<BasicDetails userData={userData} />} />
                <Route path="resume" element={<Resume userData={userData} />} />
                <Route path="about" element={<About userData={userData} />} />
                <Route path="skills" element={<Skills userData={userData} />} />
                <Route path="education" element={<Education userData={userData} />} />
                <Route path="work-experience" element={<WorkExperience userData={userData} />} />
                <Route path="accomplishments-and-initiatives" element={<Accomplishments userData={userData} />} />
                <Route path="personal-details" element={<PersonalDetails userData={userData} />} />
                <Route path="social-links" element={<SocialLinks userData={userData} />} />
                <Route path="*" element={<BasicDetails userData={userData} />} />
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
    </div>
  );
};

export default ProfileEditPage;