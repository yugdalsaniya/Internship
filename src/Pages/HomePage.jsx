import React from 'react'
import Hero from '../Components/home/Hero'
import FeaturedCompany from '../Components/home/FeaturedCompany'
import RecentInternships from '../Components/home/RecentInternships'
import Category from '../Components/home/Category'
import FeaturedInterns from '../Components/home/FeaturedInterns'
import TopEmployers from '../Components/home/TopEmployers'
import AcademyPartners from '../Components/home/AcademyPartners'
import NewsAndBlog from '../Components/home/NewsAndBlog'

export default function HomePage() {
  return (
   <>
   <Hero />
   <FeaturedCompany />
   <RecentInternships />
   <Category />
   {/* <FeaturedInterns /> */}
   <TopEmployers />
   <AcademyPartners />
   <NewsAndBlog />
   </>
  )
}
