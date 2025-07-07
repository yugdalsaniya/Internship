import React from "react";
import Hero from "../Components/home/Hero";
import bannerImage from "../assets/Hero/banner3.jpg";
import herobanner from "../assets/About us/banner.jpg";
import about1Img from "../assets/About us/about1.jpg";
import about2Img from "../assets/About us/about2.jpg";
import about3Img from "../assets/About us/about3.jpg";

import {
  FaUserAlt,
  FaFileAlt,
  FaBriefcase,
  FaCheckCircle,
  FaPlus,
  FaTimes,
  FaMedal,
  FaUserTie,
  FaBuilding,
  FaFileSignature,
} from "react-icons/fa";

export default function AboutUsPage() {
  return (
    <>
      {/* Hero Section */}
      <Hero
        title="About Us"
        subtitle="Our Story: Building a Future Where Ideas Thrive!"
        searchFields={[]}
        stats={[]}
        backgroundImage={bannerImage}
        gradient="linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))"
      />

      {/* Image 1 Section */}
      <div className="w-full  bg-white text-black px-4 sm:px-8 md:px-16 lg:px-24 space-y-20">
        <section className="pt-12">
          {/* Hero Banner */}
          <div className="rounded-xl overflow-hidden shadow-md w-full h-[300px] sm:h-[400px] bg-gray-300 mb-16">
            <img
              src={herobanner}
              alt="Hero Banner"
              className="w-full h-[300px] sm:h-[500px] md:h-[500px] lg:h-[900px] object-cover"
            />
          </div>
        </section>
      </div>

      {/* How It Works + FAQ + Best Section */}
      <div className="w-full  bg-white text-black px-4 sm:px-8 md:px-16 lg:px-24 space-y-20 pb-20">
        {/* How It Works */}
        <section className="pt-12 text-center">
          <h2 className="text-3xl font-bold mb-2">How it works</h2>
          <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto">
            Lorem Ipsum Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem
            IpsumLorem...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <FaUserAlt />, title: "Create Account" },
              { icon: <FaFileAlt />, title: "Upload Resume" },
              { icon: <FaBriefcase />, title: "Find Internships" },
              { icon: <FaCheckCircle />, title: "Apply Internship" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl py-10 px-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#6A6A8E] text-xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 text-center mb-10">
            Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
          </p>
          <div className="space-y-4">
            {/* Opened FAQ Item */}
            <div className="flex gap-4 bg-[#F2F1FC] p-5 rounded-xl items-start">
              <span className="text-[#2E2E8F] font-bold text-lg">01</span>
              <div className="flex-1">
                <h4 className="text-[#0C0C0C] font-bold text-sm mb-1">
                  Can I upload a CV?
                </h4>
                <p className="text-xs text-[#444444] leading-relaxed">
                  Nunc sed a nisl purus. Nibh dis faucibus proin lacus
                  tristique. Sit congue non vitae odio sit erat in. Felis eu
                  ultrices a sed massa. Commodo fringilla sed tempor risus
                  laoreet ultricies Ipsum. Habbitasse morbi faucibus in iaculis
                  lectus. Nisi enim feugiat enim volutpat. Sem quis viverra
                  viverra odio mauris nunc
                </p>
              </div>
              <button className="w-6 h-6 flex items-center justify-center bg-[#0C0C0C] text-white rounded-full mt-1">
                <FaTimes size={10} />
              </button>
            </div>

            {/* Closed FAQ Items */}
            {[
              "How long will the recruitment process take?",
              "Do you recruit for Graduates, Apprentices and Students?",
              "What does the recruitment and selection process involve?",
              "Can I receive notifications for any future Internships that may interest me?",
            ].map((q, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b"
              >
                <span className="text-[#2E2E8F] font-bold text-sm">
                  0{i + 2}
                </span>
                <span className="flex-1 ml-4 text-[#0C0C0C] font-semibold text-sm">
                  {q}
                </span>
                <FaPlus className="text-[#2E2E8F] text-sm cursor-pointer" />
              </div>
            ))}
          </div>
        </section>

        {/* Best Companies Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Images */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {/* Tall Image on the left */}
            <div className="row-span-2 h-[300px] rounded-xl overflow-hidden">
              <img
                src={about1Img}
                alt="About 1"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Top right image */}
            <div className="h-[140px] rounded-xl overflow-hidden">
              <img
                src={about2Img}
                alt="About 2"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Bottom right image */}
            <div className="h-[140px] rounded-xl overflow-hidden">
              <img
                src={about3Img}
                alt="About 3"
                className="w-full max-h-52 object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl font-bold leading-snug">
              We’re Only Working <br />
              With The Best
            </h2>
            <p className="text-sm text-gray-600 mt-3 mb-6">
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: <FaBriefcase />, label: "Quality Internship" },
                { icon: <FaFileSignature />, label: "Resume builder" },
                { icon: <FaBuilding />, label: "Top Companies" },
                { icon: <FaUserTie />, label: "Top Talents" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#6A6A8E] text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
