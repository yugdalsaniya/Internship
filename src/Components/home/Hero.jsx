import React, { useState, useEffect, useRef } from 'react';
import bannerImage from '../../assets/Hero/banner.jpg'; // Default background
import { fetchSectionData } from '../../Utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Replace with your valid Google Maps API key

const Hero = ({
  title = 'Top Internships and OJT Programs in the Philippines for Career Launch',
  subtitle = 'Connecting Talent with Opportunity: Your Gateway to Career Success',
  searchFields = [
    { type: 'input', placeholder: 'Internship Title or Company' },
    { type: 'input', placeholder: 'Search Location' },
    { type: 'select', placeholder: 'Select Category', options: ['Select Category'] },
  ],
  backgroundImage = bannerImage,
  gradient = 'linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))',
  showPostButton = false,
}) => {
  const [stats, setStats] = useState([
    {
      count: '0',
      label: 'Internships',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Candidates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Companies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012 2h2a2 2 0 012 2v5m-4 0h4" />
        </svg>
      ),
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Academy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m-2-4h14a2 2 0 012 2v2H3v-2a2 2 0 012-2z" />
        </svg>
      ),
      bgColor: 'bg-[#6A6A8E]',
    },
  ]);

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Google Maps Autocomplete for location
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          existingScript.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          throw new Error("Google Maps places library not loaded");
        }
        setIsGoogleMapsLoaded(true);
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            fields: ["formatted_address", "name"],
            componentRestrictions: { country: "ph" },
          }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address || place.name) {
            setLocation(place.formatted_address || place.name);
          }
        });
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        setError(
          "Location suggestions unavailable. Please type a city manually."
        );
        toast.error(
          "Location suggestions unavailable. Please type a city manually.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setTimeout(() => setError(""), 5000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  // Fetch internship title and company suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoadingSuggestions(true);
      try {
        const response = await fetchSectionData({
          collectionName: 'jobpost',
          query: {
            'sectionData.jobpost.type': 'Internship',
            $or: [
              { 'sectionData.jobpost.title': { $regex: searchQuery, $options: 'i' } },
              { 'sectionData.jobpost.company': { $regex: searchQuery, $options: 'i' } },
            ],
          },
          limit: 5,
        });
        const suggestionItems = response.map((job) => ({
          title: job.sectionData?.jobpost?.title || 'Unknown Title',
          company: job.sectionData?.jobpost?.company || 'Unknown Company',
        }));
        setSuggestions(suggestionItems);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  // Handle stats fetching
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const internshipResponse = await fetchSectionData({
          collectionName: 'jobpost',
          query: { 'sectionData.jobpost.type': 'Internship' },
        });
        const internshipCount = internshipResponse.length * 11;

        const studentResponse = await fetchSectionData({
          collectionName: 'appuser',
          query: { 'sectionData.appuser.role': '1747825619417' },
        });
        const studentCount = studentResponse.length * 11;

        const companyResponse = await fetchSectionData({
          collectionName: 'appuser',
          query: { 'sectionData.appuser.role': '1747723485001' },
        });
        const companyCount = companyResponse.length * 11;

        const academyResponse = await fetchSectionData({
          collectionName: 'appuser',
          query: { 'sectionData.appuser.role': '1747903042943' },
        });
        const academyCount = academyResponse.length * 11;

        setStats((prevStats) =>
          prevStats.map((stat) => {
            if (stat.label === 'Internships') {
              return { ...stat, count: internshipCount.toLocaleString() };
            }
            if (stat.label === 'Candidates') {
              return { ...stat, count: studentCount.toLocaleString() };
            }
            if (stat.label === 'Companies') {
              return { ...stat, count: companyCount.toLocaleString() };
            }
            if (stat.label === 'Academy') {
              return { ...stat, count: academyCount.toLocaleString() };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handlePostInternship = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = !!user && !!localStorage.getItem('accessToken');

    if (isAuthenticated) {
      if (user.roleId === '1747825619417') { // Student role
        navigate('/StudentPostForm');
      } else {
        setError('Only company users can post internships.');
      }
    } else {
      navigate('/login', { state: { from: '/StudentPostForm' } });
    }
  };

  const handleSearch = () => {
    console.log('handleSearch triggered with:', { searchQuery, location });
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.set('search', searchQuery.trim());
    }
    if (location.trim()) {
      queryParams.set('location', location.trim());
    }
    const queryString = queryParams.toString();
    const targetUrl = queryString ? `/internship?${queryString}` : '/internship';
    console.log('Navigating to:', targetUrl);
    try {
      navigate(targetUrl);
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Failed to perform search. Please try again.');
      toast.error('Failed to perform search. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.title || suggestion.company);
    setSuggestions([]);
  };

  return (
    <section
      className="relative bg-cover bg-center py-16 px-4 sm:px-12"
      style={{
        backgroundImage: `${gradient}, url(${backgroundImage})`,
      }}
    >
      <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-3">
          {title}
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
          {subtitle}
        </p>

        {/* Search Bar */}
        {searchFields.length > 0 && (
          <div className="bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center w-full max-w-3xl p-3 space-y-3 md:space-y-0 md:space-x-3 relative">
            {searchFields.map((field, index) => (
              <React.Fragment key={index}>
                {field.type === 'input' && field.placeholder === 'Internship Title or Company' ? (
                  <div className="relative w-full md:flex-1">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                        {isLoadingSuggestions ? (
                          <li className="p-2 text-sm text-gray-600">Loading...</li>
                        ) : (
                          suggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="p-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              {suggestion.title} - {suggestion.company}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                ) : field.type === 'input' && field.placeholder === 'Search Location' ? (
                  <div className="relative w-full md:flex-1">
                    <input
                      type="text"
                      placeholder={isGoogleMapsLoaded ? field.placeholder : 'Type city manually'}
                      className="w-full border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ref={locationInputRef}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={!isGoogleMapsLoaded && error}
                    />
                    {!isGoogleMapsLoaded && error && (
                      <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                  </div>
                ) : (
                  <select className="w-full md:flex-1 border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {field.options.map((option, optIndex) => (
                      <option key={optIndex}>{option}</option>
                    ))}
                  </select>
                )}
              </React.Fragment>
            ))}
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white rounded-md py-2 px-4 text-xs hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        )}

        {/* Post Internship Button (Conditional) */}
        {showPostButton && (
          <div className="flex flex-col items-center">
            <button
              onClick={handlePostInternship}
              className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md py-2 px-6 text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              Post Internship
            </button>
            {error && !isGoogleMapsLoaded && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Stats Section */}
        {stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                count={stat.count}
                label={stat.label}
                icon={stat.icon}
                bgColor={stat.bgColor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Reusable StatCard component
const StatCard = ({ count, label, icon, bgColor }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
      <div className="text-white">{icon}</div>
    </div>
    <div className="flex flex-col text-left">
      <p className="text-lg font-semibold text-gray-800">{count}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  </div>
);

export default Hero;