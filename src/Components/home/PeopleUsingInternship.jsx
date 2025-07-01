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
      const scrollAmount = 600; // Adjust based on section width
      scrollRef.current.scrollLeft += direction * scrollAmount;
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
          ? response.map((item) => item.sectionData?.peopleusinginternshp).filter(Boolean)
          : [response.sectionData?.peopleusinginternshp];

        const formattedData = apiData.map((section) => ({
          title: section.title || "Untitled",
          description: section.subtitle || "",
          items: section.description?.map((desc) => desc.description) || [],
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
        <div className="px-12 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-10 w-24 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="relative">
              <button
                className="absolute left-[-16px] top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-3 py-2 rounded-full z-10 shadow-md animate-pulse"
                disabled
              >
                &lt;
              </button>
              <div
                className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-200"
                style={{ scrollBehavior: "smooth" }}
              >
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-bl-3xl mb-5 rounded-tr-3xl border-2 w-[600px] min-w-[700px] max-w-[600px]"
                  >
                    <div className="flex justify-between mb-4 mt-4 items-center space-x-4">
                      <div className="flex-1">
                        <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mb-6"></div>
                        <ul className="list-disc list-inside text-gray-600 mt-6 space-y-1">
                          <li>
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                          <li>
                            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                          <li>
                            <div className="h-4 w-60 bg-gray-200 rounded animate-pulse"></div>
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                        <div className="w-28 h-28 bg-gray-300 rounded-full shadow-lg animate-pulse"></div>
                        <div className="h-10 w-32 bg-gray-300 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="absolute right-[-16px] top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-3 py-2 rounded-full z-10 shadow-md animate-pulse"
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
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <section className="py-4">
      <div className="px-12 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#050748]">{data.title}</h2>
              <p className="text-gray-600">{data.subtitle}</p>
            </div>
            <div className="flex space-x-2">
              {data.tabs.map((tab, index) => (
                <button
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 text-[#ffffff] py-2 rounded-full"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => scroll(-1)}
              className="absolute left-[-16px] top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-3 py-2 rounded-full z-10 shadow-md hover:bg-purple-600"
            >
              &lt;
            </button>
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200"
              style={{ scrollBehavior: "smooth" }}
            >
              {data.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-bl-3xl mb-5 rounded-tr-3xl border-2 w-[600px] min-w-[700px] max-w-[600px]"
                >
                  <div className="flex justify-between mb-4 mt-4 items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-800">
                        {section.title}
                      </h3>
                      <p className="text-gray-600">{section.description}</p>
                      <ul className="list-disc list-inside text-gray-600 mt-6 space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-28 h-28 rounded-full shadow-lg object-cover"
                        onError={(e) => {
                          e.target.src = "/path/to/fallback/image.png";
                        }}
                      />
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scroll(1)}
              className="absolute right-[-16px] top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-3 py-2 rounded-full z-10 shadow-md"
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