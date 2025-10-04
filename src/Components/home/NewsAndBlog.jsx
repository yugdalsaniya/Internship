import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const NewsAndBlog = () => {
  const scrollRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createSlug = (title) => {
    if (!title) return "untitled";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth + 16 || 300;
        scrollRef.current.scrollLeft += direction * cardWidth;
      }
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://crmapi.conscor.com/api/general/mfind",
          {
            dbName: "internph",
            collectionName: "newsandblog",
            limit: 0,
          }
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          const postList = response.data.data.map((item) => {
            const data = item.sectionData?.NewsAndBlog || {};
            const title = data.NewsAndBlogTitle || "No Title";
            return {
              category: data.NewsAndBlogSelect || "Uncategorized",
              date: item.createdDate || "No date",
              title,
              image: data.NewsAndBlogImage || "https://placehold.co/400x300",
              link: `/newsandblog/${createSlug(title)}/${item._id || "unknown-id"}`,
            };
          });

          setPosts(postList);
        } else {
          setError("No valid blog posts found.");
        }
      } catch (error) {
        setError("Error fetching posts. Please try again later.");
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="px-4 md:px-12 py-4 bg-gray-50 md:bg-[#fafafa] min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] md:text-[#050748] mb-1 md:mb-2">
            News and Blog
          </h2>
          <p className="text-sm md:text-base text-gray-500 md:text-[#6A6A8E] mt-1 md:mb-2">
            Latest News, Expert Tips, and More...
          </p>
        </div>
        <Link
          to="/news-and-blog"
          className="text-blue-600 md:text-[#6A6A8E] text-sm md:text-base font-medium hover:underline"
        >
          View all
        </Link>
      </div>

      {loading && (
        <div className="relative">
          <button
            className="absolute left-[-12px] md:hidden top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-2 py-1 rounded-full z-10 shadow-md animate-pulse"
            disabled
            aria-label="Previous post"
          >
            &lt;
          </button>
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-200 snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {[...Array(2)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col shadow-sm min-h-[300px] w-[calc(100vw-2rem)] md:w-auto snap-center"
              >
                <div className="w-full h-40 md:h-96 bg-gray-200 animate-pulse rounded-xl mb-3 md:mb-4" />
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-full mb-2" />
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-3 md:mb-4" />
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <button
            className="absolute right-[-12px] md:hidden top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-2 py-1 rounded-full z-10 shadow-md animate-pulse"
            disabled
            aria-label="Next post"
          >
            &gt;
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 text-base md:text-lg">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center text-gray-600 text-base md:text-lg">
          No blog posts found.
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-[-12px] md:hidden top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-2 py-1 rounded-full z-10 shadow-md hover:bg-purple-600 active:bg-purple-700 touch-manipulation"
            aria-label="Previous post"
          >
            &lt;
          </button>
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {posts.slice(0, 2).map((post, index) => (
              <Link
                to={post.link}
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col shadow-sm md:hover:shadow-md md:transition-shadow md:duration-300 w-[calc(100vw-2rem)] md:w-auto snap-center active:bg-gray-100 touch-manipulation no-underline"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 md:h-96 object-cover rounded-xl mb-3 md:mb-4"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x300";
                    }}
                  />
                ) : (
                  <div className="w-full h-40 md:h-96 bg-gray-300 rounded-xl mb-3 md:mb-4 blur-sm" />
                )}
                <span className="bg-gray-100 md:bg-gray-200 text-gray-700 text-xs md:text-sm font-medium px-2 md:px-3 py-1 md:py-1 rounded-full self-start mb-2">
                  {post.category}
                </span>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 md:text-blue-900 line-clamp-2 mb-3 md:mb-4">
                  {post.title}
                </h3>
                {/* Removed Read More link to match second component */}
              </Link>
            ))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="absolute right-[-12px] md:hidden top-1/2 transform -translate-y-1/2 bg-[#5C4EBB] text-white px-2 py-1 rounded-full z-10 shadow-md hover:bg-purple-600 active:bg-purple-700 touch-manipulation"
            aria-label="Next post"
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
};

export default NewsAndBlog;