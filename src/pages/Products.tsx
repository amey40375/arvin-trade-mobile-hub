
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Layout/Header';
import BottomNavbar from '@/components/Layout/BottomNavbar';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Star, ShoppingCart, Heart } from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('produk')
        .select(`
          *,
          penjual:users!penjual_id(nama, email)
        `)
        .eq('status', 'disetujui');

      if (searchTerm) {
        query = query.or(`nama.ilike.%${searchTerm}%,deskripsi.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq('kategori', selectedCategory);
      }

      // Sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('harga', { ascending: true });
          break;
        case 'price_high':
          query = query.order('harga', { ascending: false });
          break;
        case 'discount':
          query = query.order('diskon', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    'Fashion', 'Elektronik', 'Rumah Tangga', 'Olahraga', 
    'Kesehatan', 'Kecantikan', 'Otomotif', 'Buku'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the query dependency
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-4 space-y-4">
        {/* Search and Filter */}
        <Card className="p-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari produk..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm" className="bg-[#002D62]">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="discount">Diskon Terbesar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </Card>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center">
              "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D62]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">Tidak ada produk ditemukan</p>
              </div>
            ) : (
              products.map((product) => (
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
                        <ShoppingCart className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {product.diskon > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{product.diskon}%
                      </Badge>
                    )}
                    
                    {/* Wishlist Button */}
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                      {product.nama}
                    </h3>
                    
                    <div className="flex items-center space-x-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.kategori}
                      </Badge>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-2">
                      <p className="text-lg font-bold text-[#002D62]">
                        Rp {product.harga.toLocaleString('id-ID')}
                      </p>
                      {product.diskon > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          Rp {(product.harga / (1 - product.diskon / 100)).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    
                    {/* Location and Stock */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{product.lokasi}</span>
                      </div>
                      <span>Stok: {product.stok}</span>
                    </div>
                    
                    {/* Seller Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{product.penjual?.nama || 'Penjual'}</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        <span>4.5</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => navigate('/chat')}
                      >
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-[#00B894] hover:bg-[#00A085] text-xs"
                      >
                        Beli
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && products.length % 20 === 0 && (
          <div className="text-center py-4">
            <Button variant="outline" className="w-full">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Products;
