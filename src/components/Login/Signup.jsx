import { useState } from "react";
import axios from "axios";

const Signup = ({show, onClose, onLoginClick,setloginFormData}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
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
      alert(error.response?.data?.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[199] transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-[min(95%,900px)] absolute top-1/2 left-1/2 -translate-x-1/2 transition-all duration-300 ${
        show ? '-translate-y-1/2 opacity-100' : '-translate-y-[40%] opacity-0'
      }`}>
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {/* Left Column - Image */}
            <div className="hidden md:block w-[400px] bg-primary-600 p-8 text-white relative">
              <div className="h-full flex flex-col justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Start Your Journey!</h2>
                  <p className="text-primary-100">Join Exploreworld today and unlock a world of amazing travel experiences and exclusive benefits.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <i className="fi fi-rr-badge-percent text-xl"></i>
                    <p className="text-sm">Get member-only discounts</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fi fi-rr-bell text-xl"></i>
                    <p className="text-sm">Receive travel alerts & updates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fi fi-rr-heart text-xl"></i>
                    <p className="text-sm">Create your travel wishlist</p>
                  </div>
                </div>
              </div>
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex-1 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Sign up</h1>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fi fi-rr-cross-small text-gray-600 text-xl"></i>
                </button>
              </div>

              <div className="mb-8">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button 
                    onClick={() => {
                      onClose?.();
                      onLoginClick?.();
                    }} 
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fi fi-rr-user text-gray-400"></i>
                      </div>
                      <input 
                        type="text" 
                        id="fullName" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors" 
                        required 
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fi fi-rr-phone-call text-gray-400"></i>
                      </div>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors" 
                        required 
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fi fi-rr-envelope text-gray-400"></i>
                      </div>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors" 
                        required 
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fi fi-rr-lock text-gray-400"></i>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors" 
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
                    <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fi fi-rr-lock text-gray-400"></i>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="confirmPassword" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors" 
                        required 
                        placeholder="Confirm your password"
                        minLength={8}
                      />
                    </div>
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

                <button 
                  type="submit" 
                  className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Account
                </button>
              </form>

              <div className="relative mt-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative">
                  <span className="px-4 text-sm text-gray-500 bg-white">Or continue with</span>
                </div>
              </div>

              <button 
                type="button" 
                className="mt-6 w-full h-11 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
                  <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
                  <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
                  <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup; 