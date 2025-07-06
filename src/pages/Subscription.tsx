
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Layout/Header';
import BottomNavbar from '@/components/Layout/BottomNavbar';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, CheckCircle, Upload, Star, Zap, Copy } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

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

  const { data: subscriptionHistory = [] } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('langganan')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubscribe = async () => {
    if (userProfile?.saldo < 50000) {
      toast.error('Saldo tidak mencukupi. Silakan top up terlebih dahulu.');
      navigate('/topup');
      return;
    }

    setLoading(true);
    try {
      // Deduct balance
      const newBalance = (userProfile?.saldo || 0) - 50000;
      
      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          saldo: newBalance,
          langganan_premium: true,
          langganan_expire_at: endDate.toISOString(),
          max_upload: 100
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Add subscription record
      const { error: subError } = await supabase
        .from('langganan')
        .insert({
          user_id: user.id,
          paket: 'Premium Monthly',
          harga: 50000,
          mulai_tanggal: startDate.toISOString(),
          berakhir_tanggal: endDate.toISOString(),
          aktif: true
        });

      if (subError) throw subError;

      // Send notification
      await supabase
        .from('notifikasi')
        .insert({
          user_id: user.id,
          judul: 'Langganan Premium Aktif',
          pesan: 'Selamat! Langganan premium Anda telah aktif. Kini Anda dapat mengupload hingga 100 produk.'
        });

      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history'] });
      
      toast.success('Langganan premium berhasil diaktifkan!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengaktifkan langganan');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Nomor berhasil disalin!');
  };

  const isPremium = userProfile?.langganan_premium;
  const premiumExpiry = userProfile?.langganan_expire_at 
    ? new Date(userProfile.langganan_expire_at) 
    : null;
  const isExpired = premiumExpiry && premiumExpiry < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6 space-y-6">
        {/* Current Status */}
        <Card className="p-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isPremium && !isExpired ? 'bg-yellow-500' : 'bg-gray-300'
            }`}>
              <Crown className={`w-8 h-8 ${
                isPremium && !isExpired ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            
            <h2 className="text-xl font-bold mb-2">
              {isPremium && !isExpired ? 'Premium Member' : 'Member Gratis'}
            </h2>
            
            {isPremium && premiumExpiry && !isExpired && (
              <p className="text-sm text-gray-600">
                Berlaku hingga: {premiumExpiry.toLocaleDateString('id-ID')}
              </p>
            )}
            
            {isExpired && (
              <Badge variant="destructive" className="mb-2">
                Langganan Berakhir
              </Badge>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Limit Upload Produk</p>
              <p className="text-2xl font-bold text-[#002D62]">
                {userProfile?.jumlah_upload || 0} / {userProfile?.max_upload || 3}
              </p>
            </div>
          </div>
        </Card>

        {/* Premium Benefits */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-bold">Keuntungan Premium</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Upload hingga 100 produk</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Prioritas tampil di hasil pencarian</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Badge Premium di profil</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Support prioritas</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Analytics produk detail</span>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6 border-2 border-yellow-500">
          <div className="text-center">
            <Badge className="bg-yellow-500 text-white mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Paling Populer
            </Badge>
            
            <h3 className="text-2xl font-bold mb-2">Premium Monthly</h3>
            <div className="text-4xl font-bold text-[#002D62] mb-2">
              Rp 50.000
            </div>
            <p className="text-gray-600 mb-6">per bulan</p>
            
            {(!isPremium || isExpired) ? (
              <div className="space-y-4">
                <Button
                  onClick={handleSubscribe}
                  disabled={loading || (userProfile?.saldo || 0) < 50000}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3"
                  size="lg"
                >
                  {loading ? 'Memproses...' : 'Berlangganan Sekarang'}
                </Button>
                
                {(userProfile?.saldo || 0) < 50000 && (
                  <p className="text-sm text-red-600">
                    Saldo tidak mencukupi. Saldo Anda: Rp {userProfile?.saldo?.toLocaleString('id-ID') || '0'}
                  </p>
                )}
              </div>
            ) : (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Sudah Berlangganan
              </Badge>
            )}
          </div>
        </Card>

        {/* Payment Alternative */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-blue-800">Pembayaran Manual</h3>
          </div>
          
          <p className="text-sm text-blue-700 mb-4">
            Jika saldo tidak mencukupi, Anda bisa transfer langsung:
          </p>
          
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GoPay: 0851-3764-6489</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard('0851-3764-6489')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">Atas Nama: UUS KUSMIATI</p>
              <p className="text-sm text-gray-600">Jumlah: Rp 50.000</p>
            </div>
            
            <div className="mt-4 text-xs text-blue-600">
              <p>1. Transfer Rp 50.000</p>
              <p>2. Screenshot bukti transfer</p>
              <p>3. Upload di halaman Top Up dengan keterangan "Langganan Premium"</p>
              <p>4. Tunggu konfirmasi admin (maks 24 jam)</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/topup')}
            variant="outline"
            className="w-full mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Buka Halaman Top Up
          </Button>
        </Card>

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Riwayat Langganan</h3>
            
            <div className="space-y-3">
              {subscriptionHistory.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{sub.paket}</p>
                    <p className="text-sm text-gray-600">
                      Rp {sub.harga.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.mulai_tanggal).toLocaleDateString('id-ID')} - 
                      {new Date(sub.berakhir_tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  
                  <Badge variant={sub.aktif ? 'default' : 'secondary'}>
                    {sub.aktif && new Date(sub.berakhir_tanggal) > new Date() ? 'Aktif' : 'Berakhir'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Subscription;
