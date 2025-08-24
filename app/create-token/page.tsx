'use client';

import CreateToken from '@/app/pages/CreateToken';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';

export default function CreateTokenPage() {
  return (
          <div className="min-h-screen bg-gray-100">
          <Sidebar />
          <div className="pl-36 flex-1">
            <Navbar />
          </div>
          <CreateToken />
        </div>
  );
}