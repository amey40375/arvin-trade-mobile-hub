
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import Header from '@/components/Layout/Header';
import BottomNavbar from '@/components/Layout/BottomNavbar';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, MapPin, Tag, Smartphone, 
  Shirt, Home as HomeIcon, ShoppingCart,
  Heart, MessageCircle, History, CreditCard,
  HelpCircle, Star, Gift, CheckCircle
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('status', 'disetujui')
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Auto-slide promo
  const promoSlides = [
    { title: "Upload Gratis 3 Produk", desc: "Mulai berjualan tanpa biaya", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { title: "Langganan Premium: Upload 100 Produk", desc: "Hanya Rp50.000/bulan", color: "bg-gradient-to-r from-green-500 to-green-600" },
    { title: "Barang Bekas Terverifikasi", desc: "Dijamin kualitas terbaik", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D62]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-[#002D62] to-[#00B894]">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-white">ARVIN</span>
            <span className="text-yellow-300 lowercase">trade</span>
          </h1>
          <p className="text-lg opacity-90">E-Commerce Terpercaya</p>
        </div>
        
        <div className="space-y-4 w-full max-w-sm">
          <Button 
            onClick={() => navigate('/login')}
            className="w-full bg-white text-[#002D62] hover:bg-gray-100 font-semibold"
          >
            Masuk
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            variant="outline"
            className="w-full border-white text-white hover:bg-white hover:text-[#002D62] font-semibold"
          >
            Daftar
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Upload, label: "Jual Barang", path: "/upload", color: "text-[#002D62]" },
    { icon: MapPin, label: "Produk Terdekat", path: "/products", color: "text-[#00B894]" },
    { icon: Tag, label: "Promo Hari Ini", path: "/products", color: "text-red-500" },
    { icon: CheckCircle, label: "Barang Bekas Terverifikasi", path: "/products", color: "text-green-500" },
    { icon: Shirt, label: "Kategori Fashion", path: "/products", color: "text-pink-500" },
    { icon: Smartphone, label: "Kategori Elektronik", path: "/products", color: "text-blue-500" },
    { icon: HomeIcon, label: "Kategori Rumah Tangga", path: "/products", color: "text-orange-500" },
    { icon: ShoppingCart, label: "Cek Status Order", path: "/history", color: "text-purple-500" },
    { icon: Upload, label: "Upload Produk", path: "/upload", color: "text-[#002D62]" },
    { icon: Heart, label: "ARVIN Donasi", path: "/", color: "text-red-500" },
    { icon: MessageCircle, label: "Chat Pembeli", path: "/chat", color: "text-green-500" },
    { icon: History, label: "Riwayat Jual-Beli", path: "/history", color: "text-indigo-500" },
    { icon: CreditCard, label: "Pembayaran", path: "/topup", color: "text-blue-600" },
    { icon: HelpCircle, label: "Pusat Bantuan", path: "/", color: "text-gray-500" },
    { icon: Star, label: "Langganan Premium", path: "/subscription", color: "text-yellow-500" },
    { icon: Gift, label: "Lihat Semua", path: "/products", color: "text-[#00B894]" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-4 space-y-6">
        {/* User Balance & Points */}
        <Card className="p-4 bg-gradient-to-r from-[#002D62] to-[#00B894] text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Saldo Anda</p>
              <p className="text-2xl font-bold">
                Rp {userProfile?.saldo?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Status</p>
              <p className="text-lg font-semibold">
                {userProfile?.langganan_premium ? 'Premium' : 'Gratis'}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button 
            onClick={() => navigate('/topup')}
            variant="outline" 
            className="flex flex-col p-4 h-auto border-[#002D62] text-[#002D62]"
          >
            <CreditCard className="w-6 h-6 mb-2" />
            <span className="text-xs">Transfer</span>
          </Button>
          <Button 
            onClick={() => navigate('/topup')}
            variant="outline" 
            className="flex flex-col p-4 h-auto border-[#00B894] text-[#00B894]"
          >
            <Upload className="w-6 h-6 mb-2 rotate-180" />
            <span className="text-xs">Top Up</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col p-4 h-auto border-orange-500 text-orange-500"
          >
            <Gift className="w-6 h-6 mb-2" />
            <span className="text-xs">Voucher</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col p-4 h-auto border-purple-500 text-purple-500"
          >
            <CheckCircle className="w-6 h-6 mb-2" />
            <span className="text-xs">Check-in</span>
          </Button>
        </div>

        {/* Menu Grid 4x4 */}
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className={`w-6 h-6 mb-2 ${item.color}`} />
                <span className="text-xs text-center text-gray-700 leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Promo Slider */}
        <div className="relative h-32 rounded-lg overflow-hidden">
          {promoSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 ${slide.color} flex items-center justify-center text-white transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-center p-4">
                <h3 className="text-lg font-bold mb-1">{slide.title}</h3>
                <p className="text-sm opacity-90">{slide.desc}</p>
              </div>
            </div>
          ))}
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {promoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Products Flash Sale Style */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Flash Sale</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/products')}
              className="text-[#00B894]"
            >
              Lihat Semua
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 6).map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 relative">
                  {product.foto_url ? (
                    <img 
                      src={product.foto_url} 
                      alt={product.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Gift className="w-12 h-12" />
                    </div>
                  )}
                  {product.diskon > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{product.diskon}%
                    </Badge>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                    {product.nama}
                  </h3>
                  <p className="text-lg font-bold text-[#002D62] mb-1">
                    Rp {product.harga.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Stok: {product.stok}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-[#00B894] hover:bg-[#00A085]"
                  >
                    Beli Sekarang
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Home;
