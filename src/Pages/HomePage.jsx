import React from "react";
import Hero from "../Components/home/Hero";
import FeaturedCompany from "../Components/home/FeaturedCompany";
import RecentInternships from "../Components/home/RecentInternships";
import Category from "../Components/home/Category";
import FeaturedInterns from "../Components/home/FeaturedInterns";
import TopEmployers from "../Components/home/TopEmployers";
import AcademyPartners from "../Components/home/AcademyPartners";
import NewsAndBlog from "../Components/home/NewsAndBlog";
import Slider from "../Components/home/Slider.jsx";
import PeopleUsingInternship from "../Components/home/PeopleUsingInternship";
import bannerImage from "../assets/Hero/banner.jpg";
import TopMentors from "../Components/home/TopMentors.jsx";

export default function HomePage() {
  // THIS IS FOR AUTO-REQUESTING LOCATION ON PAGE LOAD

  // const [location, setLocation] = useState(null);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   Auto-request location on page load
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setLocation({ latitude, longitude });
  //         setError(null);
  //       },
  //       (err) => {
  //         setError("Permission denied or location unavailable.");
  //         setLocation(null);
  //       }
  //     );
  //   } else {
  //     setError("Geolocation is not supported by this browser.");
  //   }
  // }, []); // Empty dependency array ensures it runs once on mount

  // You can use the location data here for further processing (e.g., fetching internships)
  // For now, it's stored in the state but not displayed in the UI

  return (
    <>
      <Hero backgroundImage={bannerImage} />
      <FeaturedCompany />
      <RecentInternships />
      <Category />
      <FeaturedInterns />
      <PeopleUsingInternship />
      <TopEmployers />
      {/* <Slider /> */}
      <AcademyPartners />
      <TopMentors />
      <NewsAndBlog />
    </>
  );
}
