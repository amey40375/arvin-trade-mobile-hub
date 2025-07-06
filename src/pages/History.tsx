
import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History as HistoryIcon, ShoppingBag, Upload, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch user's products
  const { data: userProducts = [] } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('penjual_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch purchase history (as buyer)
  const { data: purchaseHistory = [] } = useQuery({
    queryKey: ['purchase-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('riwayat_transaksi')
        .select(`
          *,
          produk(nama, harga, foto_url),
          penjual:users!penjual_id(nama, email)
        `)
        .eq('pembeli_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch sales history (as seller)
  const { data: salesHistory = [] } = useQuery({
    queryKey: ['sales-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('riwayat_transaksi')
        .select(`
          *,
          produk(nama, harga, foto_url),
          pembeli:users!pembeli_id(nama, email)
        `)
        .eq('penjual_id', user.id)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        );
      case 'disetujui':
        return (
          <Badge className="bg-green-500 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'ditolak':
        return (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      case 'selesai':
        return (
          <Badge className="bg-green-500 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'dibatalkan':
        return (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <HistoryIcon className="w-6 h-6 text-[#002D62] mr-3" />
          <h1 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h1>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Produk Saya
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pembelian
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Penjualan
            </TabsTrigger>
          </TabsList>

          {/* User Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Produk Yang Saya Upload</h2>
              <Button
                onClick={() => navigate('/upload')}
                size="sm"
                className="bg-[#002D62]"
              >
                + Upload Produk
              </Button>
            </div>
            
            {userProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Anda belum mengupload produk apapun</p>
                <Button onClick={() => navigate('/upload')} className="bg-[#002D62]">
                  Upload Produk Pertama
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {userProducts.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                        {product.foto_url ? (
                          <img 
                            src={product.foto_url} 
                            alt={product.nama}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.nama}</h3>
                        <p className="text-[#002D62] font-bold">
                          Rp {product.harga.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.kategori} • Stok: {product.stok}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(product.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(product.status)}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            <h2 className="text-lg font-semibold">Riwayat Pembelian</h2>
            
            {purchaseHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Anda belum melakukan pembelian</p>
                <Button onClick={() => navigate('/products')} className="bg-[#00B894]">
                  Mulai Belanja
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                        {transaction.produk?.foto_url ? (
                          <img 
                            src={transaction.produk.foto_url} 
                            alt={transaction.produk.nama}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{transaction.produk?.nama}</h3>
                        <p className="text-[#002D62] font-bold">
                          Rp {transaction.jumlah.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Penjual: {transaction.penjual?.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(transaction.status)}
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <h2 className="text-lg font-semibold">Riwayat Penjualan</h2>
            
            {salesHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Belum ada penjualan</p>
                <p className="text-sm text-gray-400 mb-4">
                  Upload produk untuk mulai berjualan
                </p>
                <Button onClick={() => navigate('/upload')} className="bg-[#002D62]">
                  Upload Produk
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {salesHistory.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                        {transaction.produk?.foto_url ? (
                          <img 
                            src={transaction.produk.foto_url} 
                            alt={transaction.produk.nama}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{transaction.produk?.nama}</h3>
                        <p className="text-[#00B894] font-bold">
                          + Rp {transaction.jumlah.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pembeli: {transaction.pembeli?.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(transaction.status)}
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default History;
