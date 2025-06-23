import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const NewsAndBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to create a slug from the title
  const createSlug = (title) => {
    if (!title) return "untitled";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
            const data = item.sectionData.NewsAndBlog;
            const title = data.NewsAndBlogTitle || "No Title";
            return {
              category: data.NewsAndBlogSelect || "Uncategorized",
              date: item.createdDate || "No date",
              title,
              image: data.NewsAndBlogImage || "",
              link: `/newsandblog/${createSlug(title)}/${item._id}`, // Link with _id and slug
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
    <section className="py-4">
      <div className="px-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-4">
              News and Blog
            </h2>
            <p className="text-[#6A6A8E] mb-4">
              Latest News, Expert Tips, and More.
            </p>
          </div>
          <Link
            to="/news-and-blog"
            className="text-[#6A6A8E] font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl p-6 flex flex-col shadow-sm min-h-[300px]"
              >
                <div className="w-full h-48 bg-gray-200 animate-pulse rounded-xl mb-4" />
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-full mb-2" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center text-gray-600">No blog posts found.</div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 rounded-xl mb-4 blur-sm"></div>
                )}
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full self-start mb-2">
                  {post.category}
                </span>
                <p className="text-gray-600 text-sm mb-2">{post.date}</p>
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  {post.title}
                </h3>
                <Link
                  to={post.link}
                  className="text-blue-600 font-medium flex items-center space-x-1 hover:underline self-start"
                >
                  <span>Read more</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsAndBlog;