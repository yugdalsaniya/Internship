import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Navbar/logo.png";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 item">
          <div className="flex justify-center items-center ">
                      <img
                        src={logo}
                        alt="Internship-OJT Logo"
                        className="h-20 w-auto mr-2"
                      />
                    </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#050748] mb-6">
          Privacy Policy
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <p className="text-sm sm:text-base text-gray-700">
            INTURN PH ("we", "our", "us") is committed to protecting your personal
            data and privacy rights in compliance with the Data Privacy Act of 2012
            (Republic Act No. 10173). By using our platform and services, you agree
            to the terms of this Privacy Policy.
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              1. Information We Collect
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              We collect the following personal information upon your registration:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Full name</li>
              <li>Contact number and email</li>
              <li>School name and course</li>
              <li>Student number and graduation year</li>
              <li>Internship preferences</li>
              <li>Uploaded resume, transcript, and/or certifications</li>
              <li>IP address, system logs, and usage behavior</li>
            </ul>
            <p className="text-sm sm:text-base text-gray-700 mt-2">
              For companies, we may also collect:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Business name and TIN</li>
              <li>HR representative details</li>
              <li>Role postings and recruitment activity data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              2. Why We Collect Your Data
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              We use your personal information for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Matching students to internship or employment opportunities</li>
              <li>Managing your membership or subscription</li>
              <li>Coordinating with your school or employer (when necessary)</li>
              <li>Verifying identity for access to services</li>
              <li>Issuing certificates, internship agreements, and feedback</li>
              <li>Analytics and platform improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              3. Legal Basis for Processing
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              We collect and process your data based on:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Your consent</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate interest in delivering internship and employment matching services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              4. How We Protect Your Information
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              We store data on secure servers and apply technical and organizational measures:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>SSL encryption</li>
              <li>Role-based access controls</li>
              <li>Regular data audits</li>
              <li>Breach detection and response procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              5. Who Has Access to Your Data
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              Your data may be accessed by:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>INTURN PH staff and system administrators</li>
              <li>Authorized partner companies (for internship/job matching only)</li>
              <li>Your academic institution (upon mutual agreement)</li>
            </ul>
            <p className="text-sm sm:text-base text-gray-700 mt-2">
              We do not sell or rent your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              6. Your Rights as a Data Subject
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              Under the Data Privacy Act, you have the right to:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Access your data</li>
              <li>Correct or update your information</li>
              <li>Withdraw consent at any time</li>
              <li>Request data deletion</li>
              <li>File a complaint with the National Privacy Commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              7. Data Retention Policy
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              We retain your information for up to 2 years after your last activity
              or until you request deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#050748] mb-3">
              8. Contact Information
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              For any concerns or to exercise your rights, contact our Data
              Protection Officer at:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700">
              <li>Email: <a href="mailto:dpo@inturn.ph" className="text-[#3D7EFF] hover:underline">dpo@inturn.ph</a></li>
              <li>Phone: +63 [Insert Number]</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;