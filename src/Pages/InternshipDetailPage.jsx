import React from 'react';
import Hero from "../assets/Hero/banner.jpg"; // Adjust path based on your project structure

const InternshipDetailPage = () => {
  return (
    <div
      className="w-full h-[300px] bg-cover bg-center relative flex items-center justify-center text-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${Hero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-3">
          Internships Details
        </h1>
        <p className="text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
          "Empower Your Future: Unleash Limitless Career Possibilities!"
        </p>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
