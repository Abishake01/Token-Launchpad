// src/app/page.tsx
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      {/* Main content area with proper margin for sidebar */}
      <div className="flex-1 lg:ml-60 transition-all duration-500">
        <Navbar />
        {/* Add top padding to account for fixed navbar */}
        <main className="relative pt-20">
          <Home />
        </main>
      </div>
    </div>
  );
}