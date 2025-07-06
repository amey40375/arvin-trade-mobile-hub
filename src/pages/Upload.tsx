
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
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload as UploadIcon, Image } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    kategori: '',
    deskripsi: '',
    foto_url: '',
    lokasi: 'Bandung & Kab. Bandung',
    stok: '1',
  });
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

  if (!user) {
    navigate('/login');
    return null;
  }

  const canUpload = () => {
    if (!userProfile) return false;
    return (userProfile.jumlah_upload || 0) < (userProfile.max_upload || 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canUpload()) {
      toast.error('Anda telah mencapai batas upload. Upgrade ke premium untuk upload lebih banyak.');
      return;
    }

    setLoading(true);

    try {
      const { error: productError } = await supabase
        .from('produk')
        .insert({
          penjual_id: user.id,
          nama: formData.nama,
          harga: parseFloat(formData.harga),
          kategori: formData.kategori,
          deskripsi: formData.deskripsi,
          foto_url: formData.foto_url,
          lokasi: formData.lokasi,
          stok: parseInt(formData.stok),
          status: 'pending'
        });

      if (productError) throw productError;

      // Update jumlah_upload
      await supabase
        .from('users')
        .update({ 
          jumlah_upload: (userProfile?.jumlah_upload || 0) + 1 
        })
        .eq('id', user.id);

      toast.success('Produk berhasil diupload! Menunggu verifikasi admin.');
      
      // Reset form
      setFormData({
        nama: '',
        harga: '',
        kategori: '',
        deskripsi: '',
        foto_url: '',
        lokasi: 'Bandung & Kab. Bandung',
        stok: '1',
      });
      
    } catch (error: any) {
      toast.error(error.message || 'Gagal upload produk');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Fashion', 'Elektronik', 'Rumah Tangga', 'Olahraga', 
    'Kesehatan', 'Kecantikan', 'Otomotif', 'Buku'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6">
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <UploadIcon className="w-6 h-6 text-[#002D62] mr-3" />
            <h1 className="text-xl font-bold text-gray-800">Upload Produk</h1>
          </div>

          {!canUpload() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">
                Anda telah mencapai batas upload ({userProfile?.jumlah_upload}/{userProfile?.max_upload}). 
                <Button 
                  variant="link" 
                  className="text-red-600 p-0 ml-1"
                  onClick={() => navigate('/subscription')}
                >
                  Upgrade ke Premium
                </Button>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Produk *
              </label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga (Rp) *
              </label>
              <Input
                type="number"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <Select 
                value={formData.kategori} 
                onValueChange={(value) => setFormData({ ...formData, kategori: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <Textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Jelaskan detail produk Anda"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Foto Produk
              </label>
              <Input
                value={formData.foto_url}
                onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                placeholder="https://example.com/gambar.jpg"
              />
              {formData.foto_url && (
                <div className="mt-2">
                  <img 
                    src={formData.foto_url} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi
              </label>
              <Input
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Bandung & Kab. Bandung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok
              </label>
              <Input
                type="number"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                placeholder="1"
                required
                min="1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#002D62] hover:bg-[#001A3D]"
              disabled={loading || !canUpload()}
            >
              {loading ? 'Mengupload...' : 'Upload Produk'}
            </Button>
          </form>
        </Card>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Upload;
