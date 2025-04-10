import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ThankYouPage = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Set up the countdown and redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Thank you for your purchase!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your digital products are on their way to your email.
          </p>
          <p className="mt-5 text-sm text-gray-500">
            Redirecting to home page in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>
        <div>
          <Link 
            to="/" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; 