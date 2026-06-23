"use client";

import { useEffect, useState } from "react";
import isLogin from "@/utils/isLogin";

export function useClientAuth({ promptLogin = true } = {}) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const authed = isLogin();
    setLoggedIn(authed);
    setReady(true);

    if (!authed && promptLogin) {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      window.dispatchEvent(new CustomEvent("showLogin"));
    }
  }, [promptLogin]);

  return { ready, loggedIn };
}

export function TicketLoadingShell({ message = "Loading your ticket…" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950/80">
      <div className="text-center text-white">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

export function TicketSignInPrompt() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950/80 px-4">
      <p className="text-center text-white">Please sign in to view your ticket.</p>
    </div>
  );
}
