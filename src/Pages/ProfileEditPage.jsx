import React, { useState, useEffect, useCallback } from 'react';
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
import CompanyDetails from '../Components/profile/CompanyDetails';
import OrganizationDetails from '../Components/profile/OrganizationDetails';
import { fetchSectionData } from '../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfileEditPage = () => {
  const [activeSection, setActiveSection] = useState('Personal Details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({});
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const pendingUser = JSON.parse(localStorage.getItem('pendingUser')) || {};
  const allowedRoles = ['company', 'academy'];

  const userData = {
    ...pendingUser,
    ...user,
    userid: user.userid || pendingUser.userid || '',
    legalname: user.name || pendingUser.legalname || '',
    email: user.email || pendingUser.email || '',
    role: user.role || pendingUser.role || '',
    roleId: user.roleId || pendingUser.roleId || '',
    companyId: user.companyId || '',
    academyname: pendingUser.academyname || '',
  };

  useEffect(() => {
    console.log('userData in ProfileEditPage:', userData);
  }, [userData]);

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
    'company-details': 'Personal Details',
    'organization-details': 'Organization Details',
  };

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const section = pathToSection[path] || (allowedRoles.includes(userData.role) ? 'Personal Details' : 'Basic Details');
    setActiveSection(section);
  }, [location, userData.role]);

  const updateCompletionStatus = useCallback((section, status) => {
    setCompletionStatus((prev) => {
      const newStatus = { ...prev, [section]: status };
      console.log(`Updated completionStatus in ProfileEditPage:`, newStatus);
      return newStatus;
    });
  }, []);

  useEffect(() => {
    const fetchCompletionStatuses = async () => {
      try {
        const userId = userData.userid;
        const companyId = userData.companyId;
        if (!userId) {
          console.error('User ID not found in userData:', userData);
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
            appName: 'app8657281202648',
            collectionName: 'appuser',
            query: { _id: userId },
            projection: {
              'sectionData.appuser.resume': 1,
              'sectionData.appuser.about': 1,
              'sectionData.appuser.skills': 1,
              'sectionData.appuser.pronouns': 1,
              'sectionData.appuser.dOB': 1,
              'sectionData.appuser.addressline1': 1,
              'sectionData.appuser.zipcode1': 1,
              'sectionData.appuser.location1': 1,
              'sectionData.appuser.addressline3': 1,
              'sectionData.appuser.zipcode2': 1,
              'sectionData.appuser.location2': 1,
              'sectionData.appuser.copycurrentaddress': 1,
              'sectionData.appuser.hobbies': 1,
              'sectionData.appuser.linkedIn': 1,
              'sectionData.appuser.facebook': 1,
              'sectionData.appuser.instagram': 1,
              'sectionData.appuser.x': 1,
              'sectionData.appuser.git': 1,
              'sectionData.appuser.medium': 1,
              'sectionData.appuser.reddit': 1,
              'sectionData.appuser.slack': 1,
              'sectionData.appuser.dribbble': 1,
              'sectionData.appuser.behance': 1,
              'sectionData.appuser.workexperience2': 1,
              'sectionData.appuser.education': 1,
              'sectionData.appuser.intermediateeducation': 1,
              'sectionData.appuser.highschooleducation': 1,
              'sectionData.appuser.legalname': 1,
              'sectionData.appuser.email': 1,
              'sectionData.appuser.mobile': 1,
              'sectionData.appuser.organisationcollege': 1,
              'sectionData.appuser.post': 1,
              'sectionData.appuser.certificatesdetails': 1,
              'sectionData.appuser.projectdetails': 1,
              'sectionData.appuser.achievementsdetails': 1,
              'sectionData.appuser.responsibilitydetails': 1,
            },
          })
        );

        let organizationData = {};
        if (allowedRoles.includes(userData.role) && companyId) {
          const companyResponse = await fetchWithRetry(() =>
            fetchSectionData({
              appName: 'app8657281202648',
              collectionName: 'company',
              query: { _id: companyId },
              projection: {
                'sectionData.Company.organizationName': 1,
                'sectionData.Company.organizationcity': 1,
                'sectionData.Company.industry': 1,
                'sectionData.Company.noofemployees': 1,
              },
            })
          );
          organizationData = companyResponse[0]?.sectionData?.Company || {};
        }

        console.log('fetchSectionData response in ProfileEditPage:', JSON.stringify({ userResponse, organizationData }, null, 2));
        const apiData = userResponse[0]?.sectionData?.appuser || {};
        const newCompletionStatus = {
          Resume: !!apiData.resume,
          About: !!apiData.about?.trim(),
          Skills: !!apiData.skills?.length,
          'Personal Details': allowedRoles.includes(userData.role)
            ? !!apiData.legalname &&
              !!apiData.email &&
              !!apiData.mobile &&
              (userData.roleId !== '1747903042943' ||
                (!!apiData.organisationcollege && !!apiData.post))
            : !!apiData.addressline1 &&
              !!apiData.zipcode1 &&
              !!apiData.location1 &&
              (apiData.copycurrentaddress ||
                (!!apiData.addressline3 &&
                  !!apiData.zipcode2 &&
                  !!apiData.location2)),
          'Social Links':
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
          'Work Experience': !!apiData.workexperience2?.length,
          Education:
            !!apiData.education?.length ||
            !!apiData.intermediateeducation?.length ||
            !!apiData.highschooleducation?.length,
          'Organization Details':
            !!organizationData.organizationName &&
            !!organizationData.organizationcity &&
            !!organizationData.industry?.length &&
            !!organizationData.noofemployees,
          'Accomplishments & Initiatives':
            !!apiData.certificatesdetails?.length ||
            !!apiData.projectdetails?.length ||
            !!apiData.achievementsdetails?.length ||
            !!apiData.responsibilitydetails?.length,
        };
        setCompletionStatus(newCompletionStatus);
        console.log('Set completionStatus:', newCompletionStatus);
      } catch (err) {
        console.error('Error fetching completion statuses:', err.message, err.stack);
        toast.error('Failed to load completion statuses. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    };

    if (userData.userid) {
      fetchCompletionStatuses();
    }
  }, [userData.userid, userData.companyId, userData.role]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const sections = allowedRoles.includes(userData.role)
    ? [
        { label: 'Personal Details', path: 'company-details', completed: completionStatus['Personal Details'] || false, required: false },
        ...(userData.roleId !== '1747903042943' ? [
          { label: 'Organization Details', path: 'organization-details', completed: completionStatus['Organization Details'] || false, required: false }
        ] : []),
      ]
    : [
        { label: 'Basic Details', path: 'basic-details', completed: completionStatus['Basic Details'] || true, required: true },
        { label: 'Resume', path: 'resume', completed: completionStatus['Resume'] || false, required: true },
        { label: 'About', path: 'about', completed: completionStatus['About'] || false, required: true },
        { label: 'Skills', path: 'skills', completed: completionStatus['Skills'] || false, required: true },
        { label: 'Education', path: 'education', completed: completionStatus['Education'] || false, required: false },
        { label: 'Work Experience', path: 'work-experience', completed: completionStatus['Work Experience'] || false, required: false },
        { label: 'Accomplishments & Initiatives', path: 'accomplishments-and-initiatives', completed: completionStatus['Accomplishments & Initiatives'] || false, required: false },
        { label: 'Personal Details', path: 'personal-details', completed: completionStatus['Personal Details'] || false, required: false },
        { label: 'Social Links', path: 'social-links', completed: completionStatus['Social Links'] || false, required: false },
      ];

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
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

      <div className="flex flex-col md:flex-row flex-1">
        <div
          className={`w-full md:w-[320px] pt-16 border-r bg-white fixed top-0 left-0 h-screen flex flex-col z-10 transmission-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:block`}
        >
          <div className="p-4 md:hidden">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 uncompromising-colors duration-200"
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
              <p className="text-xs text-gray-500. mt-1">
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

        <div
          className={`w-full md:w-[calc(100%-320px)] md:ml-[320px] pt-16 bg-white p-6 overflow-y-auto min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen ? 'opacity-50 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''
          }`}
        >
          <Routes>
            {allowedRoles.includes(userData.role) ? (
              <>
                <Route path="company-details" element={<CompanyDetails userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                {userData.roleId !== '1747903042943' && (
                  <Route path="organization-details" element={<OrganizationDetails userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                )}
                <Route path="*" element={<Navigate to="/editprofile/company-details" replace />} />
              </>
            ) : (
              <>
                <Route path="basic-details" element={<BasicDetails userData={userData} />} />
                <Route path="resume" element={<Resume userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="about" element={<About userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="skills" element={<Skills userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="education" element={<Education userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="work-experience" element={<WorkExperience userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="accomplishments-and-initiatives" element={<Accomplishments userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="personal-details" element={<PersonalDetails userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
                <Route path="social-links" element={<SocialLinks userData={userData} updateCompletionStatus={updateCompletionStatus} />} />
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