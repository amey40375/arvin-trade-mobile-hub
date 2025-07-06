
-- Create enum types
CREATE TYPE user_role AS ENUM ('pembeli', 'penjual', 'admin');
CREATE TYPE product_status AS ENUM ('pending', 'disetujui', 'ditolak');
CREATE TYPE topup_status AS ENUM ('pending', 'disetujui', 'ditolak');
CREATE TYPE user_status AS ENUM ('aktif', 'diblokir');
CREATE TYPE transaction_status AS ENUM ('pending', 'selesai', 'dibatalkan');

-- Users table (profiles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  role user_role DEFAULT 'pembeli',
  saldo DECIMAL(12,2) DEFAULT 0,
  langganan_premium BOOLEAN DEFAULT FALSE,
  langganan_expire_at TIMESTAMP WITH TIME ZONE,
  jumlah_upload INTEGER DEFAULT 0,
  max_upload INTEGER DEFAULT 3,
  status user_status DEFAULT 'aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.produk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  penjual_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  kategori TEXT NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  lokasi TEXT DEFAULT 'Bandung & Kab. Bandung',
  status product_status DEFAULT 'pending',
  stok INTEGER DEFAULT 1,
  diskon DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top up requests table
CREATE TABLE public.topup_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  jumlah DECIMAL(12,2) NOT NULL,
  bukti_transfer_url TEXT,
  status topup_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat table
CREATE TABLE public.chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dari_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ke_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  produk_id UUID REFERENCES public.produk(id) ON DELETE CASCADE,
  pesan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  dibaca BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history table
CREATE TABLE public.riwayat_transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pembeli_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  penjual_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  produk_id UUID REFERENCES public.produk(id) ON DELETE CASCADE,
  jumlah DECIMAL(12,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin accounts table
CREATE TABLE public.admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription table
CREATE TABLE public.langganan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  paket TEXT NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  mulai_tanggal TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  berakhir_tanggal TIMESTAMP WITH TIME ZONE,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.langganan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for products
CREATE POLICY "Anyone can view approved products" ON public.produk
  FOR SELECT USING (status = 'disetujui');

CREATE POLICY "Users can view their own products" ON public.produk
  FOR SELECT USING (auth.uid() = penjual_id);

CREATE POLICY "Users can insert their own products" ON public.produk
  FOR INSERT WITH CHECK (auth.uid() = penjual_id);

CREATE POLICY "Users can update their own products" ON public.produk
  FOR UPDATE USING (auth.uid() = penjual_id);

-- RLS Policies for topup requests
CREATE POLICY "Users can view their own topup requests" ON public.topup_request
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create topup requests" ON public.topup_request
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat
CREATE POLICY "Users can view their own chats" ON public.chat
  FOR SELECT USING (auth.uid() = dari_user_id OR auth.uid() = ke_user_id);

CREATE POLICY "Users can send messages" ON public.chat
  FOR INSERT WITH CHECK (auth.uid() = dari_user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifikasi
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifikasi
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transaction history
CREATE POLICY "Users can view their own transactions" ON public.riwayat_transaksi
  FOR SELECT USING (auth.uid() = pembeli_id OR auth.uid() = penjual_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.langganan
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nama, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pembeli')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert admin account
INSERT INTO public.admin (email, password_hash)
VALUES ('admin@smartpay.com', crypt('SmartAdmin123', gen_salt('bf')));

-- Insert sample products for testing
INSERT INTO public.produk (penjual_id, nama, harga, kategori, deskripsi, status, stok, diskon)
VALUES 
  (NULL, 'Kaos Polos Premium', 75000, 'Fashion', 'Kaos polos berkualitas tinggi, nyaman dipakai', 'disetujui', 50, 15),
  (NULL, 'Sepatu Sneakers Modern', 350000, 'Fashion', 'Sepatu sneakers trendy untuk gaya casual', 'disetujui', 25, 20),
  (NULL, 'Smartphone Android', 2500000, 'Elektronik', 'Smartphone dengan spesifikasi tinggi', 'disetujui', 10, 10),
  (NULL, 'Headphone Wireless', 150000, 'Elektronik', 'Headphone bluetooth dengan kualitas suara jernih', 'disetujui', 30, 25),
  (NULL, 'Rice Cooker Digital', 450000, 'Rumah Tangga', 'Rice cooker digital dengan berbagai fitur canggih', 'disetujui', 15, 12);
