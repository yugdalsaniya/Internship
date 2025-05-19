import React from 'react';
import { GiPlantRoots, GiChart, GiShoppingBag, GiPencilBrush, GiGraduateCap } from 'react-icons/gi';
import { FaHardHat } from 'react-icons/fa';

const Category = () => {
  const categories = [
    { name: 'FRESHER INTERNSHIPS', count: 1254, icon: <GiPlantRoots className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'MARKETING INTERNSHIPS', count: 816, icon: <GiChart className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'FINANCE INTERNSHIPS', count: 2082, icon: <GiShoppingBag className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'HR INTERNSHIPS', count: 1520, icon: <FaHardHat className="text-[#050748] h-10 w-10 mb-6" /> },
    // Adding back the 4 removed items (2 instances each of GRAPHIC DESIGNER and WEB DESIGNER)
    { name: 'GRAPHIC DESIGNER', count: 1022, icon: <GiPencilBrush className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'GRAPHIC DESIGNER', count: 1022, icon: <GiPencilBrush className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'WEB DESIGNER', count: 1496, icon: <GiGraduateCap className="text-[#050748] h-10 w-10 mb-6" /> },
    { name: 'WEB DESIGNER', count: 1496, icon: <GiGraduateCap className="text-[#050748] h-10 w-10 mb-6" /> },
  ];

  return (
    <section className="bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] py-12">
      <div className="px-4 sm:px-12">
        {/* Heading */}
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-[#050748] mb-4">
          Browse by Category
        </h2>
        <p className="text-center text-[#6A6A8E] text-lg sm:text-xl mb-10">
          Explore options by category.
        </p>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  console.log(`Navigating to ${category.name}`);
                }
              }}
            >
              {category.icon}
              <h3 className="text-[#050748] font-semibold text-xl sm:text-2xl mb-6 text-center">
                {category.name}
              </h3>
              <span className="bg-gray-100 text-gray-700 text-sm sm:text-base font-medium px-5 py-2 rounded-full">
                {category.count} Internships
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;