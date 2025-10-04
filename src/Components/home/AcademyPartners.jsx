import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSectionData } from "./../../Utils/api";

const TopAcademy = () => {
  const fallbackLogo = "https://placehold.co/120x80";
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

        const uniquePartners = Array.from(
          new Map(mappedData.map(partner => [partner.id, partner])).values()
        );

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
      <div className="px-4 sm:px-12">
        <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#050748] mb-2">Elite Learning Institutions</h2>
                    <p className="text-gray-600 text-base sm:text-lg">Connecting Students to Internships and Jobs</p>
                  </div>
                  <Link 
                    to="/all-academies" 
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
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[180px]"
              >
                <div className="w-28 h-16 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-full mt-auto" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600 text-xs sm:text-base py-4">{error}</div>}

        {!loading && !error && partners.length === 0 && (
          <div className="text-center text-gray-600 text-xs sm:text-base py-4">No partners found.</div>
        )}

        {!loading && !error && partners.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {partners.slice(0, 4).map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[180px]"
              >
                <div className="w-28 h-16 flex items-center justify-center mb-3">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-[120px] max-h-[80px] object-contain"
                    onError={handleImageError}
                  />
                </div>
                <h3
                  className="text-base sm:text-lg font-semibold text-gray-900 text-center capitalize mb-2 line-clamp-2"
                  title={partner.name}
                >
                  {truncateName(partner.name)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 line-clamp-2">
                  {partner.tagline}
                </p>
                <Link
                  to={`/academy/${partner.slug}/${partner.id}`}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap mt-auto"
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