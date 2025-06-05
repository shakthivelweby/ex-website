"use client";

import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Login from "@/components/Login/Login";
import Signup from "@/components/Login/Signup";

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
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={dmSans.className}>
        <QueryClientProvider client={queryClient}>
          <Login 
            setloginFormData={setloginFormData}
            loginFormData={loginFormData}
            show={showLogin} 
            onClose={() => setShowLogin(false)}
            onSignupClick={handleShowSignup}
          />
          <Signup 
            show={showSignup} 
            onClose={() => setShowSignup(false)}
            onLoginClick={handleShowLogin}
            setloginFormData={setloginFormData}
          />
          <Header setShowLogin={handleShowLogin} />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
