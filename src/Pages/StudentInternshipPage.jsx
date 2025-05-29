import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCode,
  FaBullhorn,
  FaCogs,
  FaRupeeSign,
} from "react-icons/fa";
import { BsBookmarkPlus, BsSearch, BsGeoAlt } from "react-icons/bs";
import { fetchSectionData } from "../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";
import heroImage from "../assets/Hero/herophoto.png";

// Hero Section
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between">
      <div className="md:w-1/2 space-y-6 text-center md:text-left">
        <h1 className="text-5xl font-bold text-[#0B4A99]">
          Unlock <span className="text-[#0B1B33]">Exposure</span>
        </h1>
        <p className="text-lg text-[#666] max-w-md mx-auto md:mx-0">
          Apply to a plethora of hiring opportunities & work with your dream companies!
        </p>
        <div className="flex justify-center md:justify-start gap-4">
          <button className="bg-[#002E6E] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#001f4d] transition">
            Find Internships
          </button>
          <button
            className="border border-[#002E6E] text-[#002E6E] font-semibold px-6 py-3 rounded-full flex items-center hover:bg-[#E6F1FF] hover:shadow-md transition duration-300 ease-in-out"
            onClick={() => navigate("/studentpostform")}
          >
            <span className="text-xl mr-2">+</span> Post Internships
          </button>

        </div>
      </div>
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <img
          src={heroImage}
          alt="Hero"
          className="max-w-md w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

// Category Section
const CategorySection = () => {
  const categories = [
    {
      label: "Human resources",
      icon: <FaUsers className="text-[#5A2A27]" />,
      bg: "bg-[#FDEAEA]",
    },
    {
      label: "Software Development",
      icon: <FaCode className="text-[#3C3A63]" />,
      bg: "bg-[#EFEAFE]",
    },
    {
      label: "Marketing",
      icon: <FaBullhorn className="text-[#1F3C67]" />,
      bg: "bg-[#E1EEFD]",
    },
    {
      label: "Operations",
      icon: <FaCogs className="text-[#27594C]" />,
      bg: "bg-[#E3FBF3]",
    },
    {
      label: "Finance",
      icon: <FaRupeeSign className="text-[#5A3A27]" />,
      bg: "bg-[#FFF3E9]",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
        <h3 className="text-lg font-semibold text-[#1A1A1A] whitespace-nowrap">
          Internships <br className="hidden md:inline" /> Category
        </h3>
        <div className="flex gap-4 overflow-x-auto">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-200 bg-white whitespace-nowrap shrink-0"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${cat.bg}`}>
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-[#333]">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const StudentInternshipPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const internshipsPerPage = 6;

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

  const filteredInternships = useMemo(() => {
    return internships
      .filter((job) => job.sectionData?.jobpost?.type === "Internship")
      .map((job) => {
        let relativeTime = "Just now";
        try {
          const parsedDate = parse(job.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date());
          relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
            .replace("about ", "")
            .replace("hours", "hrs")
            .replace("minutes", "min");
        } catch (err) {
          console.error("Error parsing date", job._id, err);
        }

        return {
          id: job._id,
          role: job.sectionData?.jobpost?.title || "Unknown Role",
          company: job.sectionData?.jobpost?.company || "Unknown Company",
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || "Unknown",
          salary: job.sectionData?.jobpost?.salary ? `₹${job.sectionData.jobpost.salary}` : "Not specified",
          location: (job.sectionData?.jobpost?.location || "Unknown").toUpperCase(),
          logo: job.sectionData?.jobpost?.logo?.startsWith("http") ? job.sectionData.jobpost.logo : "https://placehold.co/40x40",
          createdDate: job.createdDate,
          salaryValue: job.sectionData?.jobpost?.salary || 0,
        };
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "latest":
            try {
              return (
                parse(b.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date()) -
                parse(a.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date())
              );
            } catch {
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
  }, [internships, sortOption]);

  const totalPages = Math.ceil(filteredInternships.length / internshipsPerPage);
  const paginatedInternships = filteredInternships.slice(
    (currentPage - 1) * internshipsPerPage,
    currentPage * internshipsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white text-gray-900">
      <HeroSection />
      <CategorySection />
      <div className="flex flex-col md:flex-row px-4 md:px-12 py-8 bg-[#fafafa]">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] shadow-md rounded-xl p-6 mb-6 md:mb-0">
          <h2 className="text-lg font-semibold mb-4">Search by Internship Title</h2>
          <div className="relative mb-4">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Internship title or company" className="w-full pl-10 p-2 border rounded-lg text-sm" />
          </div>
          <h3 className="font-medium text-sm mb-2">Location</h3>
          <div className="relative mb-4">
            <BsGeoAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <select className="w-full pl-10 p-2 border rounded-lg text-sm">
              <option>Choose city</option>
            </select>
          </div>
          {/* Additional filters */}
          {[{ title: "Category", items: ["Commerce", "Telecommunications", "Hotels & Tourism", "Education", "Financial Services"] },
          { title: "Internship Type", items: ["Full Time", "Part Time", "Freelance", "Seasonal", "Fixed-Price"] },
          { title: "Experience Level", items: ["No-experience", "Fresher", "Intermediate", "Expert"] },
          { title: "Date Posted", items: ["All", "Last Hour", "Last 24 Hours", "Last 7 Days", "Last 30 Days"] }].map(({ title, items }, index) => (
            <div key={title} className="mb-4">
              <h3 className="font-medium text-sm mb-2">{title}</h3>
              {items.map((item) => (
                <label key={item} className="block text-sm text-gray-700">
                  <input type="checkbox" className="mr-2" /> {item}
                </label>
              ))}
              {index === 0 && (
                <button className="w-full bg-gradient-to-r from-[#6146B6] to-[#1F93EA] text-white py-2 rounded-lg mt-2 text-sm font-bold">
                  Show More
                </button>
              )}
            </div>
          ))}
          <div className="mb-2">
            <h3 className="font-medium text-sm mb-2">Salary</h3>
            <input type="range" min="0" max="100000" className="w-full" />
            <p className="text-xs text-gray-600 mt-1">Salary: ₹0 - ₹99999</p>
          </div>
          <button className="w-full bg-gradient-to-b from-[#6146B6] to-[#1F93EA] text-white py-2 rounded-lg mt-2 text-sm font-bold">
            Apply
          </button>
        </div>

        {/* Internships List */}
        <div className="w-full md:w-3/4 md:pl-6">
          {loading && <div className="py-4">Loading...</div>}
          {error && <div className="py-4 text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * internshipsPerPage + 1} - {Math.min(currentPage * internshipsPerPage, filteredInternships.length)} of {filteredInternships.length} results
                </p>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="p-2 border text-sm rounded-lg"
                >
                  <option value="latest">Sort by latest</option>
                  <option value="salary-desc">Sort by salary (high to low)</option>
                  <option value="salary-asc">Sort by salary (low to high)</option>
                  <option value="title-asc">Sort by title (A-Z)</option>
                </select>
              </div>
              <div className="space-y-4">
                {paginatedInternships.map((internship) => (
                  <div key={internship.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded-full">{internship.time}</span>
                      <BsBookmarkPlus className="h-6 w-6" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <img src={internship.logo} alt="logo" className="w-10 h-10 rounded-full object-contain" />
                          <div>
                            <h3 className="font-bold text-lg">{internship.role}</h3>
                            <p className="text-sm text-gray-500">{internship.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                          <span>{internship.type}</span>
                          <span>{internship.salary}</span>
                          <span>{internship.location}</span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700">
                        Internship Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-4 justify-center w-full">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${currentPage === index + 1
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "border border-gray-400 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span className="font-semibold">Next</span>
                    <span className="text-base">❯</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInternshipPage;
