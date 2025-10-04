import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSectionData } from "../../Utils/api";

const PeopleUsingInternship = () => {
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    tabs: [],
    sections: [],
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const cardWidth =
          scrollRef.current.querySelector("div").offsetWidth + 16; // Card width + gap
        scrollRef.current.scrollLeft += direction * cardWidth;
      } else {
        scrollRef.current.scrollLeft += direction * 600; // Original scroll amount for larger screens
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "peopleusinginternshp",
          query: {},
          projection: { sectionData: 1, _id: 0 },
        });

        if (!response || (Array.isArray(response) && response.length === 0)) {
          throw new Error("No data found. Please contact support.");
        }

        const apiData = Array.isArray(response)
          ? response
              .map((item) => item.sectionData?.peopleusinginternshp)
              .filter(Boolean)
          : [response.sectionData?.peopleusinginternshp];

        const formattedData = apiData.map((section) => ({
          title: section.title || "Untitled",
          description: section.subtitle || "",
          items: section.description?.map((desc) =>
            desc.description.replace(/^\*\s*/, "").trim() // Remove leading asterisk and trim whitespace
          ) || [],
          image: section.profile || "",
        }));

        setData({
          title: "People Using Internshp",
          subtitle: "Powering early careers.",
          tabs: ["Industry", "Academy"],
          sections: formattedData,
        });
      } catch (err) {
        const errorMessage = err.message || "Failed to load data.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching data:", err);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="px-4 sm:px-12 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4">
              <div>
                <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-40 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <div className="h-8 sm:h-10 w-20 sm:w-24 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-8 sm:h-10 w-20 sm:w-24 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="relative">
              <button
                className="absolute left-[-12px] sm:left-[-16px] top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full z-10 animate-pulse"
                disabled
              >
                &lt;
              </button>
              <div
                className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-200 snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth" }}
              >
                {[...Array(1)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 sm:p-4 rounded-bl-3xl mb-4 sm:mb-5 rounded-tr-3xl border-2 w-[calc(100vw-2rem)] sm:w-[600px] min-w-[calc(100vw-2rem)] sm:min-w-[700px] max-w-[calc(100vw-2rem)] sm:max-w-[600px] snap-center"
                  >
                    <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 mt-3 sm:mt-4 items-center space-x-0 sm:space-x-4">
                      <div className="flex-1">
                        <div className="h-5 sm:h-6 w-40 sm:w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 sm:w-80 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6"></div>
                        <ul className="list-disc list-inside text-gray-600 mt-4 sm:mt-6 space-y-1 pl-5">
                          <li>
                            <div className="h-4 w-56 sm:w-64 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                          <li>
                            <div className="h-4 w-48 sm:w-56 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                          <li>
                            <div className="h-4 w-52 sm:w-60 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-center space-y-3 sm:space-y-4 min-w-[120px] sm:min-w-[200px]">
                        <div className="w-20 sm:w-28 h-20 sm:h-28 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-300 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="absolute right-[-12px] sm:right-[-16px] top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full z-10 animate-pulse"
                disabled
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4 text-base sm:text-lg">
        {error}
      </div>
    );
  }

  return (
    <section className="py-4">
      <div className="px-4 sm:px-12 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 px-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-2xl font-bold text-[#050748] mt-0 mb-2 sm:mt-6 sm:mb-2">
                {data.title}
              </h2>
              <p className="text-gray-600 text-base mb-3 sm:mb-0">
                {data.subtitle}
              </p>
            </div>
            <div className="flex space-x-2 mt-0 sm:mt-0 w-full sm:w-auto overflow-x-auto pb-2 scrollbar-hide">
              {data.tabs.map((tab, index) => (
                <button
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 text-white py-2 rounded-full text-sm active:bg-purple-700 whitespace-nowrap flex-shrink-0"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => scroll(-1)}
              className="absolute left-[-12px] sm:left-[-16px] top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full z-10 hover:bg-purple-600 active:bg-purple-700 touch-manipulation"
            >
              &lt;
            </button>
            <div
              ref={scrollRef}
              className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 snap-x snap-mandatory"
              style={{ scrollBehavior: "smooth" }}
            >
              {data.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white p-3 sm:p-4 rounded-bl-3xl mb-4 sm:mb-5 rounded-tr-3xl border-2 w-[calc(100vw-2rem)] sm:w-[600px] min-w-[calc(100vw-2rem)] sm:min-w-[700px] max-w-[calc(100vw-2rem)] sm:max-w-[600px] snap-center"
                >
                  <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 mt-3 sm:mt-4 items-center space-x-0 sm:space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg sm:text-xl text-gray-800 line-clamp-1">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
                        {section.description}
                      </p>
                      <ul
                        style={{ listStyleType: "disc" }}
                        className="list-disc list-inside text-gray-600 text-sm sm:text-base mt-4 sm:mt-6 space-y-1  debug-list"
                      >
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4 min-w-[120px] sm:min-w-[200px]">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-20 sm:w-28 h-20 sm:h-28 rounded-full shadow-lg object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/path/to/fallback/image.png";
                        }}
                      />
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base active:bg-purple-700">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scroll(1)}
              className="absolute right-[-12px] sm:right-[-16px] top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full z-10 hover:bg-purple-600 active:bg-purple-700 touch-manipulation"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeopleUsingInternship;