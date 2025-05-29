import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../assets/Hero/banner.jpg";
import {
  FaMapMarkerAlt,
  FaRegClock,
  FaRupeeSign,
  FaUser,
  FaGraduationCap,
  FaTags,
  FaBriefcase,
  FaPhoneAlt,
  FaEnvelope,
  FaCommentDots,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { PiTwitterLogoFill } from "react-icons/pi";
import { fetchSectionData } from "../Utils/api";
import { formatDistanceToNow, parse } from "date-fns";

const InternshipDetailsPage = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [relatedInternships, setRelatedInternships] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchCategoriesAndInternship = async () => {
      try {
        // Fetch categories
        const categoriesData = await fetchSectionData({
          collectionName: "category",
          query: {},
        });

        const categoryMapping = categoriesData.reduce((map, category) => {
          const categoryId = category._id;
          const categoryName = category.sectionData?.category?.titleofinternship || "Unknown Category";
          map[categoryId] = categoryName;
          return map;
        }, {});
        setCategoryMap(categoryMapping);

        // Fetch the specific internship
        const internshipData = await fetchSectionData({
          collectionName: "jobpost",
          query: { _id: id },
        });

        if (internshipData && internshipData.length > 0) {
          setInternship(internshipData[0]);

          // Fetch related internships
          const currentSubtype = internshipData[0]?.sectionData?.jobpost?.subtype;
          const relatedQuery = {
            "sectionData.jobpost.type": "Internship",
            _id: { $ne: id },
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
        console.error("InternshipDetailsPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndInternship();
  }, [id]);

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

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;

  const jobpost = internship?.sectionData?.jobpost;
  const relativeTime = internship?.createdDate ? getRelativeTime(internship.createdDate) : "Just now";
  const categoryName = categoryMap[jobpost?.subtype] || jobpost?.subtype || "Unknown Category";

  // Join degree array into a comma-separated string
  const degreesList = jobpost?.degree?.length > 0 ? jobpost.degree.join(", ") : "Not specified";

  const formattedRelatedInternships = relatedInternships.map((job) => ({
    id: job._id,
    title: job.sectionData?.jobpost?.title || "Unknown Role",
    company: job.sectionData?.jobpost?.company || "Unknown Company",
    time: job.sectionData?.jobpost?.time || "Unknown",
    salary: job.sectionData?.jobpost?.salary
      ? `₹${job.sectionData.jobpost.salary}`
      : "Not specified",
    location: job.sectionData?.jobpost?.location || "Unknown",
    relativeTime: job.createdDate ? getRelativeTime(job.createdDate) : "Just now",
  }));

  // Determine if the "Apply Internship" button should be shown
  const showApplyButton = user.role !== 'company' || (user.role === 'company' && user.companyId !== internship?.companyId);

  return (
    <div>
      {/* Hero Section */}
      <div
        className="w-full h-[300px] bg-cover bg-center relative flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${Hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-3">
            Internship Details
          </h1>
          <p className="text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
            "Empower Your Future: Unleash Limitless Career Possibilities!"
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-xs text-gray-400 mb-1">{relativeTime}</div>
            <h1 className="text-3xl font-bold mb-1">{jobpost?.title || "Unknown Role"}</h1>
            <p className="text-gray-500">{jobpost?.company || "Unknown Company"}</p>
            <div className="flex gap-5 text-sm text-gray-500 mt-3">
              <div className="flex items-center gap-1">
                <MdWork />
                {jobpost?.time || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <FaRupeeSign />
                {jobpost?.salary ? `₹${jobpost.salary}` : "Not specified"}
              </div>
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt />
                {jobpost?.location || "Unknown"}
              </div>
            </div>
          </div>
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-md"
            onClick={() => navigate("/applyinternshipform")}
          >
            Apply Internship
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Section */}
          <div className="lg:col-span-2">
            {/* Internship Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Internship Description</h2>
              <p className="text-gray-700">
                {jobpost?.description || "No description available."}
              </p>
            </section>

            {/* Key Responsibilities */}
            {jobpost?.keyResponsibilities && jobpost.keyResponsibilities.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Key Responsibilities</h2>
                <ul className="list-disc ml-5 text-gray-700 space-y-2">
                  {jobpost.keyResponsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility.text}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Professional Skills */}
            {jobpost?.professionalSkills && jobpost.professionalSkills.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Professional Skills</h2>
                <ul className="list-disc ml-5 text-gray-700 space-y-2">
                  {jobpost.professionalSkills.map((skill, index) => (
                    <li key={index}>{skill.text}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags + Share Internship */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-2">Tags:</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  jobpost?.time || "Full Time",
                  categoryName,
                  jobpost?.location || "Unknown",
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">Share Internship:</p>
                <FaFacebookF className="text-[#4267B2] text-lg cursor-pointer" title="Facebook" />
                <PiTwitterLogoFill className="text-black text-lg cursor-pointer" title="X" />
                <FaLinkedinIn className="text-[#0077b5] text-lg cursor-pointer" title="LinkedIn" />
              </div>
            </section>

            {/* Related Internships */}
            {formattedRelatedInternships.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-5">Related Internships</h2>
                {formattedRelatedInternships.map((item) => (
                  <div
                    key={item.id}
                    className="border p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 bg-white min-h-[120px]"
                  >
                    <div className="flex flex-col justify-between h-full w-full pr-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">{item.relativeTime}</div>
                        <h4 className="font-semibold text-lg line-clamp-1">{item.title}</h4>
                        <div className="text-gray-500 text-sm line-clamp-1">{item.company}</div>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MdWork /> {item.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaRupeeSign /> {item.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt /> {item.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => (window.location.href = `/internshipdetail/${item.id}`)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md whitespace-nowrap"
                    >
                      Internship Details
                    </button>
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Internship Overview */}
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-lg mb-3">Internship Overview</h3>
              <div className="space-y-3 text-sm text-[#333]">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  <span>Internship Title: {jobpost?.title || "Unknown Role"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdWork className="text-blue-500" />
                  <span>Internship Type: {jobpost?.time || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTags className="text-blue-500" />
                  <span>Category: {categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-blue-500" />
                  <span>Experience: {jobpost?.experiencelevel || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-500" />
                  <span>Degrees: {degreesList}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRupeeSign className="text-blue-500" />
                  <span>Offered Salary: {jobpost?.salary ? `₹${jobpost.salary}` : "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>Location: {jobpost?.location || "Unknown"}</span>
                </div>
              </div>
              <div className="mt-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.005659035671!2d72.57136231534908!3d23.022505984951904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f8f2a83b8f%3A0xc4bb2c3cccf0f0f!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1625215052287!5m2!1sen!2sin"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full rounded-lg"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-lg mb-4">Send Us Message</h3>
              <form className="space-y-3 text-sm">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                  rows={3}
                ></textarea>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-full py-2 rounded-md text-sm font-medium">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailsPage;