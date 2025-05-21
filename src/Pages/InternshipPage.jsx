import React, { useEffect, useState, useMemo } from "react";
import { BsBookmarkPlus,BsSearch, BsGeoAlt } from "react-icons/bs";
import { fetchSectionData } from "../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";
import Hero from "../Components/home/Hero";
import backgroundImg from "../assets/Hero/banner.jpg";


export default function InternshipPage() {
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
          const parsedDate = parse(
            job.createdDate,
            "dd/MM/yyyy, h:mm:ss a",
            new Date()
          );
          relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
            .replace("about ", "")
            .replace("hours", "hrs")
            .replace("minutes", "min");
        } catch (err) {
          console.error("Error parsing date for job", job._id, err);
        }

        return {
          id: job._id,
          role: job.sectionData?.jobpost?.title || "Unknown Role",
          company: job.sectionData?.jobpost?.company || "Unknown Company",
          time: relativeTime, // Only relative time (e.g., "10 min ago")
          type: job.sectionData?.jobpost?.time || "Unknown",
          salary: job.sectionData?.jobpost?.salary
            ? `₹${job.sectionData.jobpost.salary}`
            : "Not specified",
          location: (job.sectionData?.jobpost?.location || "Unknown").toUpperCase(),
          logo: job.sectionData?.jobpost?.logo &&
            job.sectionData.jobpost.logo.startsWith("http")
            ? job.sectionData.jobpost.logo
            : "https://placehold.co/40x40",
          createdDate: job.createdDate, // Keep for sorting
          salaryValue: job.sectionData?.jobpost?.salary || 0,
        };
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "latest":
            try {
              const dateA = parse(a.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date());
              const dateB = parse(b.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date());
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
  }, [internships, sortOption]);

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

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;
  if (filteredInternships.length === 0)
    return <div className="mx-12 py-4">No internships found.</div>;

  return (
    <>
      <Hero
        title="Internships"
        subtitle="Empower Your Future: Unleash Limitless Career Possibilities!"
        searchFields={[]}
        stats={[]}
        backgroundImage={backgroundImg}
        gradient="linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))"
      />
      <div className="flex flex-col md:flex-row px-4 md:px-12 py-8 bg-[#fafafa]">
        <div className="w-full md:w-1/4 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] shadow-md rounded-xl p-6 mb-6 md:mb-0">
      {/* Search by Internship Title */}
      <h2 className="text-lg font-semibold mb-4">Search by Internship Title</h2>
      <div className="relative mb-4">
        <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Internship title or company"
          className="w-full pl-10 p-2 border rounded-lg text-sm"
        />
      </div>

      {/* Location */}
      <h3 className="font-medium text-sm mb-2">Location</h3>
      <div className="relative mb-4">
        <BsGeoAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <select className="w-full pl-10 p-2 border rounded-lg text-sm">
          <option>Choose city</option>
        </select>
      </div>

      {/* Filter Categories */}
      {[
        {
          title: "Category",
          items: [
            "Commerce",
            "Telecommunications",
            "Hotels & Tourism",
            "Education",
            "Financial Services",
          ],
        },
        {
          title: "Internship Type",
          items: ["Full Time", "Part Time", "Freelance", "Seasonal", "Fixed-Price"],
        },
        {
          title: "Experience Level",
          items: ["No-experience", "Fresher", "Intermediate", "Expert"],
        },
        {
          title: "Date Posted",
          items: ["All", "Last Hour", "Last 24 Hours", "Last 7 Days", "Last 30 Days"],
        },
      ].map(({ title, items }, index) => (
        <div key={title} className="mb-4">
          <h3 className="font-medium text-sm mb-2">{title}</h3>
          {items.map((item) => (
            <label key={item} className="block text-sm text-gray-700">
              <input type="checkbox" className="mr-2" /> {item}
            </label>
          ))}
          {/* Show More button after Category section (first section) */}
          {index === 0 && (
            <button className="w-full bg-gradient-to-r from-[#6146B6] to-[#1F93EA] text-white py-2 rounded-lg mt-2 text-sm font-bold">
              Show More
            </button>
          )}
        </div>
      ))}

      {/* Salary Filter */}
      <div className="mb-2">
        <h3 className="font-medium text-sm mb-2">Salary</h3>
        <input type="range" min="0" max="100000" className="w-full" />
        <p className="text-xs text-gray-600 mt-1">Salary: ₹0 - ₹99999</p>
      </div>

      {/* Apply Button */}
      <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg mt-2 text-sm font-bold">
        Apply
      </button>
    </div>
        <div className="w-full md:w-3/4 md:pl-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * internshipsPerPage + 1} -{" "}
              {Math.min(currentPage * internshipsPerPage, filteredInternships.length)} of{" "}
              {filteredInternships.length} results
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
              <div
                key={internship.id}
                className="flex flex-col bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {internship.time} {/* Only show relative time */}
                  </span>
                  <BsBookmarkPlus className="h-6 w-6" aria-label="Bookmark Plus Icon" />
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
                        <h3 className="text-lg font-bold text-black">{internship.role}</h3>
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
                  <div className="flex items-end">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700">
                      Internship Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-4 justify-center w-full">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                    currentPage === index + 1
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
        </div>
      </div>
    </>
  );
}