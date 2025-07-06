
import { Search, MessageCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold">
            <span className="text-[#002D62] font-[Poppins]">ARVIN</span>
            <span className="text-[#00B894] font-[Poppins] lowercase ml-1">trade</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari Produk..."
            className="pl-10 bg-gray-50 border-gray-200 rounded-full"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
