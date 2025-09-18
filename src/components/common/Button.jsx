import React from 'react';

const Button = ({ 
  children, 
  type = "button", 
  className = "", 
  isLoading = false, 
  disabled = false,
  variant = "primary", // primary, secondary, outline, text
  size = "md", // sm, md, lg
  icon,
  onClick,
  ...props 
}) => {
  // Base classes that will always be applied
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Size variations
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5"
  };

  // Variant variations
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:!outline-none focus:border-primary-500 focus:!ring-none !rounded-full",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:!outline-none focus:border-primary-500 focus:!ring-none !rounded-full",
    outline: "border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 focus:!outline-none focus:border-primary-500 focus:!ring-none !rounded-full",
    danger: "bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 hover:text-white focus:!outline-none focus:border-red-500 focus:!ring-none !rounded-full",
    text: "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
         <span>{children}</span>
          <LoadingSpinner />
         
        </>
      ) : (
        <>
         <span>{children}</span>
          {icon && <span className={`${size === 'sm' ? 'text-sm' : 'text-base'}`}>{icon}</span>}
         
        </>
      )}
    </button>
  );
};

export default Button;
