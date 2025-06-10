import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, format } from "date-fns";
import { FaBriefcase } from "react-icons/fa";

const RequestedInternshipsPage = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userid;
  const userEmail = user.email || "Unknown";

  useEffect(() => {
    const fetchInternships = async () => {
      if (!userId || user.role !== "student") {
        setError("You must be logged in as a student to view requested internships.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const applicationData = await fetchSectionData({
          dbName: 'internph',
          collectionName: "application",
          query: { "sectionData.application.student": userId },
          projection: { sectionData: 1, _id: 1, createdDate: 1 },
        });

        const formattedInternships = applicationData.map((app) => {
          const internship = app.sectionData.application || {};
          return {
            id: app._id,
            title: internship.desiredinternshiptitle || "Unknown Role",
            location: internship.preferredlocation || "Not specified",
            type: internship.internshiptype || "Not specified",
            createdAt: app.createdDate
              ? formatDistanceToNow(new Date(app.createdDate), { addSuffix: true })
                  .replace("about ", "")
                  .replace("hours", "hrs")
                  .replace("minutes", "min")
              : "Just now",
            registeredOn: app.createdDate
              ? format(new Date(app.createdDate), "MMM dd, yyyy, hh:mm a")
              : "Unknown",
            by: userEmail,
            status: "Pending", // Assuming a default status; adjust if status is stored
            industry: internship.industry || "Not specified",
            startDate: internship.startdate
              ? format(new Date(internship.startdate), "MMM dd, yyyy")
              : "Not specified",
            duration: internship.availabilityduration || "Not specified",
          };
        });

        setInternships(formattedInternships);
      } catch (err) {
        setError("Failed to fetch requested internships. Please try again.");
        console.error("RequestedInternshipsPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Requested Internships</h1>
      {internships.length === 0 ? (
        <p className="text-gray-600">You have not requested any internships yet.</p>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white"
            >
              <div className="flex flex-col justify-between w-full pr-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">{internship.createdAt}</div>
                  <h4 className="font-semibold text-lg">{internship.title}</h4>
                  <div className="text-gray-500 text-sm">{internship.location}</div>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <FaBriefcase /> Type: {internship.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      By: {internship.by}
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(internship.status)}`}>
                      Status: {internship.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Industry: {internship.industry}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Start Date: {internship.startDate}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Duration: {internship.duration}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Registered On: {internship.registeredOn}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/requested-internship/${internship.id}`)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestedInternshipsPage;