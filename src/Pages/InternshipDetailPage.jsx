import React from 'react';
import bgImage from "../assets/Hero/banner.jpg"; // Adjust path based on your project structure

const InternshipDetailPage = () => {
  return (
    <div
      className="w-full h-[300px] bg-cover bg-center relative flex items-center justify-center text-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-white to-teal-200 opacity-80"></div>

      <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-3">
         <b>Internships Details</b>
        </h1>
        <p className="text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
          "Empower Your Future: Unleash Limitless Career Possibilities!"
        </p>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
    