import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO
import Hero from "../Components/home/Hero";
import FeaturedCompany from "../Components/home/FeaturedCompany";
import RecentInternships from "../Components/home/RecentInternships";
import Category from "../Components/home/Category";
import FeaturedInterns from "../Components/home/FeaturedInterns";
import TopEmployers from "../Components/home/TopEmployers";
import AcademyPartners from "../Components/home/AcademyPartners";
import NewsAndBlog from "../Components/home/NewsAndBlog";
import Slider from "../Components/home/Slider.jsx"
import PeopleUsingInternship from "../Components/home/PeopleUsingInternship";

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



<Helmet>
        <title>Internship & OJT Platform Philippines</title>
        <meta property="og:title" content="Internship & OJT Platform Philippines - Find Your Dream Internship" />
        <meta property="og:image" content="https://crmapi.conscor.com/uploads/app8657281202648/newsandblog/file-1751288717156-733529112.png" />
        <meta property="og:description" content="Discover internships and OJT opportunities in the Philippines. Connect with top companies and academies to kickstart your career!" />
        <meta property="og:url" content="https://inturnshp.com/ph/" />
        <meta property="og:type" content="website" />
      </Helmet>



      {/* Existing Components - No location UI */}
      <Hero />
      <FeaturedCompany />
      <RecentInternships />
      <Category />
      <PeopleUsingInternship/>
      {/* <FeaturedInterns /> */}
      <TopEmployers />
      {/* <Slider /> */}
      <AcademyPartners />
      <NewsAndBlog />
    </>
  );
}