import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/Navbar/logo.png";

const AllMentorships = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all mentorship programs (no filter by user)
  const fetchAllMentorships = async () => {
    try {
      const data = await fetchSectionData({
        dbName: "internph",
        collectionName: "mentorship",
        query: {}, // fetch all mentorships
        projection: { sectionData: 1, createdBy: 1, createdDate: 1 },
        limit: 0,
        order: -1,
        sortedBy: "createdDate",
      });

      if (data && Array.isArray(data)) {
        const formattedMentorships = data
          .map((post) => {
            let relativeTime = "Just now";
            let parsedDate;
            try {
              parsedDate = parseISO(post.createdDate);
              relativeTime = formatDistanceToNow(parsedDate, {
                addSuffix: true,
              })
                .replace("about ", "")
                .replace("hours", "hrs")
                .replace("minutes", "min");
            } catch (err) {
              console.error("Error parsing date for post", post._id, err);
            }

            const mentorshipData = post.sectionData?.mentorship || {};
            return {
              id: post._id,
              title: mentorshipData.title || "Unknown Program",
              mentor: mentorshipData.mentor_name || "Unknown Mentor",
              focusArea: mentorshipData.focus_area || "Not specified",
              sessionDetails: mentorshipData.session_details || "Not specified",
              duration: mentorshipData.duration
                ? `${mentorshipData.duration} months`
                : "Not specified",
              deadline: mentorshipData.deadline
                ? new Date(mentorshipData.deadline).toLocaleDateString()
                : "Not specified",
              location: mentorshipData.location || "Online",
              description:
                mentorshipData.description || "No description provided",
              posted: relativeTime,
              createdDate: parsedDate,
            };
          })
          .sort((a, b) => b.createdDate - a.createdDate);

        setMentorships(formattedMentorships);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      setError("Error fetching mentorship programs");
      console.error("AllMentorships API Error:", err);
      toast.error("Error fetching mentorship programs", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMentorships();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <ToastContainer />
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#050748] mb-8">
            Explore Mentorship Programs
          </h1>
          {loading ? (
            <p className="text-center text-base text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-base text-red-500">{error}</p>
          ) : mentorships.length === 0 ? (
            <p className="text-center text-base text-gray-600">
              No mentorship programs available right now. Please check back
              later!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorships.map((mentorship) => (
                <div
                  key={mentorship.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl max-w-sm mx-auto"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>
                  <div className="p-6 relative">
                    <div className="flex items-center mb-4">
                      <img
                        src={logo}
                        alt="Mentorship Logo"
                        className="w-10 h-10 rounded-full object-contain border border-gray-200 mr-3"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-[#050748] truncate">
                          {mentorship.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          by {mentorship.mentor}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <strong>Focus:</strong> {mentorship.focusArea}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {mentorship.deadline}
                      </p>
                      <p>
                        <strong>Duration:</strong> {mentorship.duration}
                      </p>
                      <p>
                        <strong>Sessions:</strong> {mentorship.sessionDetails}
                      </p>
                      <p className="line-clamp-3">
                        <strong>Description:</strong> {mentorship.description}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between items-center gap-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                        Posted {mentorship.posted}
                      </span>
                      <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all">
                        Apply Mentorship
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

export default AllMentorships;
