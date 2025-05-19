import React from 'react'
import Navbar from '../Components/home/Navbar'
import { Outlet } from 'react-router-dom';
import Footer from '../Components/home/Footer';


export default function MainLayout() {
  return (
    <>
      
<Navbar />
     <main>
        <Outlet />
     </main>
    <Footer />


    </>
  )
}
