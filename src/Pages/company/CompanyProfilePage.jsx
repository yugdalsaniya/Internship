import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';

const CompanyProfilePage = () => {
  const { id, companySlug } = useParams(); // Extract id and companySlug
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const companyRef = useRef(null);
  const aboutRef = useRef(null);
  const internshipsRef = useRef(null);
  const [activeSection, setActiveSection] = useState('company');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyData = await fetchSectionData({
          collectionName: 'company',
          query: { _id: id },
          limit: 1,
        });
        if (companyData && companyData.length > 0) {
          setCompany(companyData[0]);
        } else {
          setError('Company not found');
        }

        const internshipData = await fetchSectionData({
          collectionName: 'jobpost',
          query: { createdBy: id, 'sectionData.jobpost.type': 'Internship' },
          limit: 20,
          order: -1,
          sortedBy: 'createdAt',
        });
        setInternships(internshipData);
      } catch (err) {
        setError('Error fetching company or internship data');
        console.error('CompanyProfilePage API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const scrollToSection = (ref, section) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(section);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="animate-pulse bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
        <div className="h-64 w-full bg-gray-200 rounded-t-xl"></div>
        <div className="flex items-end mt-4">
          <div className="h-20 w-20 bg-gray-200 rounded-full ml-6"></div>
          <div className="ml-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mt-6 mx-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mx-6">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-red-100 text-red-700 text-lg font-medium p-4 rounded-lg shadow-md">
        {error || 'Company not found'}
      </div>
    </div>
  );

  const {
    sectionData: {
      Company: {
        name,
        organizationName,
        description,
        organizationcity,
        industry,
        noofemployees,
        starRating,
        primaryImage,
        logoImage,
        termsAndConditions,
        chainAffiliation,
      },
    },
  } = company;

  // Convert starRating to a number, with fallback to 0 if invalid
  const parsedStarRating = typeof starRating === 'string' ? parseFloat(starRating) : starRating;
  const displayRating = !isNaN(parsedStarRating) && parsedStarRating >= 0 ? parsedStarRating : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Banner Image */}
        <div className="relative w-full h-64 sm:h-80">
          <img
            src={primaryImage || 'https://placehold.co/1200x400'}
            alt={`${name} Header`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Logo and Company Header */}
        <div className="relative px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <img
            src={logoImage || 'https://placehold.co/150x150'}
            alt={`${name} Logo`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-contain bg-white -mt-12 sm:-mt-14 shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 text-lg">{'★'.repeat(Math.round(displayRating))}</span>
              <span className="text-gray-500 text-sm ml-2">
                ({displayRating > 0 ? displayRating.toFixed(1) : 'Not rated'} / 5)
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 sm:px-8 py-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection(companyRef, 'company')}
              className={`text-base font-medium transition-colors ${activeSection === 'company' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              aria-label="Scroll to Company section"
            >
              Company
            </button>
            <button
              onClick={() => scrollToSection(aboutRef, 'about')}
              className={`text-base font-medium transition-colors ${activeSection === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              aria-label="Scroll to About section"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection(internshipsRef, 'internships')}
              className={`text-base font-medium transition-colors ${activeSection === 'internships' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              aria-label="Scroll to Internships section"
            >
              Internships
            </button>
          </div>
        </div>

        {/* Company Section */}
        <div ref={companyRef} className="px-6 sm:px-8 py-10 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Company Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Location</h3>
              <p className="text-gray-600 text-base">{organizationcity || 'Not specified'}</p>
            </div>
            <div>
  <h3 className="text-sm font-semibold text-gray-700">Industry</h3>
  <p className="text-gray-600 text-base">
    {Array.isArray(industry) ? industry.join(', ') : industry || 'Not specified'}
  </p>
</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Company Size</h3>
              <p className="text-gray-600 text-base">{noofemployees || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Chain Affiliation</h3>
              <p className="text-gray-600 text-base">{chainAffiliation || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div ref={aboutRef} className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">About Company</h2>
          <p className="text-gray-600 text-base leading-relaxed">{description || 'No description available.'}</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-8 mb-4">Terms and Conditions</h2>
          <p className="text-gray-600 text-base leading-relaxed">{termsAndConditions || 'No terms available.'}</p>
        </div>

        {/* Internships Section */}
        <div ref={internshipsRef} className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Internships</h2>
          {internships.length === 0 ? (
            <p className="text-gray-600 text-base">No internships available.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {internships.map((internship) => (
                <Link
                  key={internship._id}
                  to={`/internshipdetail/${internship._id}`}
                  className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  aria-label={`View details for ${internship.sectionData.jobpost.title}`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={internship.sectionData.jobpost.logo || 'https://placehold.co/60x60'}
                      alt={`${internship.sectionData.jobpost.title} Logo`}
                      className="w-12 h-12 object-contain rounded-md flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {internship.sectionData.jobpost.title || 'Untitled Internship'}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {internship.sectionData.jobpost.description || 'No description'}...
                      </p>
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Location:</span> {internship.sectionData.jobpost.location || 'Not specified'}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span> {internship.sectionData.jobpost.internshipduration || 'Not specified'}
                        </p>
                        <p>
                          <span className="font-medium">Experience:</span> {internship.sectionData.jobpost.experiencelevel || 'Not specified'}
                        </p>
                        <p>
                          <span className="font-medium">Deadline:</span> {internship.sectionData.jobpost.applicationdeadline || 'Not specified'}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {internship.sectionData.jobpost.time || 'Not specified'}
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {internship.sectionData.jobpost.experiencelevel || 'Not specified'}
                        </span>
                      </div>
                      <button className="mt-4 text-blue-600 font-medium text-sm hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sticky {
          position: -webkit-sticky;
          position: sticky;
          z-index: 10;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .min-h-screen {
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
          }
          .h-64 {
            height: 20rem;
          }
          .w-24 {
            width: 7rem;
            height: 7rem;
          }
          .text-2xl {
            font-size: 1.875rem;
          }
        }
        @media (min-width: 1024px) {
          .h-80 {
            height: 24rem;
          }
          .w-28 {
            width: 7rem;
            height: 7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyProfilePage;