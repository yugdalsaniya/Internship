import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const SingleBlogPage = () => {
  const { id } = useParams(); // Get blog post _id from URL
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await axios.post(
          "https://crmapi.conscor.com/api/general/mfind",
          {
            dbName: "internph",
            collectionName: "newsandblog",
            query: { _id: id },
            limit: 1,
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          const postData = response.data.data[0];
          const newsAndBlog = postData.sectionData?.NewsAndBlog || {};

          // Construct content from section fields
          const content = `
            ${newsAndBlog.NewsAndBlogDescription ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.NewsAndBlogDescription}</p>` : ""}
            
            ${newsAndBlog.Section1Title ? `<h2 class="text-2xl font-semibold text-[#050748] mt-8 mb-4">${newsAndBlog.Section1Title}</h2>` : ""}
            ${newsAndBlog.Section1Description ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section1Description}</p>` : ""}
            ${
              newsAndBlog.Section1Details && Array.isArray(newsAndBlog.Section1Details)
                ? `<ul class="list-disc pl-6 mb-6 text-gray-700">
                    ${newsAndBlog.Section1Details.map(
                      (item) => `
                        <li><strong>${item.Section1DetailsTitle || "Untitled"}:</strong> ${item.Section1DetailsDescription || ""}</li>
                      `
                    ).join("")}
                  </ul>`
                : ""
            }
            ${newsAndBlog.Section1SubDescription ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section1SubDescription}</p>` : ""}
            
            ${newsAndBlog.Section2Title ? `<h2 class="text-2xl font-semibold text-[#050748] mt-8 mb-4">${newsAndBlog.Section2Title}</h2>` : ""}
            ${newsAndBlog.Section2Description ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section2Description}</p>` : ""}
            ${
              newsAndBlog.Section2Details && Array.isArray(newsAndBlog.Section2Details)
                ? `<ul class="list-disc pl-6 mb-6 text-gray-700">
                    ${newsAndBlog.Section2Details.map(
                      (item) => `
                        <li><strong>${item.Section2DetailsTitle || "Untitled"}:</strong> ${item.Section2DetailsDescription || ""}</li>
                      `
                    ).join("")}
                  </ul>`
                : ""
            }
            ${newsAndBlog.Section2SubDescription ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section2SubDescription}</p>` : ""}
            
            ${newsAndBlog.Section3Title ? `<h2 class="text-2xl font-semibold text-[#050748] mt-8 mb-4">${newsAndBlog.Section3Title}</h2>` : ""}
            ${newsAndBlog.Section3Description ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section3Description}</p>` : ""}
            ${
              newsAndBlog.Section3Details && Array.isArray(newsAndBlog.Section3Details)
                ? `<ul class="list-disc pl-6 mb-6 text-gray-700">
                    ${newsAndBlog.Section3Details.map(
                      (item) => `
                        <li><strong>${item.Section3DetailsTitle || "Untitled"}:</strong> ${item.Section3DetailsDescription || ""}</li>
                      `
                    ).join("")}
                  </ul>`
                : ""
            }
            ${newsAndBlog.Section3SubDescription ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.Section3SubDescription}</p>` : ""}
            
            ${newsAndBlog.ConclusionTitle ? `<h2 class="text-2xl font-semibold text-[#050748] mt-8 mb-4">${newsAndBlog.ConclusionTitle}</h2>` : ""}
            ${newsAndBlog.ConclusionDescription ? `<p class="text-gray-700 leading-relaxed">${newsAndBlog.ConclusionDescription}</p>` : ""}
          `;

          setBlogPost({
            title: newsAndBlog.NewsAndBlogTitle || "",
            category: newsAndBlog.NewsAndBlogSelect || "",
            date: postData.createdDate || "",
            author: postData.createdBy ? `Author ID: ${postData.createdBy}` : "",
            image: newsAndBlog.NewsAndBlogImage || "",
            content: content.trim() || "<p>No content available.</p>", // Fallback if all sections are empty
            facebook: newsAndBlog.Facebook || "",
            twitter: newsAndBlog.Twitter || "",
            linkedin: newsAndBlog.linkedin || "", // Corrected field name
          });
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        setError("Error fetching blog post. Please try again later.");
        console.error("Error fetching blog post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  // Share functionality
  const sharePost = (platform) => {
    if (!blogPost) return;
    const url = window.location.href;
    const text = `Check out this blog post: ${blogPost.title || "Untitled"}`;
    const shareUrl =
      platform === "facebook" && blogPost.facebook
        ? blogPost.facebook
        : platform === "twitter" && blogPost.twitter
        ? blogPost.twitter
        : platform === "linkedin" && blogPost.linkedin
        ? blogPost.linkedin
        : null;

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    } else {
      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank"
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(blogPost.title || "Untitled")}`,
            "_blank"
          );
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-4 sm:px-12 max-w-5xl mx-auto text-center">
          <div className="w-full h-12 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-2xl mb-12"></div>
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-4 sm:px-12 max-w-5xl mx-auto text-center text-red-600">
          {error}
        </div>
      </section>
    );
  }

  if (!blogPost) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="px-4 sm:px-12 max-w-5xl mx-auto text-center text-gray-600">
          No blog post found.
        </div>
      </section>
    );
  }

  // Check if any social media links exist
  const hasSocialLinks =
    blogPost.facebook || blogPost.twitter || blogPost.linkedin;

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 sm:px-12 max-w-5xl mx-auto">
        {/* Blog Header */}
        <div className="mb-12 text-center animate-fade-in">
          {blogPost.category && (
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm transition-transform hover:scale-105">
              {blogPost.category}
            </span>
          )}
          {blogPost.title && (
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#050748] mb-3 leading-tight">
              {blogPost.title}
            </h1>
          )}
          {(blogPost.author || blogPost.date) && (
            <p className="text-gray-600 text-base font-medium">
              {blogPost.author && `By ${blogPost.author}`}
              {blogPost.author && blogPost.date && " | "}
              {blogPost.date}
            </p>
          )}
        </div>

        {/* Blog Image */}
        {blogPost.image && (
          <div className="relative mb-12 overflow-hidden rounded-2xl shadow-lg animate-slide-up">
            <img
              src={blogPost.image}
              alt={blogPost.title || "Blog image"}
              className="w-full h-auto max-h-[500px] object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Blog Content */}
        <div
          className="prose prose-sm sm:prose-lg max-w-none text-gray-800 bg-white p-8 rounded-2xl shadow-md mb-12 animate-fade-in"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Social Sharing (only show if at least one link exists) */}
        {hasSocialLinks && (
          <div className="flex items-center justify-center gap-6 mb-12 animate-slide-up">
            {blogPost.facebook && (
              <button
                onClick={() => sharePost("facebook")}
                className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-transform duration-200"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={28} />
              </button>
            )}
            {blogPost.twitter && (
              <button
                onClick={() => sharePost("twitter")}
                className="text-blue-400 hover:text-blue-600 transform hover:scale-110 transition-transform duration-200"
                aria-label="Share on Twitter"
              >
                <FaTwitter size={28} />
              </button>
            )}
            {blogPost.linkedin && (
              <button
                onClick={() => sharePost("linkedin")}
                className="text-blue-700 hover:text-blue-900 transform hover:scale-110 transition-transform duration-200"
                aria-label="Share on LinkedIn"
              >
                <FaLinkedin size={28} />
              </button>
            )}
          </div>
        )}

        {/* Back to Blog List Link */}
        <div className="text-center animate-slide-up">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-800 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 transform rotate-180"
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
            <span>Back to News & Blog</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SingleBlogPage;