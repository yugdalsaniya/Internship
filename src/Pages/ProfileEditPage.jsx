import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
import { FaChevronLeft, FaFileMedical } from 'react-icons/fa';

function ProfileEditPage() {
  const [activeSection, setActiveSection] = useState('Basic Details');
  const location = useLocation();

  // Map URL paths to section labels
  const pathToSection = {
    'basic-details': 'Basic Details',
    'resume': 'Resume',
    'about': 'About',
    'skills': 'Skills',
    'education': 'Education',
    'work-experience': 'Work Experience',
    'accomplishments-and-initiatives': 'Accomplishments & Initiatives',
    'personal-details': 'Personal Details',
    'social-links': 'Social Links',
  };

  // Sync activeSection with URL on page load or URL change
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const section = pathToSection[path] || 'Basic Details'; // Default to 'Basic Details' if path not found
    setActiveSection(section);
  }, [location]);

  const sections = [
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
        <div className="flex items-center p-4 gap-3">
          <Link to="/">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
              <FaChevronLeft className="text-gray-600 text-sm" />
            </button>
          </Link>
          <h1 className="text-base font-semibold text-gray-800">Edit Profile</h1>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar - Fixed on larger screens */}
        <div className="w-full md:w-[320px] pt-16 border-r bg-white fixed top-0 left-0 h-screen flex flex-col">
          {/* Static Top Content */}
          <div className="p-4 space-y-4">
            {/* Resume Card */}
            <div className="flex items-center justify-center">
              <button className="bg-[#0073e6] text-white font-semibold px-14 py-2 rounded flex items-center gap-2">
                <FaFileMedical className="text-white text-lg" />
                Create your Resume
              </button>
            </div>

            {/* Profile Progress */}
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

          {/* Scrollable Section List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {sections.map((section) => (
              <Link to={`/editprofile/${section.path}`} key={section.label}>
                <SidebarItem
                  completed={section.completed}
                  label={section.label}
                  isActive={activeSection === section.label}
                  isRequired={section.required}
                  onClick={() => setActiveSection(section.label)}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="w-full md:w-[calc(100%-320px)] md:ml-[320px] pt-16 bg-white p-6 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="basic-details" element={<BasicDetails />} />
            <Route path="resume" element={<Resume />} />
            <Route path="about" element={<About />} />
            <Route path="skills" element={<Skills />} />
            <Route path="education" element={<Education />} />
            <Route path="work-experience" element={<WorkExperience />} />
            <Route path="accomplishments-and-initiatives" element={<Accomplishments />} />
            <Route path="personal-details" element={<PersonalDetails />} />
            <Route path="social-links" element={<SocialLinks />} />
            {/* Default route */}
            <Route path="*" element={<BasicDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditPage;