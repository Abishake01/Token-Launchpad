import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import SaleDetails from '@/app/pages/SaleDetails';

export default function SaleDetailsPage() {
  return (
          <div className="min-h-screen bg-gray-100">
          <Sidebar />
          <div className="pl-36 flex-1">
            <Navbar />
          </div>
          <SaleDetails />
        </div>
  );
}