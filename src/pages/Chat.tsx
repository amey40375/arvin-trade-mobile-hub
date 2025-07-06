
import { useState, useEffect, useRef } from 'react';
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
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatList = [] } = useQuery({
    queryKey: ['chat-list', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chat')
        .select(`
          *,
          dari_user:users!dari_user_id(nama, email),
          ke_user:users!ke_user_id(nama, email),
          produk(nama, harga)
        `)
        .or(`dari_user_id.eq.${user.id},ke_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by conversation partner
      const conversations = new Map();
      data.forEach((chat) => {
        const partnerId = chat.dari_user_id === user.id ? chat.ke_user_id : chat.dari_user_id;
        const partnerName = chat.dari_user_id === user.id ? chat.ke_user?.nama : chat.dari_user?.nama;
        
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partnerId,
            partnerName,
            lastMessage: chat.pesan,
            lastTime: chat.created_at,
            produk: chat.produk
          });
        }
      });
      
      return Array.from(conversations.values());
    },
    enabled: !!user?.id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedChat, user?.id],
    queryFn: async () => {
      if (!selectedChat || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('chat')
        .select(`
          *,
          dari_user:users!dari_user_id(nama, email)
        `)
        .or(`and(dari_user_id.eq.${user.id},ke_user_id.eq.${selectedChat}),and(dari_user_id.eq.${selectedChat},ke_user_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChat && !!user?.id,
    refetchInterval: 3000, // Auto refresh every 3 seconds
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat')
        .insert({
          dari_user_id: user.id,
          ke_user_id: selectedChat,
          pesan: message.trim()
        });

      if (error) throw error;
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim pesan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 py-4 h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 pr-2">
            <Card className="h-full p-4">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-5 h-5 text-[#002D62] mr-2" />
                <h2 className="font-semibold">Chat</h2>
              </div>
              
              <div className="space-y-2 overflow-y-auto">
                {chatList.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Belum ada percakapan
                  </p>
                ) : (
                  chatList.map((chat) => (
                    <button
                      key={chat.partnerId}
                      onClick={() => setSelectedChat(chat.partnerId)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChat === chat.partnerId 
                          ? 'bg-[#002D62] text-white' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8 bg-[#00B894] text-white flex items-center justify-center">
                          {chat.partnerName?.charAt(0) || 'U'}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {chat.partnerName || 'User'}
                          </p>
                          <p className="text-xs opacity-75 truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 pl-2">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.dari_user_id === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.dari_user_id === user.id
                                ? 'bg-[#002D62] text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.pesan}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !message.trim()}
                        size="sm"
                        className="bg-[#00B894] hover:bg-[#00A085]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Pilih percakapan untuk memulai chat</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default Chat;
