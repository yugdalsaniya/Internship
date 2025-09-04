import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSectionData } from "./../../Utils/api";

const AllMentors = () => {
  const fallbackImage = "https://placehold.co/150x150";
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate slug from name
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
          query: { "sectionData.appuser.areaofexperties": { $exists: true } }, // ✅ mentors only
          projection: {
            "sectionData.appuser.legalname": 1,
            "sectionData.appuser.about": 1,
            "sectionData.appuser.profile": 1,
            _id: 1,
          },
        });

        const mappedData = data.map((item) => ({
          id: item._id,
          name: item.sectionData.appuser.legalname || "Unnamed Mentor",
          tagline: item.sectionData.appuser.about || "",
          image:
            item.sectionData.appuser.profile &&
            item.sectionData.appuser.profile.trim() !== ""
              ? item.sectionData.appuser.profile
              : fallbackImage,
          slug: generateSlug(item.sectionData.appuser.legalname),
        }));

        setMentors(mappedData);
      } catch (err) {
        setError("Failed to load mentors. Please try again later.");
        console.error("AllMentors API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  return (
    <section className="py-8">
      <div className="px-12">
        <h2 className="text-3xl font-bold text-[#050748] mb-8">All Mentors</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[250px]"
              >
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-full mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && mentors.length === 0 && (
          <div className="text-center text-gray-600">No mentors found.</div>
        )}

        {!loading && !error && mentors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
              >
                <img
                  src={mentor.image}
                  alt={`${mentor.name} photo`}
                  className="w-24 h-24 object-contain mb-4 rounded-full"
                  onError={handleImageError}
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center capitalize mb-2">
                  {mentor.name}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  {mentor.tagline}
                </p>
                <Link
                  to={`/mentor/${mentor.slug}/${mentor.id}`}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
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

export default AllMentors;
