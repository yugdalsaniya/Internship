import React from 'react';

const NewsAndBlog = () => {
  const posts = [
    {
      category: 'News',
      date: '30 March 2025',
      title: 'Revitalizing Workplace Morale: Innovative Tactics For Boosting Employee Engagement In 2024',
      link: '#',
    },
    {
      category: 'Blog',
      date: '30 March 2025',
      title: 'How To Avoid The Top Six Most Common Interview Mistakes',
      link: '#',
    },
  ];

  return (
    <section className="py-10">
      <div className="px-12">
        {/* Heading and View All Link */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-2">News and Blog</h2>
            <p className="text-[#6A6A8E]">Latest News, Expert Tips, and More.</p>
          </div>
          <a href="#" className="text-[#6A6A8E] font-medium hover:underline">
            View all
          </a>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Image Placeholder */}
              <div className="w-full h-48 bg-gray-300 rounded-xl mb-4 blur-sm"></div>
              <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full self-start mb-2">
                {post.category}
              </span>
              <p className="text-gray-600 text-sm mb-2">{post.date}</p>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">{post.title}</h3>
              <a
                href={post.link}
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
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsAndBlog;