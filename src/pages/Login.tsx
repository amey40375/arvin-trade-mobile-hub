
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah');
        }
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        toast.success('Login berhasil!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login gagal. Silakan coba lagi.');
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

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Masukkan password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#002D62] hover:bg-[#001A3D]"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#00B894] font-medium hover:underline"
            >
              Daftar di sini
            </button>
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Demo Admin Login:</p>
          <p className="text-xs text-gray-700">Email: admin@smartpay.com</p>
          <p className="text-xs text-gray-700">Password: SmartAdmin123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
