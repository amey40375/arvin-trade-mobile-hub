
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Clock, Eye, DollarSign, Users, Package } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminAuth, setAdminAuth] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email === 'admin@smartpay.com' && loginForm.password === 'SmartAdmin123') {
      setAdminAuth(true);
      toast.success('Login admin berhasil');
    } else {
      toast.error('Email atau password salah');
    }
  };

  // Fetch pending products
  const { data: pendingProducts = [] } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produk')
        .select(`
          *,
          penjual:users!penjual_id(nama, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: adminAuth,
  });

  // Fetch pending top-ups
  const { data: pendingTopups = [] } = useQuery({
    queryKey: ['admin-pending-topups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topup_request')
        .select(`
          *,
          user:users!user_id(nama, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: adminAuth,
  });

  // Fetch all users
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: adminAuth,
  });

  // Approve/Reject Product
  const productActionMutation = useMutation({
    mutationFn: async ({ productId, action, notes }: { productId: string, action: 'disetujui' | 'ditolak', notes?: string }) => {
      const { error } = await supabase
        .from('produk')
        .update({ status: action })
        .eq('id', productId);
      
      if (error) throw error;

      // Send notification to seller
      const product = pendingProducts.find(p => p.id === productId);
      if (product) {
        await supabase
          .from('notifikasi')
          .insert({
            user_id: product.penjual_id,
            judul: `Produk ${action === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
            pesan: `Produk "${product.nama}" telah ${action === 'disetujui' ? 'disetujui' : 'ditolak'} oleh admin.${notes ? ` Catatan: ${notes}` : ''}`
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      toast.success('Status produk berhasil diperbarui');
      setSelectedProduct(null);
      setAdminNotes('');
    },
  });

  // Approve/Reject Top-up
  const topupActionMutation = useMutation({
    mutationFn: async ({ topupId, action, notes }: { topupId: string, action: 'disetujui' | 'ditolak', notes?: string }) => {
      const topup = pendingTopups.find(t => t.id === topupId);
      if (!topup) throw new Error('Top-up tidak ditemukan');

      // Update topup status
      const { error: topupError } = await supabase
        .from('topup_request')
        .update({ 
          status: action,
          admin_notes: notes 
        })
        .eq('id', topupId);
      
      if (topupError) throw topupError;

      // If approved, update user balance
      if (action === 'disetujui') {
        const { data: currentUser, error: userError } = await supabase
          .from('users')
          .select('saldo')
          .eq('id', topup.user_id)
          .single();
        
        if (userError) throw userError;

        await supabase
          .from('users')
          .update({ 
            saldo: (currentUser.saldo || 0) + topup.jumlah 
          })
          .eq('id', topup.user_id);
      }

      // Send notification
      await supabase
        .from('notifikasi')
        .insert({
          user_id: topup.user_id,
          judul: `Top Up ${action === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
          pesan: `Permintaan top up sebesar Rp ${topup.jumlah.toLocaleString('id-ID')} telah ${action === 'disetujui' ? 'disetujui' : 'ditolak'}.${notes ? ` Catatan: ${notes}` : ''}`
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-topups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast.success('Status top-up berhasil diperbarui');
      setAdminNotes('');
    },
  });

  // Block/Unblock User
  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string, action: 'aktif' | 'diblokir' }) => {
      const { error } = await supabase
        .from('users')
        .update({ status: action })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast.success('Status user berhasil diperbarui');
    },
  });

  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002D62] to-[#00B894] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 mx-auto text-[#002D62] mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600">ARVIN trade</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Admin
              </label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@smartpay.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Password admin"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#002D62] hover:bg-[#001A3D]">
              Login Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#002D62] text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 mr-3" />
            <h1 className="text-xl font-bold">Admin Panel - ARVIN trade</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setAdminAuth(false);
              navigate('/');
            }}
            className="text-white hover:bg-white/10"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Produk ({pendingProducts.length})
            </TabsTrigger>
            <TabsTrigger value="topups" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Top Up ({pendingTopups.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <h2 className="text-lg font-semibold">Produk Menunggu Verifikasi</h2>
            
            {pendingProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada produk yang menunggu verifikasi</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingProducts.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                        {product.foto_url ? (
                          <img 
                            src={product.foto_url} 
                            alt={product.nama}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.nama}</h3>
                        <p className="text-[#002D62] font-bold">Rp {product.harga.toLocaleString('id-ID')}</p>
                        <p className="text-sm text-gray-600">{product.kategori} • {product.lokasi}</p>
                        <p className="text-sm text-gray-600">Penjual: {product.penjual?.nama}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(product.created_at).toLocaleString('id-ID')}
                        </p>
                        
                        {product.deskripsi && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {product.deskripsi}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => productActionMutation.mutate({ 
                            productId: product.id, 
                            action: 'disetujui' 
                          })}
                          className="bg-green-500 hover:bg-green-600"
                          disabled={productActionMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => productActionMutation.mutate({ 
                            productId: product.id, 
                            action: 'ditolak' 
                          })}
                          variant="destructive"
                          disabled={productActionMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Top-ups Tab */}
          <TabsContent value="topups" className="space-y-4">
            <h2 className="text-lg font-semibold">Permintaan Top Up</h2>
            
            {pendingTopups.length === 0 ? (
              <Card className="p-8 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada permintaan top up</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingTopups.map((topup) => (
                  <Card key={topup.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Rp {topup.jumlah.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          User: {topup.user?.nama} ({topup.user?.email})
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(topup.created_at).toLocaleString('id-ID')}
                        </p>
                        
                        {topup.bukti_transfer_url && (
                          <div className="mt-2">
                            <a 
                              href={topup.bukti_transfer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm"
                            >
                              Lihat Bukti Transfer
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => topupActionMutation.mutate({ 
                            topupId: topup.id, 
                            action: 'disetujui' 
                          })}
                          className="bg-green-500 hover:bg-green-600"
                          disabled={topupActionMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => topupActionMutation.mutate({ 
                            topupId: topup.id, 
                            action: 'ditolak',
                            notes: 'Bukti transfer tidak valid'
                          })}
                          variant="destructive"
                          disabled={topupActionMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-lg font-semibold">Manajemen User</h2>
            
            <div className="space-y-4">
              {allUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.nama}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.role === 'penjual' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === 'aktif' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                        {user.langganan_premium && (
                          <Badge className="bg-yellow-500">Premium</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Saldo: Rp {user.saldo?.toLocaleString('id-ID') || '0'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Upload: {user.jumlah_upload || 0}/{user.max_upload || 3}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={user.status === 'aktif' ? 'destructive' : 'default'}
                        onClick={() => userActionMutation.mutate({ 
                          userId: user.id, 
                          action: user.status === 'aktif' ? 'diblokir' : 'aktif'
                        })}
                        disabled={userActionMutation.isPending}
                      >
                        {user.status === 'aktif' ? 'Blokir' : 'Aktifkan'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Review Produk</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                {selectedProduct.foto_url && (
                  <img 
                    src={selectedProduct.foto_url} 
                    alt={selectedProduct.nama}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.nama}</h3>
                  <p className="text-[#002D62] font-bold text-xl">
                    Rp {selectedProduct.harga.toLocaleString('id-ID')}
                  </p>
                  <p className="text-gray-600">{selectedProduct.kategori}</p>
                  <p className="text-gray-600">{selectedProduct.lokasi}</p>
                </div>
                
                {selectedProduct.deskripsi && (
                  <div>
                    <h4 className="font-medium mb-2">Deskripsi:</h4>
                    <p className="text-gray-700">{selectedProduct.deskripsi}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Admin (opsional)
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => productActionMutation.mutate({ 
                      productId: selectedProduct.id, 
                      action: 'disetujui',
                      notes: adminNotes 
                    })}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    disabled={productActionMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui Produk
                  </Button>
                  <Button
                    onClick={() => productActionMutation.mutate({ 
                      productId: selectedProduct.id, 
                      action: 'ditolak',
                      notes: adminNotes 
                    })}
                    variant="destructive"
                    className="flex-1"
                    disabled={productActionMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Produk
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
