import React from "react";
import people1 from "../../assets/PeopleUsingInturnshp/people1.png";
import people2 from "../../assets/PeopleUsingInturnshp/people2.png";
const PeopleUsingInternship = ({ title, subtitle, tabs, sections }) => {
  return (
    <section className="py-4 ">
      <div className="px-12">
        <div className=" ">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#050748]">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            <div className="flex space-x-2">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 text-[#ffffff] py-2 rounded-full"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-bl-3xl rounded-tr-3xl  border-2 border-purple-200 flex-1"
              >
                <div className="flex justify-between mb-4 mt-4 items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {section.title}
                    </h3>
                    <p className="text-gray-600">{section.description}</p>
                    <ul className="list-disc list-inside text-gray-600 mt-6 space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-28 h-28 rounded-full shadow-lg"
                    />
                    <button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Example usage
const App = () => {
  const data = {
    title: "People Using Internshp",
    subtitle: "Powering early careers.",
    tabs: ["Industry", "Academy"],
    sections: [
      {
        title: "Students and Professionals",
        description: "Launch your career with confidence.",
        items: [
          "Find internships, OJT, and entry-level jobs",
          "Apply directly with a smart internshp profile",
          "Learn with free workshops and short courses",
          "Get career-ready through real-world experiences",
        ],
        image: people1,
      },
      {
        title: "Companies and Recruiters",
        description: "Build your employer brand on campus.",
        items: [
          "Post internships and job openings",
          "Search from a pool of pre-screened candidates",
          "Build your employer brand on campus",
          "Manage hiring with simple, effective tools",
        ],
        image: people2,
      },
    ],
  };

  return <PeopleUsingInternship {...data} />;
};

export default App;