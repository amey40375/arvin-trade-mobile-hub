
import { Home, Upload, Bell, User, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Rekomendasi', path: '/' },
    { icon: DollarSign, label: 'Top Up', path: '/topup' },
    { icon: Upload, label: 'Upload Produk', path: '/upload' },
    { icon: Bell, label: 'Notifikasi', path: '/notifications' },
    { icon: User, label: 'Akun Saya', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-[#002D62] bg-blue-50' 
                  : 'text-gray-500 hover:text-[#002D62]'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavbar;
