import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../../assets/slider/slider1.jpg';
import img2 from '../../assets/slider/slider2.jpg';    
import img3 from '../../assets/slider/slider3.jpg';   
import img4 from '../../assets/slider/slider4.jpg';

const Slider = () => {
  const images = [
    img1,
    img2,   img3,
    img4,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleImages = 2;
  const cardWidth = 650; // Width of each card

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - visibleImages < 0 ? images.length - visibleImages : prev - visibleImages));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + visibleImages >= images.length ? 0 : prev + visibleImages));
  };

  return (
    <section className="py-4">
      <div className="px-12">
        {/* Title section matching TopEmployers */}
        <div className="flex justify-between items-center mb-4">
        
        </div>

        {/* Slider section */}
        <div className="relative w-full">
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-3 bg-purple-500 text-white rounded-full hover:bg-purple-700 z-10"
            aria-label="Previous images"
          >
            ←
          </button>
          
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (cardWidth + 32)}px)`, // 32px accounts for gap
                width: `${images.length * (cardWidth + 32)}px` // Total width of all cards with gaps
              }}
            >
              {images.map((src, index) => (
                <div
                  key={index}
                  className="min-w-[650px] h-[300px] bg-cover bg-center rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300 flex items-center justify-center mr-8" // mr-8 for gap between cards
                  style={{ backgroundImage: `url(${src})` }}
                ></div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-purple-500 text-white rounded-full hover:bg-purple-700 z-10"
            aria-label="Next images"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Slider;