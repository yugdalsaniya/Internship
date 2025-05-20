import React, { useEffect, useState, useMemo } from "react";
import { BsBookmarkPlus } from "react-icons/bs";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";

const RecentInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch internships with polling
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await fetchSectionData({
          collectionName: "jobpost",
          limit: 4, // Limit to 4 most recent internships
          query: { "sectionData.jobpost.type": "Internship" },
          order: -1, // Descending order for most recent
          sortedBy: "createdDate",
        });
        console.log("RecentInternships API Response:", data); // Debug API response
        setInternships(data);
      } catch (err) {
        setError("Error fetching internships");
        console.error("RecentInternships API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchInternships();

    // Poll every 30 seconds to ensure fresh data
    const intervalId = setInterval(fetchInternships, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Process internships
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
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || "Unknown",
          salary: job.sectionData?.jobpost?.salary
            ? `₹${job.sectionData.jobpost.salary}`
            : "Not specified",
          location: (job.sectionData?.jobpost?.location || "Unknown").toUpperCase(),
          logo: job.sectionData?.jobpost?.logo &&
            job.sectionData.jobpost.logo.startsWith("http")
            ? job.sectionData.jobpost.logo
            : "https://placehold.co/40x40",
          createdDate: job.createdDate, // Keep raw createdDate for sorting
          salaryValue: job.sectionData?.jobpost?.salary || 0, // For potential sorting
        };
      })
      .sort((a, b) => {
        // Client-side sorting by createdDate (descending)
        try {
          const dateA = parse(a.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date());
          const dateB = parse(b.createdDate, "dd/MM/yyyy, h:mm:ss a", new Date());
          return dateB - dateA; // Most recent first
        } catch (err) {
          console.error("Sorting error:", err);
          return 0;
        }
      })
      .slice(0, 4); // Ensure only 4 are displayed
  }, [internships]);

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;
  if (filteredInternships.length === 0)
    return <div className="mx-12 py-4">No internships found.</div>;

  return (
    <div className="mx-12 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#050748]">
            Recent Internships
          </h2>
          <p className="text-xs sm:text-sm text-[#6A6A8E] uppercase">
            NEW OPPORTUNITIES, JUST POSTED!
          </p>
        </div>
        <a
          href="/internships"
          className="text-[#6A6A8E] text-xs sm:text-sm md:text-base font-medium hover:underline"
        >
          View all
        </a>
      </div>

      {/* Internship Cards */}
      <div className="space-y-3 sm:space-y-4">
        {filteredInternships.map((internship) => (
          <div
            key={internship.id}
            className="flex flex-col bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {internship.time} (Created: {internship.createdDate})
              </span>
              <BsBookmarkPlus className="h-6 w-6" aria-label="Bookmark Plus Icon" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
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
    </div>
  );
};

export default RecentInternships;
