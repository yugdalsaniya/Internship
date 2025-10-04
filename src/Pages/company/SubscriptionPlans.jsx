import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Monthly',
      price: '500 PHP / month',
      features: [
        'Unlimited internship postings',
        'Access to top talent pool',
        'Basic analytics and reporting',
        'Priority customer support',
      ],
    },
    {
      name: 'Yearly',
      price: '5000 PHP / year (Save 17%)',
      features: [
        'All Monthly features',
        'Advanced analytics and insights',
        'Featured company profile',
        'Discounted job promotions',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      features: [
        'All Yearly features',
        'Custom branding and integrations',
        'Dedicated account manager',
        'Unlimited users and advanced security',
      ],
    },
  ];

  const handleSubscribe = (planName) => {
    // Simulate subscription (replace with actual payment integration in production)
    alert(`Subscribing to the ${planName} plan. Redirecting back after successful subscription.`);
    // After subscription, perhaps update localStorage or backend to extend trial/enable posting
    navigate('/post-internship');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#050748] text-center mb-8">
          Subscription Plans
        </h1>
        <p className="text-center text-sm md:text-base text-gray-700 max-w-2xl mx-auto mb-12">
          Choose a plan to become a member and unlock unlimited internship postings. Your free trial has expired—subscribe now to continue connecting with top talent.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300"
            >
              <h2 className="text-2xl font-bold text-[#050748] mb-4">{plan.name}</h2>
              <p className="text-xl font-semibold text-blue-600 mb-6">{plan.price}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.name)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Subscribe to {plan.name}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/post-internship')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Post Internship
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;