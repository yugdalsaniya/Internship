import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  BsBookmarkPlus,
  BsBookmarkFill,
  BsSearch,
  BsGeoAlt,
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSectionData } from "../Utils/api";
import { formatDistanceToNow, parse, sub } from "date-fns";
import Hero from "../Components/home/Hero";
import bannerImage from "../assets/Hero/banner1.jpg";
import { generateInternshipSlug } from "../Utils/slugify";

const InternshipPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [tempCategories, setTempCategories] = useState([]);
  const [tempTypes, setTempTypes] = useState([]);
  const [tempExperienceLevels, setTempExperienceLevels] = useState([]);
  const [tempDatePosted, setTempDatePosted] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [maxSalary, setMaxSalary] = useState(100000);
  const [appliedCategories, setAppliedCategories] = useState([]);
  const [appliedTypes, setAppliedTypes] = useState([]);
  const [appliedExperienceLevels, setAppliedExperienceLevels] = useState([]);
  const [appliedDatePosted, setAppliedDatePosted] = useState("All");
  const [bookmarked, setBookmarked] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [categories, setCategories] = useState([]);
  // New state for user preferences
  const [userPreferences, setUserPreferences] = useState({
    preferredRegion: "",
    preferredLocation: ""
  });
  const [preferenceFilter, setPreferenceFilter] = useState(false);
  const internshipsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();

  // Preload background image to prevent rendering delay
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = bannerImage;
  }, []);

  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          console.log("No user logged in");
          return;
        }

        let userId;
        try {
          const user = JSON.parse(userString);
          userId = user.userid;
        } catch (parseError) {
          console.error("Parse error:", parseError);
          return;
        }

        if (!userId) {
          console.log("No user ID found");
          return;
        }

        const userDataResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
        });

        if (
          userDataResponse &&
          Array.isArray(userDataResponse) &&
          userDataResponse.length > 0
        ) {
          const userData = userDataResponse[0]?.sectionData?.appuser || {};
          setUserPreferences({
            preferredRegion: userData.preferredregion || "",
            preferredLocation: userData.preferredlocation || ""
          });
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
      }
    };

    fetchUserPreferences();
  }, []);

  // Fetch categories and create categoryMap
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchSectionData({
          collectionName: "category",
          query: {},
        });
        const categoryMapping = response.reduce(
          (map, category) => {
            const categoryId = category._id;
            const categoryName =
              category.sectionData?.category?.titleofinternship || "Unknown";
            map[categoryId] = categoryName;
            map[categoryName.toUpperCase()] = categoryName;
            return map;
          },
          {
            Education: "Education",
            Tourism: "Tourism",
          }
        );
        setCategoryMap(categoryMapping);
        setCategories([...new Set(Object.values(categoryMapping))]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const toggleBookmark = (id) => {
    setBookmarked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search")?.trim() || "";
    const loc = params.get("location")?.trim() || "";
    const cat = params.get("category")?.trim() || "";
    setSearchQuery(search);
    setLocationQuery(loc);
    setAppliedCategories(cat ? [cat] : []);
    setTempCategories(cat ? [cat] : []);
    setAppliedTypes([]);
    setAppliedExperienceLevels([]);
    setAppliedDatePosted("All");
    setMaxSalary(100000);
    setCurrentPage(1);
  }, [location.search]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => {
      setSearchQuery(value.trim());
      setCurrentPage(1);
    }, 300),
    []
  );

  const debouncedSetLocationQuery = useCallback(
    debounce((value) => {
      setLocationQuery(value.trim());
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await fetchSectionData({
          collectionName: "jobpost",
          limit: 100,
          query: { "sectionData.jobpost.type": "Internship" },
          order: -1,
          sortedBy: "createdDate",
        });
        setInternships(data);
      } catch (err) {
        setError("Error fetching internships");
        console.error("InternshipPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "category":
        setTempCategories((prev) =>
          prev.includes(value)
            ? prev.filter((c) => c !== value)
            : [...prev, value]
        );
        break;
      case "type":
        setTempTypes((prev) =>
          prev.includes(value)
            ? prev.filter((t) => t !== value)
            : [...prev, value]
        );
        break;
      case "experience":
        setTempExperienceLevels((prev) =>
          prev.includes(value)
            ? prev.filter((e) => e !== value)
            : [...prev, value]
        );
        break;
      case "datePosted":
        setTempDatePosted(value);
        break;
      default:
        break;
    }
  };

  const handleSalaryChange = (value) => {
    setMaxSalary(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedCategories(tempCategories);
    setAppliedTypes(tempTypes);
    setAppliedExperienceLevels(tempExperienceLevels);
    setAppliedDatePosted(tempDatePosted);
    window.scrollTo(0, 0);
  };

  const handleClearFilters = () => {
    setTempCategories([]);
    setTempTypes([]);
    setTempExperienceLevels([]);
    setTempDatePosted("All");
    setSearchQuery("");
    setLocationQuery("");
    setMaxSalary(100000);
    setAppliedCategories([]);
    setAppliedTypes([]);
    setAppliedExperienceLevels([]);
    setAppliedDatePosted("All");
    setCurrentPage(1);
    setPreferenceFilter(false);
    navigate("/internship");
    window.scrollTo(0, 0);
  };

  // Helper function to check if internship location matches user preferences
  const isPreferredLocation = (internshipLocation) => {
    if (!userPreferences.preferredLocation || !internshipLocation) return false;
    
    const userLocation = userPreferences.preferredLocation.toLowerCase();
    const jobLocation = internshipLocation.toLowerCase();
    
    // Extract city and province from user preference (format: "City, Province, Philippines")
    const userLocationParts = userLocation.split(',').map(part => part.trim());
    const userCity = userLocationParts[0] || '';
    const userProvince = userLocationParts[1] || '';
    
    // Check if job location contains any part of user's preferred location
    return jobLocation.includes(userCity) || 
           jobLocation.includes(userProvince) ||
           userCity.includes(jobLocation) ||
           userProvince.includes(jobLocation);
  };

  const filteredInternships = useMemo(() => {
    const filtered = internships
      .filter((job) => {
        const isInternship = job.sectionData?.jobpost?.type === "Internship";
        const isPublished = job.sectionData?.jobpost?.published !== false; // Only show published internships
        if (!isInternship || !isPublished) return false;

        const jobCategory = (
          categoryMap[job.sectionData?.jobpost?.subtype] ||
          job.sectionData?.jobpost?.subtype ||
          "Unknown"
        ).toLowerCase();
        const matchesCategory =
          appliedCategories.length === 0 ||
          appliedCategories.some((cat) => cat.toLowerCase() === jobCategory);

        const jobType = job.sectionData?.jobpost?.time || "Unknown";
        const matchesType =
          appliedTypes.length === 0 || appliedTypes.includes(jobType);

        const jobExperience =
          job.sectionData?.jobpost?.experiencelevel || "Unknown";
        const matchesExperience =
          appliedExperienceLevels.length === 0 ||
          appliedExperienceLevels.includes(jobExperience);

        let matchesDatePosted = true;
        try {
          const jobDate = parse(
            job.createdDate,
            "dd/MM/yyyy, hh:mm:ss a",
            new Date()
          );
          const now = new Date();
          if (appliedDatePosted !== "All") {
            let cutoffDate;
            switch (appliedDatePosted) {
              case "Last Hour":
                cutoffDate = sub(now, { hours: 1 });
                break;
              case "Last 24 Hours":
                cutoffDate = sub(now, { hours: 24 });
                break;
              case "Last 7 Days":
                cutoffDate = sub(now, { days: 7 });
                break;
              case "Last 30 Days":
                cutoffDate = sub(now, { days: 30 });
                break;
              default:
                break;
            }
            matchesDatePosted = jobDate >= cutoffDate;
          }
        } catch (err) {
          console.error("Date parsing error:", err);
        }

        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch =
          searchQuery === "" ||
          (job.sectionData?.jobpost?.title || "")
            .toLowerCase()
            .includes(searchLower) ||
          (job.sectionData?.jobpost?.company || "")
            .toLowerCase()
            .includes(searchLower);

        const locationLower = locationQuery.toLowerCase().trim();
        const matchesLocation =
          locationQuery === "" ||
          (job.sectionData?.jobpost?.location || "")
            .toLowerCase()
            .includes(locationLower);

        const jobSalary = parseFloat(job.sectionData?.jobpost?.salary) || 0;
        const matchesSalary = jobSalary <= maxSalary;

        // Preference filter logic
        const matchesPreference = !preferenceFilter || 
          isPreferredLocation(job.sectionData?.jobpost?.location);

        const result =
          matchesCategory &&
          matchesType &&
          matchesExperience &&
          matchesDatePosted &&
          matchesSearch &&
          matchesLocation &&
          matchesSalary &&
          matchesPreference;
        return result;
      })
      .map((job) => {
        let relativeTime = "Just now";
        try {
          const parsedDate = parse(
            job.createdDate,
            "dd/MM/yyyy, hh:mm:ss a",
            new Date()
          );
          relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
            .replace("about ", "")
            .replace("hours", "hrs")
            .replace("minutes", "min");
        } catch (err) {
          console.error("Error parsing date for job", job._id, err);
        }

        const slug = generateInternshipSlug(
          job.sectionData?.jobpost?.title || "unknown-role",
          job.sectionData?.jobpost?.location || "unknown",
          job.sectionData?.jobpost?.company || "unknown-company",
          job._id
        );

        const isPreferred = isPreferredLocation(job.sectionData?.jobpost?.location);

        return {
          id: job._id,
          role: job.sectionData?.jobpost?.title || "Unknown Role",
          company: job.sectionData?.jobpost?.company || "Unknown Company",
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || "Unknown",
          salary: job.sectionData?.jobpost?.salary
            ? `${job.sectionData.jobpost.salary}`
            : "Not specified",
          location: (
            job.sectionData?.jobpost?.location || "Unknown"
          ).toUpperCase(),
          logo:
            job.sectionData?.jobpost?.logo &&
            job.sectionData.jobpost.logo.startsWith("http")
              ? job.sectionData.jobpost.logo
              : "https://placehold.co/40x40",
          createdDate: job.createdDate,
          salaryValue: parseFloat(job.sectionData?.jobpost?.salary) || 0,
          category:
            categoryMap[job.sectionData?.jobpost?.subtype] ||
            job.sectionData?.jobpost?.subtype ||
            "Unknown",
          slug: slug,
          isPreferred: isPreferred,
        };
      })
      .sort((a, b) => {
        // Always prioritize preferred locations first, regardless of sort option
        if (a.isPreferred && !b.isPreferred) return -1;
        if (!a.isPreferred && b.isPreferred) return 1;
        
        // Then apply the selected sort option
        switch (sortOption) {
          case "latest":
            try {
              const dateA = parse(
                a.createdDate,
                "dd/MM/yyyy, hh:mm:ss a",
                new Date()
              );
              const dateB = parse(
                b.createdDate,
                "dd/MM/yyyy, hh:mm:ss a",
                new Date()
              );
              return dateB - dateA;
            } catch (err) {
              console.error("Sorting error:", err);
              return 0;
            }
          case "salary-desc":
            return b.salaryValue - a.salaryValue;
          case "salary-asc":
            return a.salaryValue - b.salaryValue;
          case "title-asc":
            return a.role.localeCompare(b.role);
          default:
            return 0;
        }
      });

    return filtered;
  }, [
    internships,
    sortOption,
    appliedCategories,
    appliedTypes,
    appliedExperienceLevels,
    appliedDatePosted,
    searchQuery,
    locationQuery,
    maxSalary,
    categoryMap,
    preferenceFilter,
    userPreferences,
  ]);

  const totalPages = Math.ceil(filteredInternships.length / internshipsPerPage);
  const paginatedInternships = filteredInternships.slice(
    (currentPage - 1) * internshipsPerPage,
    currentPage * internshipsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (internship) => {
    navigate(`/internshipdetail/${internship.slug}`);
  };

  // Handle preference filter toggle
  const handlePreferenceFilter = () => {
    setPreferenceFilter(!preferenceFilter);
    setCurrentPage(1);
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div
      className="flex flex-col bg-white rounded-lg shadow-md p-4 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-6 w-6 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded-full w-32"></div>
      </div>
      <div className="flex flex-wrap items-center space-x-2 mt-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
  );

  // Skeleton Filter Component
  const SkeletonFilter = () => (
    <div
      className="w-full md:w-1/4 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] shadow-md rounded-xl p-10 animate-pulse"
      aria-hidden="true"
    >
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Hero
          title="Internships | OJTs | Jobs"
          subtitle="Empower Your Future: Unleash Limitless Career Possibilities!"
          searchFields={[]}
          stats={[]}
          backgroundImage={bannerImage}
          gradient="linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))"
          showPostButton={true}
        />
        <div className="flex flex-col md:flex-row px-4 md:px-12 py-8">
          <SkeletonFilter />
          <div className="w-full md:w-3/4 md:pl-6">
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[...Array(internshipsPerPage)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return <div className="mx-12 py-4">{error}</div>;
  }

  return (
    <>
      <Hero
        title="Internships | OJTs | Jobs"
        subtitle="Empower Your Future: Unleash Limitless Career Possibilities!"
        searchFields={[]}
        stats={[]}
        backgroundImage={bannerImage}
        backgroundPosition="10% 20%"
        gradient="linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))"
        showPostButton={true}
      />
      <div className="flex flex-col md:flex-row px-4 md:px-12 py-8 bg-[#fafafa]">
        <div className="w-full md:w-1/4 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] shadow-md rounded-xl p-6 mb-6 md:mb-0">
          <style>{`
            @keyframes shimmer {
              0% { background-position: -468px 0; }
              100% { background-position: 468px 0; }
            }
            .animate-pulse {
              animation: shimmer 1.5s infinite;
              background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
              background-size: 800px 104px;
            }
          `}</style>
          
          
          {/* Preference Filter Section */}
          {userPreferences.preferredLocation && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-sm mb-2 text-blue-800">
                Preference Filter
              </h3>
              <p className="text-xs text-blue-600 mb-2">
                Your preferred location: {userPreferences.preferredLocation}
              </p>
              <label className="flex items-center text-sm text-blue-700">
                <input
                  type="checkbox"
                  className="mr-2 text-blue-600"
                  checked={preferenceFilter}
                  onChange={handlePreferenceFilter}
                />
                Show only preferred locations
              </label>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">
            Search by Internship Title or Company
          </h2>
          <div className="relative mb-4">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Internship title or company"
              className="w-full pl-10 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => debouncedSetSearchQuery(e.target.value)}
            />
          </div>
          <h3 className="font-medium text-sm mb-2">Search by Location</h3>
          <div className="relative mb-4">
            <BsGeoAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter city or address"
              className="w-full pl-10 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={locationQuery}
              onChange={(e) => debouncedSetLocationQuery(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Category</h3>
            {categories.map((category) => (
              <label key={category} className="block text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempCategories.includes(category)}
                  onChange={() => handleFilterChange("category", category)}
                />
                {category}
              </label>
            ))}
            <button className="w-full bg-gradient-to-r from-[#6146B6] to-[#1F93EA] text-white py-2 rounded-lg mt-2 text-sm font-semibold">
              Show More
            </button>
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Internship Type</h3>
            {[
              "Full Time",
              "Part-Time",
              "Freelance",
              "Seasonal",
              "Fixed-Price",
            ].map((type) => (
              <label key={type} className="block text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempTypes.includes(type)}
                  onChange={() => handleFilterChange("type", type)}
                />
                {type}
              </label>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Experience Level</h3>
            {["No-experience", "Fresher", "Intermediate", "Expert"].map(
              (level) => (
                <label key={level} className="block text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={tempExperienceLevels.includes(level)}
                    onChange={() => handleFilterChange("experience", level)}
                  />
                  {level}
                </label>
              )
            )}
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Date Posted</h3>
            {[
              "All",
              "Last Hour",
              "Last 24 Hours",
              "Last 7 Days",
              "Last 30 Days",
            ].map((option) => (
              <label key={option} className="block text-sm text-gray-700">
                <input
                  type="radio"
                  name="datePosted"
                  className="mr-2"
                  checked={tempDatePosted === option}
                  onChange={() => handleFilterChange("datePosted", option)}
                />
                {option}
              </label>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Salary (Up to)</h3>
            <label className="text-xs text-gray-600">
              Max Salary: ₹{maxSalary}
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={maxSalary}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleApplyFilters}
              className="w-1/2 bg-gradient-to-b from-[#6146B6] to-[#1F93EA] text-white py-2 rounded-lg mt-2 text-sm font-bold"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mt-2 text-sm font-bold hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="w-full md:w-3/4 md:pl-6">
          {filteredInternships.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
              No internships found.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * internshipsPerPage + 1} -{" "}
                  {Math.min(
                    currentPage * internshipsPerPage,
                    filteredInternships.length
                  )}{" "}
                  of {filteredInternships.length} results
                  {preferenceFilter && userPreferences.preferredLocation && (
                    <span className="text-blue-600 font-medium">
                      {" "}(Filtered by preference)
                    </span>
                  )}
                </p>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="p-2 border text-sm rounded-lg"
                >
                  <option value="latest">Sort by latest</option>
                  <option value="salary-desc">
                    Sort by salary (high to low)
                  </option>
                  <option value="salary-asc">
                    Sort by salary (low to high)
                  </option>
                  <option value="title-asc">Sort by title (A-Z)</option>
                </select>
              </div>
              <div className="space-y-3 md:space-y-4">
                {paginatedInternships.map((internship) => (
                  <div
                    key={internship.id}
                    className={`flex flex-col bg-white rounded-lg shadow-sm md:shadow-md p-4 ${
                      internship.isPreferred ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    {internship.isPreferred && (
                      <div className="mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          ⭐ Preferred Location
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="inline-block bg-gray-100 md:bg-gray-200 text-gray-700 md:text-gray-800 text-xs font-medium px-2 py-1 md:py-0.5 rounded-full">
                        {internship.time}
                      </span>
                      <button
                        onClick={() => toggleBookmark(internship.id)}
                        className="text-gray-600 hover:text-blue-600"
                        aria-label={
                          bookmarked[internship.id]
                            ? "Remove bookmark"
                            : "Add bookmark"
                        }
                      >
                        {bookmarked[internship.id] ? (
                          <BsBookmarkFill className="h-5 md:h-6 w-5 md:w-6" />
                        ) : (
                          <BsBookmarkPlus className="h-5 md:h-6 w-5 md:w-6" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <img
                            src={internship.logo}
                            alt={`${internship.company} Logo`}
                            className="w-10 h-10 rounded-full object-contain"
                          />
                          <div>
                            <h3 className="text-base md:text-lg font-semibold md:font-bold text-gray-900 md:text-black line-clamp-2 md:line-clamp-1">
                              {internship.role}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                              {internship.company}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 md:space-x-2 mt-2 text-xs md:text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 md:w-4 h-3.5 md:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {internship.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 md:w-4 h-3.5 md:h-4"
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
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 md:w-4 h-3.5 md:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {internship.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-end mt-3 md:mt-0">
                        <button
                          onClick={() => handleViewDetails(internship)}
                          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 md:py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700"
                        >
                          Internship Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <span className="text-base">←</span>
                      <span className="font-semibold">Previous</span>
                    </button>
                  </div>
                  <div className="flex gap-4">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${
                          currentPage === index + 1
                            ? "bg-blue-500 text-white"
                            : "border border-gray-400 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <span className="font-semibold">Next</span>
                      <span className="text-base">→</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InternshipPage;