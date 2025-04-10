// src/components/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'medium' }) => {
  // Determine the spinner size based on the prop
  const sizeClasses = {
    small: 'h-4 w-4 border-t-1 border-b-1',
    medium: 'h-8 w-8 border-t-2 border-b-2',
    large: 'h-12 w-12 border-t-3 border-b-3'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500`}></div>
    </div>
  );
};

export default LoadingSpinner;