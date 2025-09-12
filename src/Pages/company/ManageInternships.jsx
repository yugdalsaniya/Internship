// ManageInternships.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData, updateSectionData } from "../../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";
import logo from "../../assets/Navbar/logo.png";
import backgroundImg from "../../assets/Hero/banner.jpg";

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const internshipsPerPage = 6;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Redirect if not a company user
  if (user.role !== "company") {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        // Fetch internships
        const internshipsData = await fetchSectionData({
          dbName: "internph",
          collectionName: "jobpost",
          query: {
            "sectionData.jobpost.type": "Internship",
            companyId: user.companyId,
          },
          limit: 100,
          order: -1,
          sortedBy: "createdDate",
        });

        // Calculate applicant counts from the applicants array in each internship
        const internshipsWithCounts = internshipsData.map((internship) => ({
          ...internship,
          totalApplicants: internship.sectionData.jobpost.applicants?.length || 0,
        }));

        setInternships(internshipsWithCounts);
      } catch (err) {
        setError("Error fetching internships");
        console.error("ManageInternships API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [user.companyId]);

  const handleUnpublish = async (internshipId, currentStatus) => {
    try {
      // Update the published status in the database
      await updateSectionData({
        dbName: "internph",
        collectionName: "jobpost",
        id: internshipId,
        updateData: {
          "sectionData.jobpost.published": !currentStatus,
        },
      });

      // Update local state to reflect the change
      setInternships((prev) =>
        prev.map((internship) =>
          internship._id === internshipId
            ? {
                ...internship,
                sectionData: {
                  ...internship.sectionData,
                  jobpost: {
                    ...internship.sectionData.jobpost,
                    published: !currentStatus,
                  },
                },
              }
            : internship
        )
      );
    } catch (err) {
      setError("Error updating internship status");
      console.error("Unpublish API Error:", err);
    }
  };

  const formattedInternships = useMemo(() => {
    return internships
      .filter((job) => job.sectionData?.jobpost?.type === "Internship")
      .map((job) => {
        let relativeTime = "Just now";
        let parsedDate;
        try {
          parsedDate = parse(
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
          title: job.sectionData?.jobpost?.title || "Unknown Role",
          company: job.sectionData?.jobpost?.company || "Unknown Company",
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || "Unknown",
          salary: job.sectionData?.jobpost?.salary
            ? `${job.sectionData.jobpost.salary}`
            : "Not specified",
          location: job.sectionData?.jobpost?.location ? (job.sectionData.jobpost.location.length > 1 ? job.sectionData.jobpost.location.toUpperCase() : job.sectionData.jobpost.location) : "Unknown",
          logo: job.sectionData?.jobpost?.logo || "https://placehold.co/40x40",
          subtype: job.sectionData?.jobpost?.subtype || "Unknown",
          experiencelevel:
            job.sectionData?.jobpost?.experiencelevel || "Unknown",
          applicationdeadline:
            job.sectionData?.jobpost?.applicationdeadline || "N/A",
          internshipduration:
            job.sectionData?.jobpost?.internshipduration || "N/A",
          skillsrequired: job.sectionData?.jobpost?.skillsrequired || "None",
          applicationinstructions:
            job.sectionData?.jobpost?.applicationinstructions || "None",
          description:
            job.sectionData?.jobpost?.description || "No description",
          createdDate: job.createdDate,
          parsedDate: parsedDate,
          published: job.sectionData?.jobpost?.published !== false,
          totalApplicants: job.totalApplicants || 0,
        };
      })
      .sort((a, b) => b.parsedDate - a.parsedDate);
  }, [internships]);

  const totalPages = Math.ceil(
    formattedInternships.length / internshipsPerPage
  );
  const paginatedInternships = formattedInternships.slice(
    (currentPage - 1) * internshipsPerPage,
    currentPage * internshipsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center text-red-500">
        {error}
      </div>
    );
  if (formattedInternships.length === 0)
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500">
        No internships posted yet.{" "}
        <button
          onClick={() => navigate("/post-internship")}
          className="text-blue-600 underline hover:text-blue-800 text-sm sm:text-base"
        >
          Post an internship
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#050748] mb-2 sm:mb-3">
            Manage Your Internships
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 max-w-md mx-auto mb-3 sm:mb-4">
            View and manage all internships posted by your company.
          </p>
          <button
            onClick={() => navigate("/post-internship")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm md:text-base font-medium py-1.5 sm:py-2 px-4 sm:px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Post New Internship
          </button>
        </div>
      </div>

      {/* Internships List */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#050748] mb-4 sm:mb-6">
            Your Posted Internships
          </h2>
          <div className="space-y-4 sm:space-y-5">
            {paginatedInternships.map((internship) => (
              <div
                key={internship.id}
                className="flex flex-col bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3">
                  <div>
                    <span className="inline-block bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full">
                      {internship.time}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Posted on: {internship.createdDate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <img
                        src={internship.logo}
                        alt={`${internship.company} Logo`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#050748] truncate">
                          {internship.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {internship.company}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Status:{" "}
                          {internship.published ? "Published" : "Unpublished"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center min-w-[100px]">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 flex-shrink-0"
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
                      <span className="flex items-center min-w-[100px]">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 flex-shrink-0"
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
                      <span className="flex items-center min-w-[100px]">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 flex-shrink-0"
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
                        <span className="truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[250px]">
                          {internship.location}
                        </span>
                      </span>
                      <span className="flex items-center min-w-[100px]">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {internship.totalApplicants} Applicants
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() =>
                          navigate(`/internship/${internship.id}/candidates`)
                        }
                        className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-green-600 hover:to-teal-700 whitespace-nowrap flex-1 sm:flex-none"
                      >
                        Candidates
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/internshipdetail/${internship.id}`)
                        }
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap flex-1 sm:flex-none"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() =>
                          navigate(`/edit-internship/${internship.id}`)
                        }
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-yellow-600 hover:to-orange-700 whitespace-nowrap flex-1 sm:flex-none"
                      >
                        Edit Internship
                      </button>
                      <button
                        onClick={() =>
                          handleUnpublish(internship.id, internship.published)
                        }
                        className={`text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full whitespace-nowrap flex-1 sm:flex-none ${
                          internship.published
                            ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                            : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                        }`}
                      >
                        {internship.published ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-6 sm:mt-8 gap-4 sm:gap-5">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-semibold text-xs sm:text-sm ${
                      currentPage === index + 1
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : "border border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
                >
                  <span className="text-sm sm:text-base">❮</span>
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
                >
                  <span>Next</span>
                  <span className="text-sm sm:text-base">❯</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInternships;