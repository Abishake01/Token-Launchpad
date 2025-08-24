'use client';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import TokenPresalePage from '../pages/PreSale';

export default function MultipleTransferPage() {
  return (
          <div className="min-h-screen bg-gray-100">
          <Sidebar />
          <div className="pl-36 flex-1">
            <Navbar />
          </div>
          <TokenPresalePage />
        </div>
  );
}