import React, { useState, useEffect } from "react";
import Hero from "../Components/home/Hero";
import FeaturedCompany from "../Components/home/FeaturedCompany";
import RecentInternships from "../Components/home/RecentInternships";
import Category from "../Components/home/Category";
import FeaturedInterns from "../Components/home/FeaturedInterns";
import TopEmployers from "../Components/home/TopEmployers";
import AcademyPartners from "../Components/home/AcademyPartners";
import NewsAndBlog from "../Components/home/NewsAndBlog";
import Slider from "../Components/home/Slider.jsx"

export default function HomePage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-request location on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError(null);
        },
        (err) => {
          setError("Permission denied or location unavailable.");
          setLocation(null);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []); // Empty dependency array ensures it runs once on mount

  // You can use the location data here for further processing (e.g., fetching internships)
  // For now, it's stored in the state but not displayed in the UI

  return (
    <>
      {/* Existing Components - No location UI */}
      <Hero />
      <FeaturedCompany />
      <RecentInternships />
      <Category />
      {/* <FeaturedInterns /> */}
      <TopEmployers />
      <Slider />
      <AcademyPartners />
      <NewsAndBlog />
    </>
  );
}