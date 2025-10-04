import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/home/Navbar";
import Footer from "../Components/home/Footer";

export default function MainLayout() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/editprofile");

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}