"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      {children}
      <ToastContainer position="top-center" autoClose={2500} pauseOnFocusLoss={false} />
    </SessionProvider>
  );
}