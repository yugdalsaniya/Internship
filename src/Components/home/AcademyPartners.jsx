import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSectionData } from "./../../Utils/api";

const TopAcademy = () => {
  const fallbackLogo = "https://placehold.co/150x100";
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateSlug = (name) => {
    if (!name || typeof name !== "string") return "academy";
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Function to handle missing institution name
  const truncateName = (name) => {
    if (!name || typeof name !== "string") return "Unnamed Academy";
    return name;
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await fetchSectionData({
          dbName: "internph",
          collectionName: "institute",
          query: { "sectionData.institute.showinhomepage": true },
          projection: {
            "sectionData.institute.institutionname": 1,
            "sectionData.institute.institutiontagline": 1,
            "sectionData.institute.image": 1,
            "sectionData.institute.order": 1,
            _id: 1,
          },
        });

        const mappedData = data.map((item) => {
          const institute = item.sectionData.institute;
          const logoUrl = institute.image && typeof institute.image === 'string' && institute.image.trim() !== ''
            ? institute.image
            : fallbackLogo;
          return {
            id: item._id,
            name: institute.institutionname || "Unnamed Academy",
            tagline: institute.institutiontagline || "",
            logo: logoUrl,
            order: institute.order || "4",
            slug: generateSlug(institute.institutionname),
          };
        });

        // Remove duplicates by ID
        const uniquePartners = Array.from(
          new Map(mappedData.map(partner => [partner.id, partner])).values()
        );

        // Sort by order field
        const sortedPartners = uniquePartners.sort((a, b) => {
          const orderA = parseInt(a.order, 10);
          const orderB = parseInt(b.order, 10);
          return orderA - orderB;
        });

        setPartners(sortedPartners);
      } catch (err) {
        setError("Failed to load partners. Please try again later.");
        console.error("TopAcademy API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleImageError = (e) => {
    if (e.target.src !== fallbackLogo) {
      e.target.src = fallbackLogo;
    }
  };

  return (
    <section className="py-4">
      <div className="px-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-4">
              Top Academy
            </h2>
            <p className="text-[#6A6A8E]">Elite Learning Partners</p>
          </div>
          <Link
            to="/all-academies"
            className="text-[#6A6A8E] font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[250px]"
              >
                <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && partners.length === 0 && (
          <div className="text-center text-gray-600">No partners found.</div>
        )}
        {!loading && !error && partners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.slice(0, 4).map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
              >
                <div className="w-[150px] h-[150px] flex items-center justify-center mb-4">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-[150px] max-h-[150px] object-contain"
                    onError={handleImageError}
                  />
                </div>
                <h3
                  className="text-lg font-semibold text-gray-900 text-center capitalize mb-2 line-clamp-2"
                  title={partner.name} // Full name on hover
                >
                  {truncateName(partner.name)}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  {partner.tagline}
                </p>
                <Link
                  to={`/academy/${partner.slug}/${partner.id}`}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
                >
                  View Academy
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopAcademy;