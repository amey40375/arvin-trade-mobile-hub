
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import BottomNavbar from '@/components/Layout/BottomNavbar';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, Star, Upload, History, 
  CreditCard, Settings, LogOut, 
  Shield, Crown 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout berhasil');
      navigate('/');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { icon: Upload, label: 'Produk Saya', path: '/products', count: userProfile?.jumlah_upload || 0 },
    { icon: History, label: 'Riwayat Transaksi', path: '/history' },
    { icon: CreditCard, label: 'Top Up Saldo', path: '/topup', balance: userProfile?.saldo || 0 },
    { icon: Star, label: 'Langganan Premium', path: '/subscription', premium: userProfile?.langganan_premium },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#002D62] to-[#00B894] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {userProfile?.nama || 'User'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={userProfile?.role === 'penjual' ? 'default' : 'secondary'}>
                  {userProfile?.role === 'penjual' ? 'Penjual' : 'Pembeli'}
                </Badge>
                {userProfile?.langganan_premium && (
                  <Badge className="bg-yellow-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Badge variant={userProfile?.status === 'aktif' ? 'default' : 'destructive'}>
                  <Shield className="w-3 h-3 mr-1" />
                  {userProfile?.status === 'aktif' ? 'Aktif' : 'Diblokir'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-[#002D62]">
              Rp {userProfile?.saldo?.toLocaleString('id-ID') || '0'}
            </div>
            <div className="text-sm text-gray-600">Saldo</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-[#00B894]">
              {userProfile?.jumlah_upload || 0}/{userProfile?.max_upload || 3}
            </div>
            <div className="text-sm text-gray-600">Produk Upload</div>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="p-4">
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-[#002D62]" />
                    <span className="text-gray-800">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.count !== undefined && (
                      <Badge variant="secondary">{item.count}</Badge>
                    )}
                    {item.balance !== undefined && (
                      <span className="text-sm text-gray-600">
                        Rp {item.balance.toLocaleString('id-ID')}
                      </span>
                    )}
                    {item.premium && (
                      <Badge className="bg-yellow-500 text-white">Premium</Badge>
                    )}
                    <span className="text-gray-400">›</span>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Profile;
