
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
import { Bell, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifikasi')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 10000, // Auto refresh every 10 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notifId: string) => {
      const { error } = await supabase
        .from('notifikasi')
        .update({ dibaca: true })
        .eq('id', notifId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifikasi')
        .update({ dibaca: true })
        .eq('user_id', user.id)
        .eq('dibaca', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Semua notifikasi telah dibaca');
    },
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const unreadCount = notifications.filter(n => !n.dibaca).length;

  const handleMarkAsRead = (notifId: string) => {
    markAsReadMutation.mutate(notifId);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const getNotificationIcon = (judul: string) => {
    if (judul.includes('disetujui') || judul.includes('berhasil')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (judul.includes('ditolak') || judul.includes('gagal')) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-[#002D62] mr-3" />
            <h1 className="text-xl font-bold text-gray-800">Notifikasi</h1>
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Belum ada notifikasi</p>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notif.dibaca ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => !notif.dibaca && handleMarkAsRead(notif.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.judul)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notif.dibaca ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notif.judul}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          !notif.dibaca ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notif.pesan}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      {!notif.dibaca && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Total {notifications.length} notifikasi
            </p>
          </div>
        )}
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Notifications;
