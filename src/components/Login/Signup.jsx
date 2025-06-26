import { useState } from "react";
import axios from "axios";
import Popup from "../Popup";

const Signup = ({show, onClose, onLoginClick, setloginFormData}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Add function to clear all states
  const clearStates = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPassword(false);
    setIsLoading(false);
  };

  // Handle popup close
  const handleClose = () => {
    clearStates();
    onClose?.();
  };

  // Handle login click
  const handleLoginClick = () => {
    clearStates();
    onClose?.();
    onLoginClick?.();
  };

  const handleChange = (e) => {
    setErrors(prev => ({ ...prev, [e.target.name]: "" })); // Clear field-specific error
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset all errors
    setErrors({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords don't match"
      }));
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setErrors(prev => ({
        ...prev,
        password: "Password must be at least 8 characters long"
      }));
      return;
    }
    
    try {
      const signupData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      };
      
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register/user', signupData);
      if (response.data) {
        if (response.data.status) {
          setloginFormData({
            email: signupData.email,
            password: signupData.password
          });
          onClose();
          onLoginClick();
        }
      }
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      // Set field-specific errors based on error message
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('name')) {
        setErrors(prev => ({ ...prev, fullName: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        // If it's a general error, show it on all fields
        setErrors({
          fullName: errorMessage,
          email: errorMessage,
          password: errorMessage,
          confirmPassword: errorMessage,
          phone: errorMessage
        });
      }
    }
  };

  const renderFieldError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-600">
        <i className="fi fi-rr-exclamation text-xs"></i>
        <p className="text-xs">{errors[fieldName]}</p>
      </div>
    );
  };

  const getInputClassName = (fieldName) => `
    w-full h-12 pl-6 pr-10 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight
    ${errors[fieldName] 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-gray-300 focus:border-primary-500'
    }
  `;

  return (
    <Popup
      isOpen={show}
      onClose={handleClose}
      title="Sign up"
      pos="right"
      height="auto"
      className="w-full max-w-md"
      draggable={true}
      showCloseButton={true}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="mb-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={handleLoginClick}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="signupForm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <i className={`fi fi-rr-user ${errors.fullName ? 'text-red-400' : 'text-gray-400'}`}></i>
                  </div>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={getInputClassName('fullName')}
                    required 
                    placeholder="Enter your full name"
                  />
                </div>
                {renderFieldError('fullName')}
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <i className={`fi fi-rr-phone-call ${errors.phone ? 'text-red-400' : 'text-gray-400'}`}></i>
                  </div>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={getInputClassName('phone')}
                    required 
                    placeholder="Enter your phone number"
                  />
                </div>
                {renderFieldError('phone')}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <i className={`fi fi-rr-envelope ${errors.email ? 'text-red-400' : 'text-gray-400'}`}></i>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                  required 
                  placeholder="Enter your email"
                />
              </div>
              {renderFieldError('email')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <i className={`fi fi-rr-lock ${errors.password ? 'text-red-400' : 'text-gray-400'}`}></i>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={getInputClassName('password')}
                    required 
                    placeholder="Create a password"
                    minLength={8}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fi ${showPassword ? 'fi-rr-eye' : 'fi-rr-eye-crossed'}`}></i>
                  </button>
                </div>
                {renderFieldError('password')}
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <i className={`fi fi-rr-lock ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`}></i>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={getInputClassName('confirmPassword')}
                    required 
                    placeholder="Confirm your password"
                    minLength={8}
                  />
                </div>
                {renderFieldError('confirmPassword')}
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="terms" 
                name="terms" 
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="flex gap-3">
            <button 
              type="button" 
              disabled
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-gray-50 text-gray-400 font-medium border border-gray-200 rounded-full cursor-not-allowed opacity-60"
            >
              <svg className="w-5 h-5 opacity-50" viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
                <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
                <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
                <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
              </svg>
              Google
            </button>
            <button 
              type="submit"
              form="signupForm"
              className="flex-1 h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-bold rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default Signup; 