"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null; // This prevents flickering as the redirect happens
  }

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Financial Tracker</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {localStorage.getItem('user') ? 
              `${JSON.parse(localStorage.getItem('user') || '{}').email || 'User'}` : 
              'User'}
          </span>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-2 w-full max-w-[1200px]">{children}</div>
    </div>
  );
}
