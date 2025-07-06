
-- Create the missing user_role enum
CREATE TYPE public.user_role AS ENUM ('pembeli', 'penjual', 'admin');

-- Create the missing user_status enum
CREATE TYPE public.user_status AS ENUM ('aktif', 'diblokir');

-- Create the missing product_status enum  
CREATE TYPE public.product_status AS ENUM ('pending', 'disetujui', 'ditolak');

-- Create the missing transaction_status enum
CREATE TYPE public.transaction_status AS ENUM ('pending', 'selesai', 'dibatalkan');

-- Create the missing topup_status enum
CREATE TYPE public.topup_status AS ENUM ('pending', 'disetujui', 'ditolak');

-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the trigger function with proper enum handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, nama, role, saldo, langganan_premium, jumlah_upload, max_upload, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pembeli'::user_role),
    0,
    false,
    0,
    3,
    'aktif'::user_status
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
