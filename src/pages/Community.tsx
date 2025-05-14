
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, Megaphone, Send } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/services/supabase';

const Community = () => {
  const { user, profile, isAdmin } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('community_messages_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'community_messages' 
      }, handleNewMessage)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (payload: any) => {
    fetchMessages();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from('community_messages').insert({
        user_id: user.id,
        message: newMessage,
        is_announcement: isAdmin && isAnnouncement
      });

      if (error) throw error;

      setNewMessage('');
      toast.success(isAnnouncement ? 'Announcement posted!' : 'Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const hideMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_hidden: true })
        .eq('id', messageId);
      
      if (error) throw error;
      
      toast.success('Message hidden');
      fetchMessages();
    } catch (error) {
      console.error('Error hiding message:', error);
      toast.error('Failed to hide message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderAnnouncements = () => {
    const announcements = messages.filter(msg => msg.is_announcement).slice(0, 3);
    
    if (announcements.length === 0) {
      return (
        <div className="text-gray-500 italic">No announcements at this time.</div>
      );
    }
    
    return announcements.map(announcement => (
      <div key={announcement.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
        <p className="font-medium text-amber-800">{announcement.message}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-amber-700">
            {formatTime(announcement.created_at)}
          </p>
          {isAdmin && (
            <button
              onClick={() => hideMessage(announcement.id)}
              className="text-xs text-amber-700 underline"
            >
              Hide
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Layout loading={loading && !messages.length}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-coffee-dark">Community</h1>
        
        {/* Announcements Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Megaphone className="w-5 h-5 mr-2 text-coffee-mocha" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderAnnouncements()}
          </CardContent>
        </Card>
        
        {/* Chat Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-coffee-mocha" />
              Community Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto mb-4 border rounded-md p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : messages.filter(msg => !msg.is_announcement).length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages
                    .filter(msg => !msg.is_announcement)
                    .map(message => {
                      const isCurrentUser = message.user_id === user?.id;
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-coffee-mocha text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            <p className="font-semibold text-sm">
                              {message.profiles?.full_name || message.profiles?.email || 'User'}
                            </p>
                            <p className="break-words">{message.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs opacity-75">
                                {formatTime(message.created_at)}
                              </span>
                              {isAdmin && !isCurrentUser && (
                                <button
                                  onClick={() => hideMessage(message.id)}
                                  className="text-xs underline ml-2"
                                >
                                  Hide
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div>
              {isAdmin && (
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="isAnnouncement" 
                    checked={isAnnouncement}
                    onCheckedChange={(checked) => setIsAnnouncement(checked as boolean)}
                  />
                  <label 
                    htmlFor="isAnnouncement" 
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Post as announcement
                  </label>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isAnnouncement ? "Type an announcement..." : "Type a message..."}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  className="bg-coffee-mocha hover:bg-coffee-espresso"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Community;
