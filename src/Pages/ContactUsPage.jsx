import React from "react";
import Hero from "../Components/home/Hero";
import bannerImage from "../assets/Hero/banner4.png";
import { FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function InternshipPage() {
  return (
    <div className="bg-white text-[#0B0B0B]">
      {/* Hero Section */}
      <Hero
        title="Contact Us"
        subtitle="Reach Out Anytime: Let’s Turn Your Vision into Reality!"
        searchFields={[]}
        stats={[]}
        backgroundImage={bannerImage}
        gradient="linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8))"
      />

      {/* Contact Info + Form */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Info */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">
            You Will Grow, You Will<br />
            Succeed. We Promise That
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md">
            Pellentesque arcu facilisis nunc mi proin. Dignissim mattis in lectus tincidunt tincidunt
            ultrices. Diam convallis morbi pellentesque adipiscing
          </p>

          {/* Contact Grid */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-6 text-sm">
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaPhoneAlt size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Call for inquiry</p>
                <p className="text-[#6A6A8E]">+91 9876543210</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaEnvelope size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Send us email</p>
                <p className="text-[#6A6A8E]">hana4intern@gmail.com</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaClock size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Opening hours</p>
                <p className="text-[#6A6A8E]">Mon – Fri: 10AM – 10PM</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaMapMarkerAlt size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Office</p>
                <p className="text-[#6A6A8E]">Work24 Near, Gulbai tekra BRTS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-gradient-to-b from-[#fff0f5] via-[#fdf5f5] to-white rounded-xl shadow p-6 w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Contact Info</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Your last name"
                  className="w-full border rounded-md px-4 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Your E-mail address"
                className="w-full border rounded-md px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Message</label>
              <textarea
                rows="4"
                placeholder="Your message..."
                className="w-full border rounded-md px-4 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5F6FFF] to-[#4D38E8] text-white py-2 rounded-md font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Embedded Map: Work24, Gulbai Tekra BRTS */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto rounded-xl overflow-hidden shadow">
          <iframe
            title="Work24 Gulbai Tekra Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.076826390422!2d72.54853157548116!3d23.020457679167142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f4bde53d13%3A0xe2b1a3d60d54759d!2sWork24%20-%20Coworking%20Space%20%26%20Offices!5e0!3m2!1sen!2sin!4v1717088324366!5m2!1sen!2sin"
            width="100%"
            height="350"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
