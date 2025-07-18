import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BsBookmarkPlus } from "react-icons/bs";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";
import { generateInternshipSlug } from "../../Utils/slugify";

export default function RecentInternship() {
  const navigate = useNavigate();
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const maxInternships = 4;

  useEffect(() => {
    const fetchRecentInternships = async () => {
      try {
        const data = await fetchSectionData({
          collectionName: "jobpost",
          limit: 100,
          query: { "sectionData.jobpost.type": "Internship" },
          order: -1,
          sortedBy: "createdDate",
        });
        console.log("RecentInternship - Fetched data:", data); // Debug log
        setRecentInternships(data);
      } catch (err) {
        setError("Error fetching recent internships");
        console.error("RecentInternship API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentInternships();
    const interval = setInterval(fetchRecentInternships, 60000);
    return () => clearInterval(interval);
  }, []);

  const processedInternships = useMemo(() => {
    console.log(
      "RecentInternship - Processing internships:",
      recentInternships
    ); // Debug log
    return recentInternships
      .filter((job) => {
        const isInternship = job.sectionData?.jobpost?.type === "Internship";
        const isPublished = job.sectionData?.jobpost?.published !== false; // Only show published internships
        console.log("RecentInternship - Job:", job._id, {
          isInternship,
          isPublished,
          published: job.sectionData?.jobpost?.published,
        }); // Debug log
        return isInternship && isPublished;
      })
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

        const slug = generateInternshipSlug(
          job.sectionData?.jobpost?.title || "unknown-role",
          job.sectionData?.jobpost?.location || "unknown",
          job.sectionData?.jobpost?.company || "unknown-company",
          job._id
        );

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
          slug: slug,
        };
      })
      .sort((a, b) => {
        try {
          const dateA = parse(
            a.createdDate,
            "dd/MM/yyyy, h:mm:ss a",
            new Date()
          );
          const dateB = parse(
            b.createdDate,
            "dd/MM/yyyy, h:mm:ss a",
            new Date()
          );
          return dateB - dateA;
        } catch (err) {
          console.error("Sorting error:", err);
          return 0;
        }
      })
      .slice(0, maxInternships);
  }, [recentInternships]);

  if (loading)
    return (
      <div className="px-4 md:px-12 py-4 md:py-4 bg-gray-50 md:bg-[#fafafa] min-h-[300px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recent Internships
        </h2>
        <div className="space-y-4">
          {[...Array(maxInternships)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex flex-col bg-white rounded-xl md:rounded-lg shadow-sm md:shadow-md p-4 min-h-[150px]"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-6 w-6 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex md:flex-row flex-col md:items-center gap-3 md:gap-0">
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 md:w-10 h-12 md:h-10 bg-gray-200 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center space-x-2 mt-2 text-sm text-gray-600">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="flex items-end mt-4 md:mt-0">
                  <div className="h-10 md:h-8 w-full md:w-32 bg-gray-200 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="px-4 md:px-12 py-4 md:py-4 text-red-600 md:text-red-600 text-center">
        {error}
      </div>
    );

  return (
    <div className="px-4 md:px-12 py-6 md:py-4 bg-gray-50 md:bg-[#fafafa]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-1 md:mb-2">Internships | OJTs | Jobs</h2>
          <p className="text-sm md:text-base text-gray-500 md:text-[#6A6A8E] mt-1 md:mb-2">New Opportunities, Just Posted!</p>
          
        </div>
        <Link
          to="/internship"
          className="text-blue-600 md:text-[#6A6A8E] text-sm md:text-base font-medium hover:underline"
        >
          View all
        </Link>
      </div>
      {processedInternships.length === 0 ? (
        <div className="px-4 md:px-12 py-4 md:py-4 text-gray-600 md:text-gray-600 text-center">
          Internships not posted
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {processedInternships.map((internship) => (
            <div
              key={internship.id}
              className="flex flex-col bg-white rounded-lg md:rounded-lg shadow-sm md:shadow-md p-4 md:p-4 min-h-[140px] md:min-h-[150px]"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="bg-gray-100 md:bg-gray-200 text-gray-700 md:text-gray-800 text-xs font-medium px-2 py-1 md:py-0.5 rounded-full">
                  {internship.time}
                </span>
                <BsBookmarkPlus
                  className="h-5 md:h-6 w-5 md:w-6 text-gray-600 md:text-gray-600"
                  aria-label="Bookmark Plus Icon"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:items-center">
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <img
                      src={internship.logo}
                      alt={`${internship.company} Logo`}
                      className="w-10 md:w-10 h-10 md:h-10 rounded-full object-contain"
                    />
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold md:font-bold text-gray-900 md:text-black line-clamp-2 md:line-clamp-1">
                        {internship.role}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
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
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                <div className="flex items-end mt-3 md:mt-0">
                  <button
                    onClick={() => navigate(`/internshipdetail/${internship.slug}`)}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2.5 md:py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    Internship Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
