"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Replace with your actual login API call
      // const response = await loginUser(email, password);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-lg mx-auto mt-7 bg-white border border-gray-200 rounded-3xl shadow-2xs">
      <div class="p-4 lg:p-6">
        <div class="text-center">
        <div class="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 class="block text-lg font-bold text-gray-800">Sign in</h1>
          <a href="/" class="inline-block hover:bg-gray-100 rounded-full transition-colors">
            <i class="fi fi-rr-cross-small text-gray-800 text-xl"></i>
          </a>
        </div>
          <h1 class="text-2xl font-bold text-gray-800 text-left mt-4">
            Welcome to  Exploreworld!
          </h1>
          <p class="mt-2 text-sm text-gray-600 text-left">
            Don&apos;t have an account yet?
            <a class="text-primary-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="../examples/html/signup.html">
              Sign up here
            </a>
          </p>
        </div>

        <div class="mt-5">
   

          <form>
            <div class="grid gap-y-4">
              <div>
                <label for="email" class="block text-sm mb-2 text-gray-800">Email address</label>
                <div class="relative">
                  <input type="email" id="email" name="email" class="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-primary focus:ring-none disabled:opacity-50 disabled:pointer-events-none outline-none focus:border-primary-500 text-gray-800" required aria-describedby="email-error" />
                  <div class="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                    <svg class="size-5 text-red-500" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                    </svg>
                  </div>
                </div>
                <p class="hidden text-xs text-red-600 mt-2" id="email-error">Please include a valid email address so we can get back to you</p>
              </div>

              <div>
                <div class="flex flex-wrap justify-between items-center gap-2">
                  <label for="password" class="block text-sm mb-2 text-gray-800">Password</label>
                  <a class="inline-flex items-center gap-x-1 text-sm text-primary-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="../examples/html/recover-account.html">Forgot password?</a>
                </div>
                <div class="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password" 
                    class="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-primary focus:ring-none disabled:opacity-50 disabled:pointer-events-none outline-none focus:border-primary-500 text-gray-800" 
                    required 
                    aria-describedby="password-error" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    class="absolute inset-y-0 end-0 pe-3 flex items-center"
                  >
                    <i class={`fi ${showPassword ? 'fi-rr-eye' : 'fi-rr-eye-crossed'} text-gray-500`}></i>
                  </button>
                </div>
                <p class="hidden text-xs text-red-600 mt-2" id="password-error">8+ characters required</p>
              </div>

              <div class="flex items-center">
                <div class="flex">
                  <input id="remember-me" name="remember-me" type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded-sm text-primary-600 focus:ring-primary-500 checked:bg-primary-600"/>
                </div>
                <div class="ms-3">
                  <label for="remember-me" class="text-sm text-gray-700">Remember me</label>
                </div>
              </div>

              <button type="submit" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary-600 text-white hover:bg-primary-700 focus:outline-hidden focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none">Sign in</button>
            </div>  
          </form>
          <div class="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6">Or</div>
           <button type="button" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
            <svg class="w-4 h-auto" width="46" height="47" viewBox="0 0 46 47" fill="none">
              <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
              <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
              <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
              <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
            </svg>
            Sign in with Google
          </button>

      
        </div>

   
      </div>
    </div>
  );
};

export default LoginPage;
