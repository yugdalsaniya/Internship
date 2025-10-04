import React from "react";

const MOAAgreement = ({ moaData, onPrint }) => {
  return (
    <div className="bg-white p-6 sm:p-10">
      <div className="text-center mb-6">
        <img 
          src="https://i.ibb.co/3yvc4G9L/inturnshp.jpg" 
          alt="Inturnshp Logo" 
          className="mx-auto h-16 mb-4"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/160x50?text=Inturnshp";
          }}
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
        MEMORANDUM OF AGREEMENT (MOA)
      </h1>
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-gray-700">
        Between
      </h2>
      <p className="text-center text-lg font-medium">{moaData.companyName}</p>
      <p className="text-center text-lg font-medium mb-6">and</p>
      <p className="text-center text-lg font-medium">{moaData.schoolName}</p>

      <section className="mt-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          I. PARTIES
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          This Memorandum of Agreement (MOA) is entered into by and between:
        </p>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          <strong className="font-bold">{moaData.companyName}</strong>, a duly registered company with office address
          at <strong className="font-bold">{moaData.companyAddress}</strong>, represented herein by{" "}
          <strong className="font-bold">{moaData.companyRep}</strong>, {moaData.companyRepPosition}, hereinafter
          referred to as the 'Company',
        </p>
        <p className="text-center my-2 text-sm sm:text-base text-gray-600">
          {" "}
          - and -{" "}
        </p>
        <p className="text-sm sm:text-base text-gray-600">
          <strong className="font-bold">{moaData.schoolName}</strong>, an educational institution with address at{" "}
          <strong className="font-bold">{moaData.schoolAddress}</strong>, represented herein by <strong className="font-bold">{moaData.schoolRep}</strong>,{" "}
          {moaData.schoolRepPosition}, hereinafter referred to as the
          'School.'
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          II. PURPOSE
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          This Agreement is executed to formalize the partnership between the
          Company and the School for the purpose of providing student
          internship opportunities under the School's academic and/or
          voluntary internship program.
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          III. SCOPE OF INTERNSHIP
        </h3>
        <ol className="list-decimal list-inside text-sm sm:text-base text-gray-600 space-y-2">
          <li>
            The internship program shall provide students with practical
            learning experiences aligned with their academic courses or career
            interests.
          </li>
          <li>
            The internship may be:
            <ul className="list-disc list-inside ml-4">
              <li>
                Required Internship: to be completed upon attaining the
                prescribed <strong className="font-bold">{moaData.internshipHours}</strong> as mandated by the
                School's curriculum.
              </li>
              <li>
                Voluntary Internship: to be undertaken by students who wish to
                gain additional experience beyond the required hours.
              </li>
            </ul>
          </li>
          <li>
            The Company shall assign students to appropriate tasks, projects,
            or training activities consistent with their field of study.
          </li>
        </ol>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          IV. DURATION
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          The internship period shall cover <strong className="font-bold">{moaData.startDate}</strong> to{" "}
          <strong className="font-bold">{moaData.endDate}</strong>, or until the completion of the required number of
          internship hours, whichever comes first, unless earlier terminated
          in accordance with this Agreement.
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          V. RESPONSIBILITIES OF THE PARTIES
        </h3>
        <h4 className="text-base sm:text-lg font-medium mt-4 text-gray-700">
          A. The School shall:
        </h4>
        <ol className="list-decimal list-inside text-sm sm:text-base text-gray-600 space-y-2">
          <li>Endorse qualified students for internship placement.</li>
          <li>
            Provide the Company with internship requirements, guidelines, and
            monitoring forms.
          </li>
          <li>
            Assign a Faculty/Practicum Coordinator to monitor and evaluate the
            students' progress.
          </li>
        </ol>
        <h4 className="text-base sm:text-lg font-medium mt-4 text-gray-700">
          B. The Company shall:
        </h4>
        <ol className="list-decimal list-inside text-sm sm:text-base text-gray-600 space-y-2">
          <li>
            Accept endorsed students for internship and provide meaningful
            tasks aligned with their academic background.
          </li>
          <li>
            Designate a Supervisor/Mentor to guide and evaluate the students'
            performance.
          </li>
          <li>
            Provide a safe working environment and comply with applicable
            labor, occupational safety, and data privacy laws.
          </li>
          <li>
            Issue a Certificate of Completion upon successful completion of
            the internship program.
          </li>
        </ol>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          VI. NON-COMPENSATION CLAUSE
        </h3>
        <ol className="list-decimal list-inside text-sm sm:text-base text-gray-600 space-y-2">
          <li>
            The internship shall be non-compensated unless otherwise agreed by
            the parties in writing.
          </li>
          <li>
            Should the Company decide to provide allowance, stipend, or
            benefits, such shall not be construed as establishing an
            employer-employee relationship.
          </li>
        </ol>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          VII. CONFIDENTIALITY
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Interns shall observe confidentiality of all records, data, and
          information obtained during the internship and shall not disclose
          the same without the written consent of the Company.
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          VIII. TERMINATION
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          This Agreement may be terminated by either party upon written notice
          under the following conditions:
        </p>
        <ul className="list-disc list-inside ml-4 text-sm sm:text-base text-gray-600 space-y-2">
          <li>Violation of Company or School rules and regulations.</li>
          <li>Misconduct or breach of confidentiality by the intern.</li>
          <li>Mutual agreement of both parties.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          IX. EFFECTIVITY
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          This MOA shall take effect on the date of signing and shall remain
          valid until completion of the agreed internship program.
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          X. SIGNATURES
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          IN WITNESS WHEREOF, the parties hereto have signed this Memorandum
          of Agreement on this <strong className="font-bold">{moaData.signingDate}</strong> at {moaData.signingPlace}
          .
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-800">
              {moaData.companyName}
            </p>
            <p className="mt-2 text-gray-600">
              By: ___________________________
            </p>
            <p className="text-gray-600">
              <strong className="font-bold">{moaData.companyRep}</strong>, {moaData.companyRepPosition}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {moaData.schoolName}
            </p>
            <p className="mt-2 text-gray-600">
              By: ___________________________
            </p>
            <p className="text-gray-600">
              <strong className="font-bold">{moaData.schoolRep}</strong>, {moaData.schoolRepPosition}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="font-semibold text-gray-800">Witnesses:</p>
          <p className="mt-2 text-gray-600">1. ___________________________</p>
          <p className="text-gray-600">2. ___________________________</p>
        </div>
      </section>

      <div className="mt-8 text-center print-button">
        <button
          onClick={onPrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
        >
          Print Agreement
        </button>
      </div>
    </div>
  );
};

export default MOAAgreement;