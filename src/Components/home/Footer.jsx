import React from 'react';
import logo from '../../assets/Navbar/logo.png'; // Adjust the path as necessary

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-4 px-4 sm:px-12">
      <div className="flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 ml-2 sm:ml-4 mr-2 sm:mr-4">
          {/* Column 1: Logo and Description */}
          <div className="flex flex-col justify-start">
            <div className="flex items-center mb-3">
              <img
                src={logo}
                alt="Internship-OJT Logo"
                className="h-16 w-auto mr-2"
              />
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <p>Discover top internships in the Philippines.</p>
              <p>Designed to ignite your career spark.</p>
              <p>OJT programs pave the way to success,</p>
              <p>Launch your future with the best.</p>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Internship Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Internship Categories</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Fresher Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Marketing Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Finance Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  HR Internships
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Graphic Designer
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Newsletter</h3>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4">
              Stay Updated. Subscribe for the Latest News & Insights.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Email Address"
                className="border border-gray-300 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-gray-600 text-white rounded-md py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm hover:bg-blue-700">
                Subscribe now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-6 sm:mt-8 flex justify-end space-x-3 sm:space-x-4 text-xs sm:text-sm px-2 sm:px-4">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;