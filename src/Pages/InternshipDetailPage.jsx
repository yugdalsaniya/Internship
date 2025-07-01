import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Hero from "../assets/Hero/banner.jpg";
import {
  FaMapMarkerAlt,
  FaRegClock,
  FaUser,
  FaGraduationCap,
  FaTags,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdWork, MdDateRange } from "react-icons/md";
import { PiTwitterLogoFill } from "react-icons/pi";
import { fetchSectionData } from "../Utils/api";
import { formatDistanceToNow, parse, format } from "date-fns";
import { generateInternshipSlug } from "../Utils/slugify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const InternshipDetailPage = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [internship, setInternship] = useState(null);
  const [relatedInternships, setRelatedInternships] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualId = urlId.split('-').pop();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userid;

  useEffect(() => {
    const fetchCategoriesAndInternship = async () => {
      try {
        const categoriesData = await fetchSectionData({
          collectionName: "category",
          query: {},
        });

        const categoryMapping = categoriesData.reduce((map, category) => {
          const categoryId = category._id;
          const categoryName = category.sectionData?.category?.titleofinternship || "Unknown Category";
          map[categoryId] = categoryName;
          map[categoryName.toUpperCase()] = categoryName;
          return map;
        }, {
          "Education": "Education",
          "Tourism": "Tourism",
        });
        setCategoryMap(categoryMapping);

        const internshipData = await fetchSectionData({
          collectionName: "jobpost",
          query: { _id: actualId },
        });

        if (internshipData && internshipData.length > 0) {
          setInternship(internshipData[0]);

          if (userId && user.role === "student") {
            const applicationData = await fetchSectionData({
              collectionName: "applications",
              query: { userId, jobId: actualId },
            });
            setHasApplied(applicationData.length > 0);
          }

          const currentSubtype = internshipData[0]?.sectionData?.jobpost?.subtype;
          const relatedQuery = {
            "sectionData.jobpost.type": "Internship",
            _id: { $ne: actualId },
          };

          if (currentSubtype) {
            relatedQuery["sectionData.jobpost.subtype"] = currentSubtype;
          }

          const relatedData = await fetchSectionData({
            collectionName: "jobpost",
            limit: 3,
            query: relatedQuery,
            order: -1,
            sortedBy: "createdDate",
          });

          setRelatedInternships(relatedData);
        } else {
          setError("Internship not found.");
        }
      } catch (err) {
        setError("Error fetching internship details.");
        console.error("InternshipDetailPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndInternship();
  }, [actualId, userId]);

  const getRelativeTime = (dateString) => {
    try {
      const parsedDate = parse(dateString, "dd/MM/yyyy, h:mm:ss a", new Date());
      return formatDistanceToNow(parsedDate, { addSuffix: true })
        .replace("about ", "")
        .replace("hours", "hrs")
        .replace("minutes", "min");
    } catch (err) {
      console.error("Error parsing date:", err);
      return "Just now";
    }
  };

  const formatDeadline = (deadline) => {
    try {
      return format(new Date(deadline), "MMM dd, yyyy");
    } catch (err) {
      console.error("Error formatting deadline:", err);
      return "Not specified";
    }
  };

  const handleApplyClick = () => {
    if (!user.email) {
      navigate("/login", { state: { from: location.pathname } });
    } else {
      navigate(`/applyinternshipform/${actualId}`);
    }
  };

  const cleanMarkdown = (markdown) => {
    if (!markdown || typeof markdown !== 'string') {
      return "No content available.";
    }
    return markdown
      .replace(/\\+/g, '')
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && trimmed !== '-' && trimmed !== '- [ ]' && trimmed !== '- [x]';
      })
      .join('\n');
  };

  if (error) return <div className="mx-4 py-4 text-sm md:text-base">{error}</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section Skeleton */}
        <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-200 animate-pulse relative flex items-center justify-center">
          <div className="relative max-w-[95%] md:max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
            <div className="w-3/4 h-6 sm:h-8 md:h-10 bg-gray-300 rounded-md mb-2 sm:mb-3"></div>
            <div className="w-1/2 h-4 sm:h-5 md:h-6 bg-gray-300 rounded-md"></div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="max-w-[95%] mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
            <div className="w-full">
              <div className="w-1/3 h-3 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="w-3/4 h-6 sm:h-7 md:h-8 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="w-1/2 h-4 sm:h-5 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="w-full md:w-32 h-8 sm:h-9 md:h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="lg:col-span-2">
              {/* Description Skeleton */}
              <div className="mb-4 sm:mb-6">
                <div className="w-1/3 h-5 sm:h-6 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-3/4 h-4 sm:h-5 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              {/* Responsibilities Skeleton */}
              <div className="mb-4 sm:mb-6">
                <div className="w-1/3 h-5 sm:h-6 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-5/6 h-4 sm:h-5 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="w-4/5 h-4 sm:h-5 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              {/* Tags Skeleton */}
              <div className="mb-4 sm:mb-6">
                <div className="w-1/4 h-5 sm:h-6 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
              {/* Related Internships Skeleton */}
              <div>
                <div className="w-1/2 h-6 sm:h-7 bg-gray-200 rounded-md mb-3 animate-pulse"></div>
                {[1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="border p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 bg-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center animate-pulse"
                  >
                    <div className="w-full sm:pr-2">
                      <div className="w-1/3 h-3 bg-gray-200 rounded-md mb-1"></div>
                      <div className="w-3/4 h-5 sm:h-6 bg-gray-200 rounded-md mb-1"></div>
                      <div className="w-1/2 h-4 sm:h-5 bg-gray-200 rounded-md mb-1"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md"></div>
                        <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md"></div>
                        <div className="w-16 sm:w-20 h-4 bg-gray-200 rounded-md"></div>
                      </div>
                    </div>
                    <div className="w-full sm:w-32 h-8 sm:h-9 bg-gray-200 rounded-md mt-2 sm:mt-0"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {/* Overview Skeleton */}
              <div className="bg-gray-100 p-3 sm:p-4 rounded-2xl animate-pulse">
                <div className="w-1/3 h-5 sm:h-6 bg-gray-200 rounded-md mb-2"></div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 sm:h-5 bg-gray-200 rounded-md"></div>
                </div>
                <div className="w-full h-20 sm:h-24 md:h-32 bg-gray-200 rounded-lg mt-2 sm:mt-3"></div>
              </div>
              {/* Contact Form Skeleton */}
              <div className="bg-gray-100 p-3 sm:p-4 rounded-2xl animate-pulse">
                <div className="w-1/3 h-5 sm:h-6 bg-gray-200 rounded-md mb-2"></div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="w-full h-7 sm:h-8 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-7 sm:h-8 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-7 sm:h-8 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-10 sm:h-12 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-7 sm:h-8 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const jobpost = internship?.sectionData?.jobpost;
  const relativeTime = internship?.createdDate ? getRelativeTime(internship.createdDate) : "Just now";
  const categoryName = categoryMap[jobpost?.subtype] || jobpost?.subtype || "Unknown Category";
  const applicationDeadline = jobpost?.applicationdeadline ? formatDeadline(jobpost.applicationdeadline) : "Not specified";
  const degreesList = jobpost?.degree?.length > 0 ? jobpost.degree.join(", ") : "Not specified";

  const formattedRelatedInternships = relatedInternships.map((job) => {
    const slug = generateInternshipSlug(
      job.sectionData?.jobpost?.title || "unknown-role",
      job.sectionData?.jobpost?.location || "unknown",
      job.sectionData?.jobpost?.company || "unknown-company",
      job._id
    );
    return {
      id: job._id,
      title: job.sectionData?.jobpost?.title || "Unknown Role",
      company: job.sectionData?.jobpost?.company || "Unknown Company",
      time: job.sectionData?.jobpost?.time || "Unknown",
      salary: job.sectionData?.jobpost?.salary
        ? `${job.sectionData.jobpost.salary}`
        : "Not specified",
      location: job.sectionData?.jobpost?.location || "Unknown",
      relativeTime: job.createdDate ? getRelativeTime(job.createdDate) : "Just now",
      slug: slug,
    };
  });

  const showApplyButton = user.role !== "company" || (user.role === "company" && user.companyId !== internship?.companyId);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-cover bg-center relative flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${Hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative flex flex-col items-center text-center max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 z-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#050748] mb-2 sm:mb-3 line-clamp-2">
            {jobpost?.title || "Unknown Role"}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#45457D] mb-2 sm:mb-3 max-w-xs sm:max-w-md md:max-w-xl">
            {jobpost?.company || "Unknown Company"}
          </p>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-[#45457D]">
            <span>{jobpost?.time || "Unknown Subtype"}</span>
            <span className="hidden sm:inline">|</span>
            <span>{jobpost?.location || "Unknown Location"}</span>
            <span className="hidden sm:inline">|</span>
            <span>{categoryMap[jobpost?.subtype] || jobpost?.subtype || "Unknown Category"}</span>
            <span className="hidden sm:inline">|</span>
            <span>{jobpost?.salary || "Unknown Salary"}</span>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <style>
          {`
            .markdown-content {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #374151;
              word-break: break-word;
            }
            .markdown-content p {
              margin: 0.5rem 0;
            }
            .markdown-content ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            .markdown-content ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            .markdown-content ul li, .markdown-content ol li {
              margin-bottom: 0.25rem;
            }
            .markdown-content ul li.task-list-item {
              list-style-type: none;
              position: relative;
              padding-left: 1.5rem;
            }
            .markdown-content ul li.task-list-item::before {
              content: '☐';
              position: absolute;
              left: 0;
              color: #374151;
            }
            .markdown-content ul li.task-list-item.checked::before {
              content: '☑';
              color: #374151;
            }
            .markdown-content h1, .markdown-content h2, .markdown-content h3 {
              font-weight: 600;
              margin: 0.5rem 0;
            }
            .markdown-content h1 {
              font-size: 1.25rem;
              @media (min-width: 640px) { font-size: 1.5rem; }
            }
            .markdown-content h2 {
              font-size: 1.125rem;
              @media (min-width: 640px) { font-size: 1.25rem; }
            }
            .markdown-content h3 {
              font-size: 1rem;
              @media (min-width: 640px) { font-size: 1.125rem; }
            }
            .markdown-content strong {
              font-weight: 700;
            }
            .markdown-content em {
              font-style: italic;
            }
            .markdown-content a {
              color: #2563eb;
              text-decoration: underline;
            }
            .markdown-content code {
              background-color: #f3f4f6;
              padding: 0.1rem 0.3rem;
              border-radius: 3px;
              font-family: 'Courier New', Courier, monospace;
            }
            .markdown-content pre {
              background-color: #f3f4f6;
              padding: 0.75rem;
              border-radius: 5px;
              overflow-x: auto;
              word-wrap: break-word;
            }
          `}
        </style>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
          <div className="w-full">
            <div className="text-xs sm:text-sm text-gray-400 mb-1">{relativeTime}</div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 line-clamp-2">{jobpost?.title || "Unknown Role"}</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-2">{jobpost?.company || "Unknown Company"}</p>
            <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-500">
              <div className="flex items-center gap-1">
                <MdWork className="text-sm sm:text-base" />
                {jobpost?.time || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <span>₱</span>
                {jobpost?.salary ? `${jobpost.salary}` : "Not specified"}
              </div>
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-sm sm:text-base" />
                {jobpost?.location || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <MdDateRange className="text-sm sm:text-base" />
                Deadline: {applicationDeadline}
              </div>
            </div>
          </div>
          {showApplyButton && (
            hasApplied ? (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-not-allowed w-full md:w-auto mt-3 md:mt-0"
                disabled
              >
                You Have Applied
              </button>
            ) : (
              <button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md text-sm w-full md:w-auto mt-3 md:mt-0"
                onClick={handleApplyClick}
              >
                Apply Internship
              </button>
            )
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <section className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Internship Description</h2>
              <div className="text-sm sm:text-base text-gray-700 markdown-content">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {cleanMarkdown(jobpost?.description) || "No description available."}
  </ReactMarkdown>
</div>
            </section>
            {jobpost?.keyResponsibilities && (
              <section className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Key Responsibilities</h2>
                <div className="text-sm sm:text-base text-gray-700 markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleanMarkdown(jobpost.keyResponsibilities) || "No responsibilities provided."}
      </ReactMarkdown>
    </div>
              </section>
            )}
            {jobpost?.professionalSkills && (
              <section className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Professional Skills</h2>
                 <div className="text-sm sm:text-base text-gray-700 markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleanMarkdown(jobpost.professionalSkills) || "No skills provided."}
      </ReactMarkdown>
    </div>
              </section>
            )}
            {jobpost?.applicationinstructions && (
              <section className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Application Instructions</h2>
                <div className="text-sm sm:text-base text-gray-700 markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleanMarkdown(jobpost.applicationinstructions) || "No instructions provided."}
      </ReactMarkdown>
    </div>
              </section>
            )}
            <section className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  jobpost?.time || "Full Time",
                  categoryName,
                  jobpost?.location || "Unknown",
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-xs sm:text-sm font-medium">Share Internship:</p>
                <FaFacebookF className="text-[#4267B2] text-base sm:text-lg cursor-pointer" title="Facebook" />
                <PiTwitterLogoFill className="text-black text-base sm:text-lg cursor-pointer" title="X" />
                <FaLinkedinIn className="text-[#0077b5] text-base sm:text-lg cursor-pointer" title="LinkedIn" />
              </div>
            </section>
            {formattedRelatedInternships.length > 0 && (
              <section>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Related Internships</h2>
                {formattedRelatedInternships.map((item) => (
                  <div
                    key={item.id}
                    className="border p-2 sm:p-3 md:p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 bg-white"
                  >
                    <div className="flex flex-col justify-between w-full sm:pr-3">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">{item.relativeTime}</div>
                        <h3 className="text-base sm:text-lg font-semibold line-clamp-1">{item.title}</h3>
                        <div className="text-gray-500 text-xs sm:text-sm line-clamp-1">{item.company}</div>
                        <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-500 mt-1 sm:mt-2">
                          <div className="flex items-center gap-1">
                            <MdWork className="text-sm sm:text-base" /> {item.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <span>₱</span> {item.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-sm sm:text-base" /> {item.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/internshipdetail/${item.slug}`)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm md:text-base whitespace-nowrap mt-2 sm:mt-0 w-full sm:w-auto"
                    >
                      Internship Details
                    </button>
                  </div>
                ))}
              </section>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-3 sm:p-4 md:p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Internship Overview</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-[#333]">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500 text-sm sm:text-base" />
                  <span>Internship Title: {jobpost?.title || "Unknown Role"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdWork className="text-blue-500 text-sm sm:text-base" />
                  <span>Internship Type: {jobpost?.time || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTags className="text-blue-500 text-sm sm:text-base" />
                  <span>Category: {categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-blue-500 text-sm sm:text-base" />
                  <span>Experience: {jobpost?.experiencelevel || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-500 text-sm sm:text-base" />
                  <span>Degrees: {degreesList}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>₱</span>
                  <span>Offered Salary: {jobpost?.salary ? `${jobpost.salary}` : "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500 text-sm sm:text-base" />
                  <span>Location: {jobpost?.location || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdDateRange className="text-blue-500 text-sm sm:text-base" />
                  <span>Application Deadline: {applicationDeadline}</span>
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.005659035671!2d72.57136231578908!3d23.022505984951904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f8f2a83b8f%3A0xc4bb2c3cccf0f0f!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1625215052287!5m2!1sen!2sin"
                  width="100%"
                  height="120 sm:150 md:180 lg:200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full rounded-lg"
                ></iframe>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-3 sm:p-4 md:p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Send Us Message</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none"
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none"
                  rows={3}
                ></textarea>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-full py-2 sm:py-3 rounded-md text-xs sm:text-sm md:text-base font-medium">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;