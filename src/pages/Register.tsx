
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'pembeli' as 'pembeli' | 'penjual',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nama: formData.nama,
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      // Success message
      if (!authData.user) {
        toast.success('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
      } else {
        toast.success('Pendaftaran berhasil! Silakan login.');
      }
      
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Pendaftaran gagal. Silakan coba lagi.';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Format email tidak valid.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password harus minimal 6 karakter.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002D62] to-[#00B894] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            <span className="text-[#002D62]">ARVIN</span>
            <span className="text-[#00B894] lowercase">trade</span>
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <Input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan password (min. 6 karakter)"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daftar Sebagai
            </label>
            <Select 
              value={formData.role} 
              onValueChange={(value: 'pembeli' | 'penjual') => 
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pembeli">Pembeli</SelectItem>
                <SelectItem value="penjual">Penjual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#002D62] hover:bg-[#001A3D]"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#00B894] font-medium hover:underline"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
