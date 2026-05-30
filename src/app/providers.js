"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import Login from "@/components/Login/Login";
import Signup from "@/components/Login/Signup";
import LoadingSpinner from "@/components/spinLoader/LoadingSpinner";
import MobileNav from "@/components/MobileNav";
import ChunkLoadRecovery from "@/components/ChunkLoadRecovery";
import { handleLoginRedirect } from "@/utils/isLogin";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginFormData, setloginFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const handleShowLoginEvent = () => {
      setShowSignup(false);
      setShowLogin(true);
    };

    window.addEventListener("showLogin", handleShowLoginEvent);
    return () => window.removeEventListener("showLogin", handleShowLoginEvent);
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
    <>
      <ChunkLoadRecovery />
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
        <Suspense>{children}</Suspense>
        <MobileNav />
      </QueryClientProvider>
    </>
  );
}
