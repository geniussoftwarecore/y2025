import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Hash, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  body: string;
  createdAt: string;
  channelId: string | null;
  recipientId: string | null;
}

interface Channel {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export default function Chat() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch channels
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery<Channel[]>({
    queryKey: ['/api/chat/channels'],
    enabled: !!token,
  });

  // Fetch messages for selected channel
  const { data: fetchedMessages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/chat/messages', selectedChannel],
    enabled: !!token && !!selectedChannel,
  });

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  // WebSocket connection
  useEffect(() => {
    if (!token || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with JWT token
      ws.send(JSON.stringify({ type: 'auth', userId: user.id, token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth_success') {
        console.log('WebSocket authenticated');
        // Join current channel
        if (selectedChannel) {
          ws.send(JSON.stringify({ type: 'join_channel', channelId: selectedChannel }));
        }
      } else if (data.type === 'new_message') {
        // Add new message to local state
        setWsMessages((prev) => [...prev, data.message]);
        // Invalidate messages query to refetch
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', data.message.channelId] });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token, user, selectedChannel]);

  // Join channel when selected channel changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && selectedChannel) {
      wsRef.current.send(JSON.stringify({ type: 'join_channel', channelId: selectedChannel }));
      setWsMessages([]); // Clear WebSocket messages when switching channels
    }
  }, [selectedChannel]);

  // Scroll to bottom when messages change
  const allMessages = [...fetchedMessages, ...wsMessages];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send via WebSocket for real-time delivery
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          channelId: selectedChannel,
          body,
        }));
      } else {
        // Fallback to REST API
        return apiRequest('POST', `/api/chat/messages`, {
          channelId: selectedChannel,
          body,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedChannel] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessageMutation.mutate(messageText);
    setMessageText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('chat.title')}</h1>
        <p className="text-muted-foreground">Team communication and customer support</p>
      </div>

      <Tabs defaultValue="internal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="internal" data-testid="tab-internal-chat">{t('chat.internal')}</TabsTrigger>
          <TabsTrigger value="customer" data-testid="tab-customer-chat">{t('chat.customer')}</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-0">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
            {/* Channels Sidebar */}
            <Card className="col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t('chat.channels')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  {isLoadingChannels ? (
                    <div className="space-y-2 p-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel.id)}
                          className={cn(
                            'w-full flex items-center gap-2 p-3 rounded-md text-sm transition-colors hover-elevate',
                            selectedChannel === channel.id
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'hover:bg-muted'
                          )}
                          data-testid={`button-channel-${channel.id}`}
                        >
                          <Hash className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left truncate">{channel.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="col-span-9 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  <CardTitle>
                    {channels.find((c) => c.id === selectedChannel)?.name || 'Select a channel'}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-3/4" />
                      <Skeleton className="h-16 w-2/3 ml-auto" />
                      <Skeleton className="h-16 w-3/4" />
                    </div>
                  ) : allMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allMessages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              'flex gap-3 max-w-[80%]',
                              isOwn ? 'ml-auto flex-row-reverse' : ''
                            )}
                            data-testid={`message-${message.id}`}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs">
                                {message.senderName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : '')}>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium">
                                  {isOwn ? 'You' : message.senderName || 'Unknown'}
                                </span>
                                <span>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'rounded-lg px-4 py-2',
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                              >
                                {message.body}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t('chat.typeMessage')}
                      className="flex-1"
                      disabled={!selectedChannel || sendMessageMutation.isPending}
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!selectedChannel || !messageText.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-0">
          <Card className="h-[calc(100vh-16rem)]">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <User className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">{t('chat.customerChatTitle')}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Customer chat feature coming soon. This will allow sales team to communicate with customers in real-time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
