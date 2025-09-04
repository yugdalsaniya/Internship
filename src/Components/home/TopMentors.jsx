import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSectionData } from "./../../Utils/api";

const TopMentors = () => {
  const fallbackImage = "https://placehold.co/120x120";
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateSlug = (name) => {
    if (!name || typeof name !== "string") return "mentor";
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await fetchSectionData({
  dbName: "internph",
  collectionName: "appuser",
  query: { "sectionData.appuser.yearsofexperience": { $exists: true } }, // 👈 relaxed query
  projection: {
    "sectionData.appuser.legalname": 1,
    "sectionData.appuser.about": 1,
    "sectionData.appuser.profile": 1,
    "sectionData.appuser.order": 1,
    _id: 1,
  },
});

        const mappedData = data.map((item) => {
          const mentor = item.sectionData.appuser;
          const imgUrl =
            mentor.profile &&
            typeof mentor.profile === "string" &&
            mentor.profile.trim() !== ""
              ? mentor.profile
              : fallbackImage;

          return {
            id: item._id,
            name: mentor.legalname || "Unnamed Mentor",
            tagline: mentor.about || "",
            image: imgUrl,
            order: mentor.order || "99",
            slug: generateSlug(mentor.legalname),
          };
        });

        const uniqueMentors = Array.from(
          new Map(mappedData.map((m) => [m.id, m])).values()
        );

        const sortedMentors = uniqueMentors.sort((a, b) => {
          const orderA = parseInt(a.order, 10);
          const orderB = parseInt(b.order, 10);
          return orderA - orderB;
        });

        setMentors(sortedMentors);
      } catch (err) {
        setError("Failed to load mentors. Please try again later.");
        console.error("TopMentors API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleImageError = (e) => {
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    }
  };

  return (
    <section className="py-4">
      <div className="px-4 sm:px-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050748] mb-2">
              Top Mentors
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Learn and grow with expert guidance
            </p>
          </div>
          <Link
            to="/all-mentors"
            className="text-blue-600 md:text-[#6A6A8E] text-sm md:text-base font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[200px]"
              >
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-full mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-full mt-auto" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 text-xs sm:text-base py-4">
            {error}
          </div>
        )}

        {!loading && !error && mentors.length === 0 && (
          <div className="text-center text-gray-600 text-xs sm:text-base py-4">
            No mentors found.
          </div>
        )}

        {!loading && !error && mentors.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {mentors.slice(0, 4).map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer min-h-[200px]"
              >
                <div className="w-24 h-24 flex items-center justify-center mb-3">
                  <img
                    src={mentor.image}
                    alt={`${mentor.name} photo`}
                    className="w-24 h-24 object-cover rounded-full"
                    onError={handleImageError}
                  />
                </div>
                <h3
                  className="text-base sm:text-lg font-semibold text-gray-900 text-center capitalize mb-2 line-clamp-1"
                  title={mentor.name}
                >
                  {mentor.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 line-clamp-2">
                  {mentor.tagline}
                </p>
                <Link
                  to={`/mentor/${mentor.slug}/${mentor.id}`}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap mt-auto"
                >
                  View Mentor
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopMentors;
