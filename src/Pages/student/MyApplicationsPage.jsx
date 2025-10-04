import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, format } from "date-fns";
import { FaBriefcase } from "react-icons/fa";

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userid;
  const userEmail = user.email || "Unknown";

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId || user.role !== "student") {
        setError("You must be logged in as a student to view applications.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch applications
        const applicationData = await fetchSectionData({
          dbName: 'internph',
          collectionName: "applications",
          query: { userId },
          projection: { jobId: 1, appliedAt: 1, _id: 1 },
        });

        // Fetch job posts
        const jobIds = applicationData.map((app) => app.jobId);
        const jobPosts = await fetchSectionData({
          dbName: 'internph',
          collectionName: "jobpost",
          query: { _id: { $in: jobIds } },
          projection: { "sectionData.jobpost": 1, _id: 1 },
        });

        // Map job posts
        const jobPostMap = jobPosts.reduce((map, job) => {
          map[job._id] = job.sectionData.jobpost;
          return map;
        }, {});

        // Combine data
        const formattedApplications = applicationData.map((app) => {
          const job = jobPostMap[app.jobId] || {};
          const applicant = job.applicants?.find((a) => a.text === userId) || {};
          return {
            id: app.jobId,
            applicationId: app._id,
            title: job.title || "Unknown Role",
            company: job.company || "Unknown Company",
            deadline: job.applicationdeadline
              ? format(new Date(job.applicationdeadline), "MMM dd, yyyy")
              : "Not specified",
            appliedAt: app.appliedAt
              ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })
                  .replace("about ", "")
                  .replace("hours", "hrs")
                  .replace("minutes", "min")
              : "Just now",
            registeredOn: app.appliedAt
              ? format(new Date(app.appliedAt), "MMM dd, yyyy, hh:mm a")
              : "Unknown",
            by: userEmail,
            status: applicant.status || "Applied",
            feedback: applicant.feedback || "",
          };
        });

        setApplications(formattedApplications);
      } catch (err) {
        setError("Failed to fetch applications. Please try again.");
        console.error("MyApplicationsPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Interview": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Applied Internships</h1>
      {applications.length === 0 ? (
        <p className="text-gray-600">You have not applied to any internships yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white"
            >
              <div className="flex flex-col justify-between w-full pr-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">{app.appliedAt}</div>
                  <h4 className="font-semibold text-lg">{app.title}</h4>
                  <div className="text-gray-500 text-sm">{app.company}</div>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <FaBriefcase /> Deadline: {app.deadline}
                    </div>
                    <div className="text-sm text-gray-500">
                      By: {app.by}
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                      Status: {app.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Registered On: {app.registeredOn}
                  </div>
                  {app.feedback && (
                    <div className="text-sm text-gray-500 mt-1">
                      Feedback: {app.feedback}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/internshipdetail/${app.id}`)}
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

export default MyApplicationsPage;