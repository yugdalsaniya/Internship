import React, { useState } from "react";
import Hero from "../Components/home/Hero";
import bannerImage from "../assets/Hero/banner3.jpg";
import about1Img from "../assets/About us/about1.jpg";
import about2Img from "../assets/About us/about2.jpg";
import about3Img from "../assets/About us/about3.jpg";
import {
  FaUserAlt,
  FaFileAlt,
  FaBriefcase,
  FaCheckCircle,
  FaPlus,
  FaMinus,
  FaMedal,
  FaUserTie,
  FaBuilding,
  FaFileSignature,
} from "react-icons/fa";

export default function AboutUsPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "Can I upload a CV?",
      a: "You can easily upload your CV during account setup or in the profile section. This allows companies, recruiters, and mentors to view your skills and experience, increasing your chances of landing internships, OJT, or jobs. Ensure your CV is up-to-date and in PDF format for best results.",
    },
    {
      q: "How long will the recruitment process take?",
      a: "The recruitment process timeline depends on the employer, but typically ranges from a few days to a couple of weeks. Notifications will be sent through the platform.",
    },
    {
      q: "Do you recruit for Graduates, Apprentices and Students?",
      a: "Yes, we cater to students, apprentices, and fresh graduates, providing opportunities across multiple industries.",
    },
    {
      q: "What does the recruitment and selection process involve?",
      a: "The process usually involves CV screening, an interview, and skills assessment depending on the employer’s requirements.",
    },
    {
      q: "Can I receive notifications for any future Internships that may interest me?",
      a: "Yes, you can subscribe to notifications and receive alerts when internships matching your profile are posted.",
    },
  ];

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

      {/* About Text Section */}
      <div className="w-full bg-white text-black px-4 sm:px-8 md:px-16 lg:px-24 py-20">
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            InTURNshp Platform
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            inTURNshp is a modern EdTech-HRTech platform that connects students
            and fresh graduates to internships and job opportunities through
            verified employer partnerships. We believe inTURNshp is a timely and
            impactful solution to a deeply rooted workforce challenge in the
            Philippines. Our platform bridges the gap between students, schools,
            and employers by offering an end-to-end internship and early career
            matching ecosystem that promotes access, equity, and readiness.
            <br />
            <br />
            What sets us apart is our commitment to empowering Filipino youth /
            students, especially from public institutions (SUCs), through a
            platform that not only facilitates internship placements but also
            integrates mentorship, employer engagement, and AI-powered
            recruitment tools. In a landscape where unpaid internships and
            skills mismatches are common, inTURNshp provides a structured,
            inclusive, and sustainable pathway from classroom to career.
          </p>
        </section>
      </div>

      {/* How It Works + FAQ + Best Section */}
      <div className="w-full bg-white text-black px-4 sm:px-8 md:px-16 lg:px-24 space-y-20 pb-20">
        {/* How It Works */}
        <section className="pt-12 text-center">
          <h2 className="text-3xl font-bold mb-2">How it works</h2>
          <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto">
            Discover internships, connect with employers, and launch your
            career!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <FaUserAlt />,
                title: "Create Account",
                discription: "Get Started with Inturnshp for Career Success",
              },
              {
                icon: <FaFileAlt />,
                title: "Upload Resume",
                discription: "Upload Your Resume and Showcase Your Skills",
              },
              {
                icon: <FaBriefcase />,
                title: "Find Internships",
                discription: "Unlock Internship Opportunities with Inturnshp",
              },
              {
                icon: <FaCheckCircle />,
                title: "Apply Internship",
                discription: "Start Your Career with an Internship Application",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl py-10 px-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#6A6A8E] text-xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.discription}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 text-center mb-10">
            Learn More with Our Frequently Asked Questions
          </p>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl transition-all duration-300 ${
                  activeIndex === index
                    ? "bg-[#F2F1FC] shadow-md"
                    : "border-b"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[#2E2E8F] font-bold text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[#0C0C0C] font-semibold text-sm">
                      {item.q}
                    </span>
                  </div>
                  {activeIndex === index ? (
                    <FaMinus className="text-[#2E2E8F]" />
                  ) : (
                    <FaPlus className="text-[#2E2E8F]" />
                  )}
                </button>

                {activeIndex === index && (
                  <div className="mt-3 text-xs text-[#444444] leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Best Companies Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Images */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <div className="row-span-2 h-[300px] rounded-xl overflow-hidden">
              <img
                src={about1Img}
                alt="About 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-[140px] rounded-xl overflow-hidden">
              <img
                src={about2Img}
                alt="About 2"
                className="w-full h-auto object-cover"
              />
            </div>
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
              Connecting you to industry-leading mentors and companies.
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
