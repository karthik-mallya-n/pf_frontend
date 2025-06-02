"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    
    // If user is logged in, redirect to dashboard
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div>
      <nav className="flex justify-end p-4 gap-4">
        {!isLoggedIn ? (
          <>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={() => router.push("/register")}
            >
              Signup
            </button>
          </>
        ) : (
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </nav>
      <div className="flex flex-col items-center justify-center mt-20">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Personal Financial Tracker</h1>
        <p className="text-xl text-gray-700 mb-8">Track your income and expenses effectively</p>
        {!isLoggedIn && (
          <div className="text-lg text-gray-700">
            Please login to view your dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
