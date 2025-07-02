import React, { useState, useEffect, useRef } from 'react';
import bannerImage from '../../assets/Hero/banner.jpg';
import internshipImage from '../../assets/Hero/internship.png';
import candidateImage from '../../assets/Hero/candidate.png';
import companiesImage from '../../assets/Hero/company.png';
import academyImage from '../../assets/Hero/company.png';
import { fetchSectionData } from '../../Utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
  stats: statsProp,
}) => {
  const [stats, setStats] = useState([
    {
      count: '0',
      label: 'Internships',
      image: internshipImage,
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Candidates',
      image: candidateImage,
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Companies',
      image: companiesImage,
      bgColor: 'bg-[#6A6A8E]',
    },
    {
      count: '0',
      label: 'Academy',
      image: academyImage,
      bgColor: 'bg-[#6A6A8E]',
    },
  ]);

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(['Select Category']);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Preload background image
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = backgroundImage;
  }, [backgroundImage]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchSectionData({
          collectionName: 'category',
          query: {},
        });
        const categories = response.map((cat) => cat.sectionData?.category?.titleofinternship || 'Unknown');
        setCategoryOptions(['Select Category', ...new Set(categories)]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    };
    fetchCategories();
  }, []);

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      setError('Location search unavailable: API key not configured.');
      toast.error('Location search unavailable: API key not configured.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('Google Maps API already loaded');
          resolve();
          return;
        }
        const scriptId = 'google-maps-script';
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log('Google Maps API script loaded successfully');
            resolve();
          };
          script.onerror = () => {
            console.error('Failed to load Google Maps API script');
            reject(new Error('Failed to load Google Maps API'));
          };
          document.head.appendChild(script);
        } else {
          if (script.dataset.loaded) {
            resolve();
          } else {
            script.addEventListener('load', resolve);
            script.addEventListener('error', reject);
          }
        }
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          throw new Error('Google Maps Places library not loaded');
        }
        console.log('Google Maps Places library loaded');
        setIsGoogleMapsLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Location suggestions unavailable. Please type a city manually.');
        toast.error('Location suggestions unavailable. Please type a city manually.', {
          position: 'top-right',
          autoClose: 5000,
        });
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        console.log('Cleaning up Google Maps Autocomplete listeners');
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && locationInputRef.current && !autocompleteRef.current) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ['(cities)'],
            fields: ['formatted_address', 'name'],
            componentRestrictions: { country: 'ph' },
          }
        );
        console.log('Google Maps Autocomplete initialized');
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          console.log('Place changed:', place);
          if (place.formatted_address || place.name) {
            setLocation(place.formatted_address || place.name);
            setError('');
          } else {
            setLocation('');
            setError('Please select a valid location.');
          }
        });
      } catch (err) {
        console.error('Error initializing Google Maps Autocomplete:', err);
        setError('Location suggestions unavailable. Please type a city manually.');
        toast.error('Location suggestions unavailable. Please type a city manually.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    }
  }, [isGoogleMapsLoaded]);

  // Fetch suggestions
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

  // Fetch stats
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

    if (statsProp === undefined) {
      fetchCounts();
    }
  }, [statsProp]);

  const effectiveStats = statsProp !== undefined ? statsProp : stats;

  const handlePostInternship = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = !!user && !!localStorage.getItem('accessToken');

    if (isAuthenticated) {
      if (user.roleId === '1747825619417') {
        navigate('/StudentPostForm');
      } else {
        setError('Only company users can post internships.');
        toast.error('Only company users can post internships.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    } else {
      navigate('/login', { state: { from: '/StudentPostForm' } });
    }
  };

  const handleSearch = () => {
    console.log('Search triggered with:', { searchQuery, location, category });
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.set('search', searchQuery.trim());
    }
    if (location.trim()) {
      queryParams.set('location', location.trim());
    }
    if (category && category !== 'Select Category') {
      queryParams.set('category', category.trim());
    }
    const queryString = queryParams.toString();
    const targetUrl = queryString ? `/internship?${queryString}` : '/internship';
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
      className="relative bg-cover bg-center py-20 px-4 sm:px-6 lg:px-12"
      style={{
        backgroundImage: `${gradient}, url(${backgroundImage})`,
        backgroundPosition: '10% 20%',
      }}
    >
      <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto w-full">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#050748] mb-3">
          {title}
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
          {subtitle}
        </p>

        {/* Search Bar */}
        {searchFields.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md flex flex-col w-full max-w-3xl overflow-visible space-y-2 sm:space-y-0 sm:flex-row">
            {searchFields.map((field, index) => (
              <React.Fragment key={index}>
                {field.type === 'input' && field.placeholder === 'Internship Title or Company' ? (
                  <div className="relative flex-1 px-4 py-3">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full h-10 border-none text-center text-sm sm:text-xs focus:outline-none placeholder-gray-500 touch-manipulation"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg left-0 touch-manipulation">
                        {isLoadingSuggestions ? (
                          <li className="p-2 text-sm text-gray-600">Loading...</li>
                        ) : (
                          suggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="p-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer active:bg-gray-200"
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
                  <div className="relative flex-1 px-4 py-3 sm:border-l sm:border-gray-200">
                    <input
                      type="text"
                      placeholder={isGoogleMapsLoaded ? field.placeholder : 'Type city manually'}
                      className="w-full h-10 border-none text-center text-sm sm:text-xs focus:outline-none placeholder-gray-500 touch-manipulation"
                      ref={locationInputRef}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {error && (
                      <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                  </div>
                ) : field.type === 'select' ? (
                  <div className="relative flex-1 px-4 py-3 sm:border-l sm:border-gray-200">
                    <select
                      className="w-full h-10 border-none text-center text-sm sm:text-xs focus:outline-none appearance-none bg-transparent touch-manipulation"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    >
                      {categoryOptions.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            ))}
            <button
              onClick={handleSearch}
              className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-7 py-3 text-sm sm:text-xs font-medium hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800 transition-colors rounded-b-2xl sm:rounded-r-2xl sm:rounded-b-none"
            >
              Search Internship
            </button>
          </div>
        )}

        {/* Post Internship Button */}
        {showPostButton && (
          <div className="flex flex-col items-center">
            <button
              onClick={handlePostInternship}
              className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md py-3 px-8 text-sm font-medium hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800 transition-colors"
            >
              Post Internship
            </button>
            {error && !isGoogleMapsLoaded && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Stats Section */}
        {effectiveStats.length > 0 && (
          <div className="w-full flex justify-center items-center">
            <div className="grid grid-cols-2 gap-4 justify-center items-center lg:flex lg:flex-row lg:flex-wrap lg:gap-8 mt-8 w-full max-w-7xl mx-auto">
              {effectiveStats.map((stat, index) => (
                <StatCard
                  key={index}
                  count={stat.count}
                  label={stat.label}
                  image={stat.image}
                  bgColor={stat.bgColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const StatCard = ({ count, label, image, bgColor }) => (
  <div className="flex items-center justify-center space-x-3 w-full sm:w-auto">
    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
      <img src={image} alt={`${label} icon`} className="w-6 h-6 object-contain" />
    </div>
    <div className="flex flex-col text-left">
      <p className="text-lg font-semibold text-gray-800">{count}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  </div>
);

export default Hero;