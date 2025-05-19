import React from 'react';
import img1 from '../../assets/Company/img1.png';
import img2 from '../../assets/Company/img2.png';
import img3 from '../../assets/Company/img3.png';
import img4 from '../../assets/Company/img4.png';
import img5 from '../../assets/Company/img5.png';

const FeaturedCompany = () => {
  return (
    <div className="flex flex-wrap justify-center items-center mx-6 py-10 bg-white space-x-4 sm:space-x-24">
      <img
        src={img1}
        alt="PLDT Logo"
        className="h-6 sm:h-8 md:h-10"
      />
      <img
        src={img2}
        alt="Universal Robina Logo"
        className="h-6 sm:h-8 md:h-10"
      />
      <img
        src={img3}
        alt="Globe Logo"
        className="h-6 sm:h-8 md:h-10"
      />
      <img
        src={img4}
        alt="Aboitiz Logo"
        className="h-6 sm:h-8 md:h-10"
      />
      <img
        src={img5}
        alt="Ayala Land Logo"
        className="h-6 sm:h-8 md:h-10"
      />
    </div>
  );
};

export default FeaturedCompany;