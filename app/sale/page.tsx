'use client';

import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import SaleList from '../pages/SaleList';

export default function SalePage() {
  return (
          <div className="min-h-screen bg-gray-100">
          <Sidebar />
          <div className="pl-36 flex-1">
            <Navbar />
          </div>
          <SaleList />
        </div>
  );
}