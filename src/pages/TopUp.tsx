
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Layout/Header';
import BottomNavbar from '@/components/Layout/BottomNavbar';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Copy, Clock, CheckCircle, XCircle } from 'lucide-react';

const TopUp = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [jumlah, setJumlah] = useState('');
  const [buktiUrl, setBuktiUrl] = useState('');
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

  const { data: topupHistory = [] } = useQuery({
    queryKey: ['topup-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('topup_request')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('topup_request')
        .insert({
          user_id: user.id,
          jumlah: parseFloat(jumlah),
          bukti_transfer_url: buktiUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Permohonan top up berhasil dikirim! Menunggu konfirmasi admin.');
      setJumlah('');
      setBuktiUrl('');
      
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim permohonan top up');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Nomor berhasil disalin!');
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6 space-y-6">
        {/* Current Balance */}
        <Card className="p-4 bg-gradient-to-r from-[#002D62] to-[#00B894] text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">Saldo Saat Ini</p>
            <p className="text-3xl font-bold">
              Rp {userProfile?.saldo?.toLocaleString('id-ID') || '0'}
            </p>
          </div>
        </Card>

        {/* Transfer Instructions */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-6 h-6 text-[#002D62] mr-3" />
            <h2 className="text-lg font-bold text-gray-800">Cara Top Up</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Transfer ke:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GoPay: 0851-3764-6489</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard('0851-3764-6489')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-700">Atas Nama: UUS KUSMIATI</p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>1. Transfer sesuai nominal yang diinginkan</p>
              <p>2. Screenshot bukti transfer</p>
              <p>3. Upload bukti dan isi form di bawah</p>
              <p>4. Tunggu konfirmasi admin (maks 24 jam)</p>
            </div>
          </div>
        </Card>

        {/* Top Up Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Form Top Up</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Top Up (Rp)
              </label>
              <Input
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Masukkan jumlah"
                required
                min="10000"
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setJumlah(amount.toString())}
                  >
                    Rp {amount.toLocaleString('id-ID')}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Bukti Transfer
              </label>
              <Input
                value={buktiUrl}
                onChange={(e) => setBuktiUrl(e.target.value)}
                placeholder="https://example.com/bukti-transfer.jpg"
                required
              />
              {buktiUrl && (
                <div className="mt-2">
                  <img 
                    src={buktiUrl} 
                    alt="Bukti Transfer" 
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00B894] hover:bg-[#00A085]"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim Permohonan'}
            </Button>
          </form>
        </Card>

        {/* Top Up History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Riwayat Top Up</h3>
          
          <div className="space-y-3">
            {topupHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada riwayat top up</p>
            ) : (
              topupHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Rp {item.jumlah.toLocaleString('id-ID')}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    {item.status === 'pending' && (
                      <Badge variant="secondary" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {item.status === 'disetujui' && (
                      <Badge className="bg-green-500 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Disetujui
                      </Badge>
                    )}
                    {item.status === 'ditolak' && (
                      <Badge variant="destructive" className="flex items-center">
                        <XCircle className="w-3 h-3 mr-1" />
                        Ditolak
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default TopUp;
