"use client";

import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { handleLoginRedirect } from "@/utils/isLogin";
import Login from "@/components/Login/Login";
import Signup from "@/components/Login/Signup";
import LoadingSpinner from './components/LoadingSpinner'

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginFormData, setloginFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    const handleShowLoginEvent = () => {
      setShowSignup(false);
      setShowLogin(true);
    };

    window.addEventListener('showLogin', handleShowLoginEvent);
    return () => window.removeEventListener('showLogin', handleShowLoginEvent);
  }, []);

  const handleShowLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleShowSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </head>
      <body className={dmSans.className}>
        <Suspense>
          <LoadingSpinner />
        </Suspense>
        <QueryClientProvider client={queryClient}>
          <Suspense>
            <Login 
              setloginFormData={setloginFormData}
              loginFormData={loginFormData}
              show={showLogin} 
              onClose={() => setShowLogin(false)}
              onSignupClick={handleShowSignup}
              onLoginSuccess={() => {
                setShowLogin(false);
                handleLoginRedirect();
              }}
            />
          </Suspense>
          <Suspense>
            <Signup 
              show={showSignup} 
              onClose={() => setShowSignup(false)}
              onLoginClick={handleShowLogin}
              setloginFormData={setloginFormData}
            />
          </Suspense>
          <Suspense>
            <Header setShowLogin={handleShowLogin} />
          </Suspense>
          <Suspense>
            {children}
          </Suspense>
        </QueryClientProvider>
      </body>
    </html>
  );
}
