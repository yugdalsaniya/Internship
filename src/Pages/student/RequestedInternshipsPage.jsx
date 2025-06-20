import React, { useEffect, useState } from "react";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, format } from "date-fns";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaUser,
  FaCheckCircle,
} from "react-icons/fa";

const RequestedInternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userid;
  const userEmail = user.email || "Unknown";

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || user.role !== "student") {
        setError(
          "You must be logged in as a student to view requested internships."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch categories
        const categoryResponse = await fetchSectionData({
          collectionName: "category",
          query: {},
          projection: { "sectionData.category.titleofinternship": 1, _id: 1 },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.category.titleofinternship",
        });

        const categoryData = Array.isArray(categoryResponse)
          ? categoryResponse
              .filter(
                (item) =>
                  item.sectionData?.category?.titleofinternship && item._id
              )
              .map((item) => ({
                id: item._id,
                title: item.sectionData.category.titleofinternship,
              }))
          : [
              { id: "1749121324626", title: "TECHNOLOGY" },
              { id: "1749121385325", title: "Analytics" },
              { id: "1749121505889", title: "FINANCE" },
              { id: "1749121597482", title: "MARKETING" },
              { id: "1749121776119", title: "CYBERSECURITY" },
              { id: "1749122138386", title: "E-commerce" },
              { id: "1749122277361", title: "Education" },
              { id: "1749122393285", title: "Tourism" },
            ];

        // Fetch skills
        const skillsResponse = await fetchSectionData({
          collectionName: "skills",
          query: {},
          projection: { "sectionData.skills.name": 1, _id: 1 },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.skills.name",
        });

        const skillsData = Array.isArray(skillsResponse)
          ? skillsResponse
              .filter((item) => item.sectionData?.skills?.name && item._id)
              .map((item) => ({
                id: item._id,
                name: item.sectionData.skills.name,
              }))
          : [
              { id: "1748586161409", name: "Deep Learning" },
              { id: "1748586175283", name: "Securities" },
              { id: "1748586210005", name: "CRM Proficiency" },
            ];

        // Fetch applications
        const applicationData = await fetchSectionData({
          dbName: "internph",
          collectionName: "application",
          query: { "sectionData.application.student": userId },
          projection: { sectionData: 1, _id: 1, createdDate: 1 },
        });

        const formattedInternships = applicationData.map((app) => {
          const internship = app.sectionData.application || {};
          const industryId = internship.industry || "";
          const category = categoryData.find((cat) => cat.id === industryId);
          return {
            id: app._id,
            title: internship.desiredinternshiptitle || "Unknown Role",
            location: internship.preferredlocation || "Not specified",
            type: internship.internshiptype || "Not specified",
            createdAt: app.createdDate
              ? formatDistanceToNow(new Date(app.createdDate), {
                  addSuffix: true,
                })
                  .replace("about ", "")
                  .replace("hours", "hrs")
                  .replace("minutes", "min")
              : "Just now",
            registeredOn: app.createdDate
              ? format(new Date(app.createdDate), "MMM dd, yyyy")
              : "Unknown",
            by: userEmail,
            industry: category ? category.title : industryId || "Not specified",
            startDate: internship.startdate
              ? format(new Date(internship.startdate), "MMM dd, yyyy")
              : "Not specified",
            duration: internship.availabilityduration || "Not specified",
            skills: internship.skills
              ? internship.skills
                  .map((skillId) => {
                    const skill = skillsData.find((s) => s.id === skillId);
                    return skill ? skill.name : skillId;
                  })
                  .filter(Boolean)
                  .join(", ")
              : "None",
            status: internship.status || "Pending",
            bycompany: internship.bycompany || "Not shortlisted",
          };
        });

        setInternships(formattedInternships);
      } catch (err) {
        setError("Failed to fetch requested internships. Please try again.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-center text-gray-600">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        My Published Internships
      </h1>
      {internships.length === 0 ? (
        <p className="text-center text-gray-500">
          No internships applied for yet.
        </p>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                {internship.title}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />{" "}
                  {internship.location}
                </span>
                <span className="flex items-center gap-2">
                  <FaBriefcase className="text-blue-500" /> {internship.type}
                </span>
                <span className="flex items-center gap-2">
                  <FaTag className="text-blue-500" /> {internship.industry}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> Start:{" "}
                  {internship.startDate}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock className="text-blue-500" /> Duration:{" "}
                  {internship.duration}
                </span>
                <span className="flex items-center gap-2">
                  <FaTag className="text-blue-500" /> Skills:{" "}
                  {internship.skills}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <FaUser className="text-blue-500" /> By: {internship.by}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span
                  className={`flex items-center gap-2 ${
                    internship.status === "Shortlisted"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      internship.status === "Shortlisted"
                        ? "text-green-500"
                        : "text-gray-500"
                    }
                  />
                  Status:{" "}
                  {internship.status === "Shortlisted"
                    ? `You are Shortlisted by ${internship.bycompany}`
                    : "Pending"}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {internship.createdAt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestedInternshipsPage;