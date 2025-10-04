import React from "react";

const MOAViewer = ({ moaData, companySignature, academySignature, companySignedDate, academySignedDate }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
          MEMORANDUM OF AGREEMENT
        </h1>
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Between</h2>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{moaData.companyName}</p>
            </div>
            <p style={{ fontSize: '1.125rem', margin: '0 0.75rem' }}>and</p>
            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{moaData.schoolName}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            I. PARTIES
          </h3>
          <p style={{ marginBottom: '1rem', textAlign: 'justify' }}>This Memorandum of Agreement (MOA) is entered into by and between:</p>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem', border: '1px solid #bfdbfe' }}>
            <p style={{ textAlign: 'justify' }}><strong>{moaData.companyName}</strong>, a duly registered company with office address at {moaData.companyAddress}, represented herein by <strong>{moaData.companyRep}</strong>, {moaData.companyRepPosition}, hereinafter referred to as the "Company"</p>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: '0.75rem' }}>- and -</div>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
            <p style={{ textAlign: 'justify' }}><strong>{moaData.schoolName}</strong>, an educational institution with address at {moaData.schoolAddress}, represented herein by <strong>{moaData.schoolRep}</strong>, {moaData.schoolRepPosition}, hereinafter referred to as the "School"</p>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            II. PURPOSE
          </h3>
          <p style={{ textAlign: 'justify' }}>This Agreement is executed to formalize the partnership between the Company and the School for the purpose of providing student internship opportunities under the School's academic and/or voluntary internship program.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            III. SCOPE OF INTERNSHIP
          </h3>
          <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'justify' }}>
            <li>The internship program shall provide students with practical learning experiences aligned with their academic courses or career interests.</li>
            <li>
              The internship may be:
              <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><span style={{ fontWeight: '500' }}>Required Internship:</span> to be completed upon attaining the prescribed <span style={{ fontWeight: '500' }}>{moaData.internshipHours}</span> as mandated by the School's curriculum.</li>
                <li><span style={{ fontWeight: '500' }}>Voluntary Internship:</span> to be undertaken by students who wish to gain additional experience beyond the required hours.</li>
              </ul>
            </li>
            <li>The Company shall assign students to appropriate tasks, projects, or training activities consistent with their field of study.</li>
          </ol>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            IV. DURATION
          </h3>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
            <p style={{ textAlign: 'justify' }}>The internship period shall cover <strong>{moaData.startDate}</strong> to <strong>{moaData.endDate}</strong>, or until the completion of the required number of internship hours, whichever comes first, unless earlier terminated in accordance with this Agreement.</p>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            V. RESPONSIBILITIES OF THE PARTIES
          </h3>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>A. The School shall:</h4>
          <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'justify' }}>
            <li>Endorse qualified students for internship placement.</li>
            <li>Provide the Company with internship requirements, guidelines, and monitoring forms.</li>
            <li>Assign a Faculty/Practicum Coordinator to monitor and evaluate the students' progress.</li>
          </ol>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>B. The Company shall:</h4>
          <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'justify' }}>
            <li>Accept endorsed students for internship and provide meaningful tasks aligned with their academic background.</li>
            <li>Designate a Supervisor/Mentor to guide and evaluate the students' performance.</li>
            <li>Provide a safe working environment and comply with applicable labor, occupational safety, and data privacy laws.</li>
            <li>Issue a Certificate of Completion upon successful completion of the internship program.</li>
          </ol>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            VI. NON-COMPENSATION CLAUSE
          </h3>
          <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'justify' }}>
            <li>The internship shall be non-compensated unless otherwise agreed by the parties in writing.</li>
            <li>Should the Company decide to provide allowance, stipend, or benefits, such shall not be construed as establishing an employer-employee relationship.</li>
          </ol>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            VII. CONFIDENTIALITY
          </h3>
          <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: '0.375rem', border: '1px solid #fef08a' }}>
            <p style={{ textAlign: 'justify' }}>Interns shall observe confidentiality of all records, data, and information obtained during the internship and shall not disclose the same without the written consent of the Company.</p>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            VIII. TERMINATION
          </h3>
          <p style={{ marginBottom: '0.75rem', textAlign: 'justify' }}>This Agreement may be terminated by either party upon written notice under the following conditions:</p>
          <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Violation of Company or School rules and regulations.</li>
            <li style={{ marginBottom: '0.5rem' }}>Misconduct or breach of confidentiality by the intern.</li>
            <li>Mutual agreement of both parties.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            IX. EFFECTIVITY
          </h3>
          <p style={{ textAlign: 'justify' }}>This MOA shall take effect on the date of signing and shall remain valid until completion of the agreed internship program.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
            X. SIGNATURES
          </h3>
          <p style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>IN WITNESS WHEREOF, the parties hereto have signed this Memorandum of Agreement on this {moaData.signingDate} at {moaData.signingPlace}.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{moaData.companyName}</p>
              <p style={{ marginBottom: '0.5rem' }}>By:</p>
              {companySignature ? (
                <div style={{ marginBottom: '0.3125rem' }}>
                  <img src={companySignature} alt="Company Signature" style={{ maxHeight: '50px', border: '1px solid #ccc' }} />
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Digitally signed on {new Date(companySignedDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '0.3125rem' }}></div>
              )}
              <p style={{ marginTop: '0.25rem' }}>{moaData.companyRep}, {moaData.companyRepPosition}</p>
            </div>
            
            <div>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{moaData.schoolName}</p>
              <p style={{ marginBottom: '0.5rem' }}>By:</p>
              {academySignature ? (
                <div style={{ marginBottom: '0.3125rem' }}>
                  <img src={academySignature} alt="Academy Signature" style={{ maxHeight: '50px', border: '1px solid #ccc' }} />
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Digitally signed on {new Date(academySignedDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '0.3125rem' }}></div>
              )}
              <p style={{ marginTop: '0.25rem' }}>{moaData.schoolRep}, {moaData.schoolRepPosition}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MOAViewer;