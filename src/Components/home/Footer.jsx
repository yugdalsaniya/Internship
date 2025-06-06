import React from 'react';
import logo from '../../assets/Navbar/logo.png'; // Adjust the path as necessary

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-8 px-12">
      <div className="flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ml-4 mr-4">
          {/* Column 1: Logo and Description */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src={logo} // Replace with your logo path
                alt="Internship-OJT Logo"
                className="h-8 w-8 mr-2"
              />
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-800 underline">
                  INTERNSHIP-OJT
                </h2>
                <p className="text-xs text-blue-600 uppercase mx-1">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
            <p className="text-sm mb-2">
              Discover top internships in the Philippines.
            </p>
            <p className="text-sm mb-2">
              Designed to ignite your career spark.
            </p>
            <p className="text-sm mb-2">
              OJT programs pave the way to success,
            </p>
            <p className="text-sm">
              Launch your future with the best.
            </p>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="text-lg font-semibold mb-4">Internship Categories</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm mb-4">
              Stay Updated. Subscribe for the Latest News & Insights.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Email Address"
                className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-gray-600 text-white rounded-md py-2 px-4 text-sm hover:bg-blue-700">
                Subscribe now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex justify-end space-x-4 text-sm px-4">
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