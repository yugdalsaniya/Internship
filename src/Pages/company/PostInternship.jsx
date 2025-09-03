import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import { formatDistanceToNow, parse } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/Navbar/logo.png';
import backgroundImg from '../../assets/Hero/banner.jpg';

const PostInternship = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(true); // Assume active initially, updated in fetch
  const [approvalError, setApprovalError] = useState('');
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [isButtonChecking, setIsButtonChecking] = useState(false); // New state for button-triggered checks
  const [initialApprovalCheck, setInitialApprovalCheck] = useState(true);

  // Redirect if not a company user
  useEffect(() => {
    if (user.role !== 'company') {
      navigate('/');
    }
  }, [user.role, navigate]);

  // Enhanced function to fetch company approval status with retry logic
  const fetchCompanyApproval = async (isButtonTriggered = false, retryCount = 0, maxRetries = 2) => {
    setIsCheckingApproval(true);
    if (isButtonTriggered) {
      setIsButtonChecking(true); // Set button-specific checking state
    }
    setApprovalError('');

    try {
      if (!user.companyId && !user.email) {
        throw new Error('Missing company ID and email in user data. Please contact support.');
      }

      const companyData = await fetchSectionData({
        dbName: 'internph',
        collectionName: 'company',
        query: {
          $or: [
            ...(user.companyId ? [{ companyId: user.companyId }] : []),
            ...(user.email ? [{ 'sectionData.Company.username': user.email }] : []),
          ],
        },
        limit: 1,
        cacheBust: new Date().getTime(),
      });

      if (!companyData || companyData.length === 0) {
        throw new Error('Company record not found in database. Please ensure your account is properly set up or contact support.');
      }

      const company = companyData[0];
      if (!company.sectionData?.Company) {
        throw new Error('Invalid company data structure. Please contact support.');
      }

      const approvalStatus = company.sectionData.Company.isapprove === true;
      const prevApprovalStatus = JSON.parse(localStorage.getItem('isCompanyApproved')) || false;
      const hasShownNotApprovedToast = JSON.parse(localStorage.getItem('hasShownNotApprovedToast')) || false;

      // Update approval status
      setIsApproved(approvalStatus);

      // Manage approval timestamp (store when first approved)
      let approvalTimestamp = parseInt(localStorage.getItem('approvalTimestamp'));
      if (approvalStatus && !approvalTimestamp) {
        approvalTimestamp = Date.now();
        localStorage.setItem('approvalTimestamp', approvalTimestamp.toString());
      }

      // Calculate if trial is active (5 min for demo; 6 months for prod)
      const trialPeriod = 6 * 30 * 24 * 60 * 60 * 1000; // Demo: 5 minutes. 5 * 60 * 1000  For prod: 6 * 30 * 24 * 60 * 60 * 1000 (approx 6 months)
      const trialActive = approvalStatus && approvalTimestamp && (Date.now() - approvalTimestamp < trialPeriod);
      setIsTrialActive(trialActive);

      // Update localStorage with the latest data
      const updatedUser = {
        ...user,
        sectionData: {
          ...user.sectionData,
          Company: {
            ...(user.sectionData?.Company || {}),
            ...company.sectionData.Company,
            isapprove: approvalStatus,
          },
        },
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('isCompanyApproved', JSON.stringify(approvalStatus));

      // Show toasts based on conditions
      if (isButtonTriggered) {
        // Button-triggered toasts
        if (approvalStatus) {
          toast.success('Your company is now approved to post internships!', {
            autoClose: 5000,
            hideProgressBar: false,
          });
        } else {
          toast.info('Your company is not yet approved to post internships. Please wait for admin approval.', {
            autoClose: 5000,
            hideProgressBar: false,
          });
        }
      } else {
        // Automatic toasts (initial load or polling)
        if (approvalStatus && !prevApprovalStatus && !initialApprovalCheck) {
          toast.success('Your company is now approved to post internships!', {
            autoClose: 5000,
            hideProgressBar: false,
          });
          // Clear not approved toast flag when company gets approved
          localStorage.setItem('hasShownNotApprovedToast', JSON.stringify(false));
        } else if (!approvalStatus && initialApprovalCheck && !hasShownNotApprovedToast) {
          toast.info('Your company is not yet approved to post internships. Please wait for admin approval.', {
            autoClose: 5000,
            hideProgressBar: false,
          });
          // Set flag to prevent showing not approved toast again
          localStorage.setItem('hasShownNotApprovedToast', JSON.stringify(true));
        }
      }

    } catch (err) {
      console.error('Company approval check failed:', {
        error: err.message,
        companyId: user.companyId || 'N/A',
        email: user.email || 'N/A',
        retryCount,
      });

      // Retry logic for transient errors
      if (retryCount < maxRetries && err.message.includes('Company record not found in database')) {
        console.log(`Retrying fetchCompanyApproval (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchCompanyApproval(isButtonTriggered, retryCount + 1, maxRetries);
        }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
        return;
      }

      // Set user-friendly error message
      const errorMessage = err.message.includes('Company record not found')
        ? 'Company record not found. Please ensure your account is properly set up or contact support at support@inturnshp.ph.'
        : err.message || 'Failed to verify company approval status. Please try again or contact support.';
      setApprovalError(errorMessage);
      setIsApproved(false);
      toast.error(errorMessage, {
        autoClose: 8000,
        hideProgressBar: false,
      });

    } finally {
      setIsCheckingApproval(false);
      setIsButtonChecking(false); // Reset button-specific checking state
      if (!isButtonTriggered) {
        setInitialApprovalCheck(false);
      }
    }
  };

  // Fetch recent internships
  const fetchRecentInternships = async () => {
    try {
      const data = await fetchSectionData({
        dbName: 'internph',
        collectionName: 'jobpost',
        query: { 'sectionData.jobpost.type': 'Internship', companyId: user.companyId },
        limit: 100,
        order: -1,
        sortedBy: 'createdDate',
      });

      const formattedInternships = data
        .map((job) => {
          let relativeTime = 'Just now';
          let parsedDate;
          try {
            parsedDate = parse(job.createdDate, 'dd/MM/yyyy, h:mm:ss a', new Date());
            relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
              .replace('about ', '')
              .replace('hours', 'hrs')
              .replace('minutes', 'min');
          } catch (err) {
            console.error('Error parsing date for job', job._id, err);
          }

          return {
            id: job._id,
            title: job.sectionData?.jobpost?.title || 'Unknown Role',
            company: job.sectionData?.jobpost?.company || user.legalname || 'Your Company',
            location: (job.sectionData?.jobpost?.location || 'Unknown').toUpperCase(),
            type: job.sectionData?.jobpost?.time || 'Unknown',
            salary: job.sectionData?.jobpost?.salary
              ? `${job.sectionData.jobpost.salary}`
              : 'Not specified',
            posted: relativeTime,
            logo: job.sectionData?.jobpost?.logo || 'https://placehold.co/40x40',
            createdDate: parsedDate,
          };
        })
        .sort((a, b) => b.createdDate - a.createdDate)
        .slice(0, 2);

      setRecentInternships(formattedInternships);
    } catch (err) {
      setError('Error fetching recent internships');
      console.error('PostInternship API Error:', err);
      toast.error('Error fetching recent internships');
    } finally {
      setLoading(false);
    }
  };

  // Check approval status on component mount and set up polling
  useEffect(() => {
    fetchCompanyApproval();
    fetchRecentInternships();

    // Set up polling to check approval status every 30 seconds
    const approvalPollInterval = setInterval(() => {
      fetchCompanyApproval();
    }, 30000);

    // Cleanup polling interval on component unmount
    return () => clearInterval(approvalPollInterval);
  }, [user.companyId, user.legalname]);

  if (user.role !== 'company') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Post an Internship
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            Connect with top talent and build your team with Inturnshp Philippines.
          </p>
          
          {approvalError ? (
            <div className="mt-4 p-4 bg-red-50 rounded-lg max-w-md mx-auto">
              <p className="text-red-600 font-medium">{approvalError}</p>
              <p className="text-sm text-red-500 mt-2">
                Company ID: {user.companyId || 'Not available'}
                {user.email ? `, Email: ${user.email}` : ''}
              </p>
              <button
                onClick={() => fetchCompanyApproval(true)}
                disabled={isCheckingApproval}
                className="mt-2 bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-gray-600 disabled:opacity-50"
              >
                {isCheckingApproval ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          ) : isCheckingApproval && isButtonChecking ? (
            <p className="text-sm text-gray-600">Checking approval status...</p>
          ) : isApproved ? (
            isTrialActive ? (
              <button
                onClick={() => navigate('/post-internship/form')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Post Internship
              </button>
            ) : (
              <div>
                <p className="text-sm text-red-600 mb-4 max-w-md mx-auto">
                  Your free trial period has expired. Please subscribe to become a member and continue posting internships.
                </p>
                <button
                  onClick={() => navigate('/subscription-plans')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Subscribe Now
                </button>
              </div>
            )
          ) : (
            <div>
              <button
                onClick={() => fetchCompanyApproval(true)}
                disabled={isCheckingApproval}
                className="bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-gray-600 disabled:opacity-50"
              >
                {isCheckingApproval ? 'Checking...' : 'Check Approval Status'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6 text-center">
            Why Post Internships with Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Access Top Talent',
                description: 'Reach thousands of motivated students eager to kickstart their careers.',
              },
              {
                title: 'Build Your Brand',
                description: 'Showcase your company to the next generation of professionals.',
              },
              {
                title: 'Flexible Hiring',
                description: 'Post internships tailored to your needs, from part-time to full-time.',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <h3 className="text-lg font-semibold text-[#050748] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Internships Section */}
      <div className="px-4 md:px-12 py-8 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6 text-center">
            Your Recent Internships
          </h2>
          {loading ? (
            <p className="text-center text-sm text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-sm text-gray-600">{error}</p>
          ) : recentInternships.length === 0 ? (
            <p className="text-center text-sm text-gray-600">
              {isApproved && isTrialActive
                ? 'No internships posted yet. Start by posting your first internship!'
                : isApproved
                ? 'Your free trial has expired. Subscribe to post more internships.'
                : 'Your company needs approval to post internships.'}
            </p>
          ) : (
            <div className="space-y-4">
              {recentInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="flex flex-col bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {internship.posted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <img
                          src={internship.logo}
                          alt={`${internship.company} Logo`}
                          className="w-10 h-10 rounded-full object-contain"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-[#050748]">
                            {internship.title}
                          </h3>
                          <p className="text-sm text-gray-500">{internship.company}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center space-x-2 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {internship.type}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.657 0 3 .895 3 2s-1.343 2-3 2m0 0c-1.657 0-3 .895-3 2s1.343 2 3 2m-6 0V6m12 12V6"
                            />
                          </svg>
                          {internship.salary}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {internship.location}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/internshipdetail/${internship.id}`)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 md:px-12 py-8 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-4">
            Ready to Find More Talent?
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {isApproved && isTrialActive
              ? 'Explore our platform features or contact our support team to learn more about how Inturnshp Philippines can help your company grow.'
              : isApproved
              ? 'Your free trial has expired. Subscribe to become a member and post internships.'
              : 'Your company needs approval to post internships. Contact support to get approved and start posting!'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/features')}
              className="border border-gray-400 text-gray-700 text-sm font-medium py-2 px-6 rounded-full hover:bg-gray-100"
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInternship;