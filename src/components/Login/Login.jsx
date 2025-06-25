import axios from "axios";
import { useState } from "react";
import Button from "../common/Button";
import { handleLoginRedirect } from "@/utils/isLogin";
import Popup from "../Popup";

const Login = ({show, onClose, onSignupClick, loginFormData, setloginFormData, onLoginSuccess}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  

  const handleChange = (e) => {
    setErrors(prev => ({ ...prev, [e.target.name]: "" })); // Clear specific field error
    setloginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: "", password: "" }); // Clear all errors
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/login/user', loginFormData);
      if (response.data) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Close modal
        onClose();
        
        // Handle redirect if needed
        const hasRedirect = handleLoginRedirect();
        
        // If no redirect was performed, refresh the page
        if (!hasRedirect) {
          window.location.reload();
        }
        
        // Call onLoginSuccess callback if provided
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      
      // Set appropriate error based on the message
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        // If error is general, show it on both fields
        setErrors({
          email: errorMessage,
          password: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to clear all states
  const clearStates = () => {
    setloginFormData({
      email: '',
      password: ''
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

  // Handle signup click
  const handleSignupClick = () => {
    clearStates();
    onClose?.();
    onSignupClick?.();
  };

  return (
    <Popup
      isOpen={show}
      onClose={handleClose}
      title="Sign in"
      pos="right"
      height="80%"
      className="w-full max-w-md"
      draggable={true}
      showCloseButton={false}
      closeTrigger={true}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="mb-8">
            <p className="text-gray-600">
              Don&apos;t have an account yet?{" "}
              <button 
                onClick={handleSignupClick}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="loginForm">
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
                  value={loginFormData.email}
                  onChange={handleChange}
                  className={`w-full h-12 pl-6 pr-10 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight
                    ${errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                    }
                  `}
                  required 
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600">
                  <i className="fi fi-rr-exclamation text-xs"></i>
                  <p className="text-xs">{errors.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <a className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors" href="../examples/html/recover-account.html">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <i className={`fi fi-rr-lock ${errors.password ? 'text-red-400' : 'text-gray-400'}`}></i>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  value={loginFormData.password}
                  onChange={handleChange}
                  className={`w-full h-12 pl-6 pr-10 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight
                    ${errors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                    }
                  `}
                  required 
                  placeholder="Enter your password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={`fi ${showPassword ? 'fi-rr-eye' : 'fi-rr-eye-crossed'}`}></i>
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-600">
                  <i className="fi fi-rr-exclamation text-xs"></i>
                  <p className="text-xs">{errors.password}</p>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="flex gap-3">
            <button 
              type="button"
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
                <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
                <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
                <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
              </svg>
              Google
            </button>
            <button 
              type="submit"
              form="loginForm"
              className="flex-1 h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-bold rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default Login;