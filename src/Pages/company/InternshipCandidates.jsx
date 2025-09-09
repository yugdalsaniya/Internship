import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSectionData, mUpdate } from "../../Utils/api";
import logo from "../../assets/Navbar/logo.png";
import backgroundImg from "../../assets/Hero/banner.jpg";

const InternshipCandidates = () => {
  const { id } = useParams(); // jobId
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseMap, setCourseMap] = useState({});
  const [filters, setFilters] = useState({ status: "All" });
  const [pendingStatuses, setPendingStatuses] = useState({});
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Redirect if not a company user
  if (user.role !== "company") {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: {},
          projection: { sectionData: 1, _id: 1 },
        });
        const courses = courseResponse.map((item) => ({
          id: item._id,
          name: item.sectionData.course.name,
        }));
        const map = courses.reduce(
          (acc, course) => ({ ...acc, [course.id]: course.name }),
          {}
        );
        setCourseMap(map);

        // Fetch jobpost applicants
        const jobPostResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "jobpost",
          query: { _id: id },
          projection: { "sectionData.jobpost": 1 },
        });

        if (jobPostResponse.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        const applicants = jobPostResponse[0].sectionData.jobpost.applicants || [];
        const userIds = applicants.map((app) => app.text).filter(Boolean);

        if (userIds.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Fetch user details
        const users = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: { $in: userIds } },
          projection: { sectionData: 1 },
        });

        const userMap = users.reduce((map, user) => {
          map[user._id] = user.sectionData.appuser;
          return map;
        }, {});

        // Format candidates
        const formattedCandidates = applicants.map((app) => ({
          userId: app.text,
          name: app.name || userMap[app.text]?.legalname || "Unknown",
          email: app.email || userMap[app.text]?.email || "N/A",
          mobile: userMap[app.text]?.mobile || "N/A",
          course:
            map[userMap[app.text]?.course] ||
            userMap[app.text]?.course ||
            "N/A",
          specialization: userMap[app.text]?.coursespecialization || "N/A",
          resume: userMap[app.text]?.resume || "",
          status: app.status || "Applied",
          feedback: app.feedback || "",
        }));

        setCandidates(formattedCandidates);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const updateStatus = async (userId, newStatus, feedback = "") => {
    try {
      await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'jobpost',
        query: { _id: id },
        update: {
          $set: {
            "sectionData.jobpost.applicants.$[elem].status": newStatus,
            "sectionData.jobpost.applicants.$[elem].feedback": feedback,
          },
        },
        options: {
          arrayFilters: [{ "elem.text": userId }],
          upsert: false,
        },
      });

      // Update local state
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.userId === userId
            ? { ...candidate, status: newStatus, feedback }
            : candidate
        )
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleUpdate = (userId) => {
    const candidate = candidates.find((c) => c.userId === userId);
    const newStatus = pendingStatuses[userId] || candidate.status;
    let feedback = candidate.feedback;

    if (newStatus === "Rejected") {
      feedback = window.prompt("Enter rejection feedback (optional):", feedback) || "";
    }

    updateStatus(userId, newStatus, feedback);

    // Clear pending status
    setPendingStatuses((prev) => {
      const newPending = { ...prev };
      delete newPending[userId];
      return newPending;
    });
  };

  const filteredCandidates = candidates.filter((candidate) =>
    filters.status === "All" ? true : candidate.status === filters.status
  );

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Internship Candidates
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            Manage candidates who applied for this internship.
          </p>
          <button
            onClick={() => navigate("/manage-internships")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Internships
          </button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6">
            Applied Candidates
          </h2>
          <div className="mb-6">
            <label className="text-sm font-medium mr-2">
              Filter by Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="p-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Interview">Interview</option>
            </select>
          </div>
          {filteredCandidates.length === 0 ? (
            <p className="text-center text-gray-600">
              No candidates match the selected filter.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.userId}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-[#050748]">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{" "}
                        {candidate.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Mobile:</span>{" "}
                        {candidate.mobile}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Course:</span>{" "}
                        {candidate.course}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Specialization:</span>{" "}
                        {candidate.specialization}
                      </p>
                      {candidate.resume && (
                        <a
                          href={candidate.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          View Resume
                        </a>
                      )}
                      {candidate.feedback && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Feedback:</span>{" "}
                          {candidate.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        value={pendingStatuses[candidate.userId] || candidate.status}
                        onChange={(e) =>
                          setPendingStatuses({
                            ...pendingStatuses,
                            [candidate.userId]: e.target.value,
                          })
                        }
                        className="p-2 border rounded-md"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Interview">Interview</option>
                      </select>
                      <button
                        onClick={() => handleUpdate(candidate.userId)}
                        className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipCandidates;