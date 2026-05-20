import { MessageSquare, Plus, Radio, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import useAsync from '../hooks/useAsync.js';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const formatTime = (value) => new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

export default function MessagesPage() {
  const { socket, connected, joinConversation, leaveConversation } = useSocket();
  const conversations = useAsync(() => api.conversations(), []);
  const {
    data: conversationData,
    setData: setConversations,
    loading: conversationsLoading,
    run: refreshConversations,
  } = conversations;
  const [activeId, setActiveId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const messages = useAsync(
    () => (activeId ? api.messages(activeId, { limit: 50 }) : Promise.resolve([])),
    [activeId],
    Boolean(activeId)
  );
  const { data: messageData, setData: setMessages, loading: messagesLoading } = messages;

  useEffect(() => {
    if (!activeId && conversationData?.length) {
      setActiveId(conversationData[0]._id);
    }
  }, [activeId, conversationData]);

  useEffect(() => {
    if (!activeId) return undefined;

    joinConversation(activeId);
    return () => leaveConversation(activeId);
  }, [activeId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!socket) return undefined;

    const addConversation = (conversation) => {
      setConversations((current = []) => {
        if (current.some((item) => item._id === conversation._id)) return current;
        return [conversation, ...current];
      });
    };

    const updateConversation = ({ conversationId, lastMessage, updatedAt }) => {
      setConversations((current = []) => current.map((conversation) => (
        conversation._id === conversationId
          ? { ...conversation, lastMessage, updatedAt }
          : conversation
      )));
    };

    const addMessage = ({ conversationId, message }) => {
      if (conversationId !== activeId) return;

      setMessages((current = []) => {
        if (current.some((item) => item._id === message._id)) return current;
        return [message, ...current];
      });
    };

    socket.on('conversation:new', addConversation);
    socket.on('conversation:updated', updateConversation);
    socket.on('message:new', addMessage);

    return () => {
      socket.off('conversation:new', addConversation);
      socket.off('conversation:updated', updateConversation);
      socket.off('message:new', addMessage);
    };
  }, [socket, activeId, setConversations, setMessages]);

  const createConversation = async (event) => {
    event.preventDefault();
    if (!participantId.trim()) return;

    setError('');
    try {
      const conversation = await api.createConversation({ participantIds: [participantId.trim()] });
      await refreshConversations();
      setActiveId(conversation._id);
      setParticipantId('');
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!content.trim() || !activeId) return;

    const message = await api.sendMessage({ conversationId: activeId, content: content.trim() });
    if (!connected) {
      setMessages((current = []) => {
        if (current.some((item) => item._id === message._id)) return current;
        return [message, ...current];
      });
    }
    setContent('');
    await refreshConversations();
  };

  const activeConversation = conversationData?.find((conversation) => conversation._id === activeId);

  return (
    <section className="grid min-h-[calc(100vh-140px)] gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="surface rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-ink">Messages</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              Direct conversations.
              <span className={`inline-flex items-center gap-1 font-semibold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Radio className="h-3.5 w-3.5" />
                {connected ? 'Live' : 'Offline'}
              </span>
            </p>
          </div>
          <MessageSquare className="h-5 w-5 text-brand-600" />
        </div>

        <form className="mt-4 flex gap-2" onSubmit={createConversation}>
          <Input
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            placeholder="Profile ObjectId"
            className="h-10"
          />
          <Button size="icon" type="submit" aria-label="Create conversation">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}

        <div className="mt-4 space-y-2">
          {conversationsLoading ? <p className="text-sm text-slate-500">Loading conversations...</p> : null}
          {conversationData?.map((conversation) => {
            const other = conversation.participants?.[0];
            return (
              <button
                key={conversation._id}
                className={`focus-ring flex w-full items-center gap-3 rounded-md p-3 text-left ${
                  conversation._id === activeId ? 'bg-brand-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => setActiveId(conversation._id)}
                type="button"
              >
                <Avatar profile={other} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {conversation.groupName || other?.displayName || other?.username || 'Conversation'}
                  </p>
                  <p className="truncate text-xs text-slate-500">{conversation.lastMessage?.content || 'No messages yet'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="surface flex min-h-[520px] flex-col rounded-lg">
        {activeConversation ? (
          <>
            <div className="border-b border-line p-4">
              <h2 className="text-lg font-black text-ink">
                {activeConversation.groupName || 'Conversation'}
              </h2>
              <p className="text-sm text-slate-500">{activeConversation.participants?.length || 0} participants</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? <p className="text-sm text-slate-500">Loading messages...</p> : null}
              {messageData?.slice().reverse().map((message) => (
                <div key={message._id} className="max-w-2xl rounded-md bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Avatar profile={message.sender} size="sm" />
                    <p className="text-sm font-bold text-ink">@{message.sender?.username}</p>
                    <p className="text-xs text-slate-400">{formatTime(message.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>

            <form className="flex gap-2 border-t border-line p-4" onSubmit={sendMessage}>
              <Input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a message"
                className="h-10"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState icon={MessageSquare} title="No active conversation" description="Start a thread with a profile ObjectId." />
          </div>
        )}
      </section>
    </section>
  );
}
