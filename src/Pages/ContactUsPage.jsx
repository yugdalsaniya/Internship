import React, { useState, useEffect, useRef } from "react";
import Hero from "../Components/home/Hero";
import bannerImage from "../assets/Hero/banner4.png";
import { FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactUsPage() {
  const [mapCenter, setMapCenter] = useState(null);
  const [address, setAddress] = useState("iSquare Building, 15 Meralco Ave, Ortigas Center, Pasig, 1600 Metro Manila, Philippines");
  const mapRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCu9YGSvrE22iUL4Xhe3ISk-B0r8FTW9jI"; // Replace with your actual API key or use env variable

  // Load Google Maps script and geocode the address
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    const geocodeAddress = (address) => {
      if (!window.google || !window.google.maps) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error("Geocode failed: ", status);
        }
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        geocodeAddress(address);
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
      });
  }, [address]);

  // Initialize the map when mapCenter changes
  useEffect(() => {
    if (mapCenter && mapRef.current && window.google && window.google.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
        mapTypeId: "roadmap",
      });
      new window.google.maps.Marker({
        position: mapCenter,
        map,
        title: "Office Location",
      });
    }
  }, [mapCenter]);

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
            Reach out to unlock your potential with expert guidance.
          </p>

          {/* Contact Grid */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-6 text-sm">
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaPhoneAlt size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Call for inquiry</p>
                <p className="text-[#6A6A8E]">+63 906 568 7199</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="pt-1 text-[#6A6A8E]">
                <FaEnvelope size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0B0B0B]">Send us email</p>
                <p className="text-[#6A6A8E]">contact@upraisit.com</p>
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
                <p className="text-[#6A6A8E]">{address}</p>
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

      {/* Dynamic Map */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto rounded-xl overflow-hidden shadow">
          <div
            ref={mapRef}
            style={{ width: "100%", height: "350px" }}
            className="rounded-xl"
          ></div>
        </div>
      </section>
    </div>
  );
}