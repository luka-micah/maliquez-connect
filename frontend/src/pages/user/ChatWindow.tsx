import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { chatApi } from '../../api/authApi';
import useSocket from '../../hooks/useSocket';
import { FiSend, FiArrowLeft, FiCheck, FiCheckSquare } from 'react-icons/fi';
import type { Message, Conversation } from '../../types';
import type { RootState } from '../../store';

const ChatWindow = () => {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { joinConversation, leaveConversation, sendMessage, markRead, onNewMessage } = useSocket();

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          chatApi.getConversation(id),
          chatApi.getMessages(id),
        ]);
        setConversation(convRes.data.data);
        setMessages(msgRes.data.data);
        markRead(id);
        chatApi.markRead(id);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, markRead]);

  useEffect(() => {
    if (!id) return;
    joinConversation(id);
    return () => leaveConversation(id);
  }, [id, joinConversation, leaveConversation]);

  useEffect(() => {
    const unsub = onNewMessage((message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      if (message.senderId !== user?.id) {
        markRead(id!);
        chatApi.markRead(id!);
      }
    });
    return unsub;
  }, [onNewMessage, id, user, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !id || sending) return;
    setSending(true);
    sendMessage(id, content);
    setInput('');
    setTimeout(() => setSending(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParty = () => {
    if (!conversation || !user) return null;
    return user.id === conversation.userId ? conversation.provider : conversation.user;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const other = getOtherParty();
  const basePath = user?.role === 'PROVIDER' ? '/provider/inbox' : '/inbox';

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className={`h-10 w-24 bg-gray-200 rounded-xl ${i % 2 === 0 ? 'bg-primary-100' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Conversation not found</p>
        <Link to={basePath} className="text-primary-600 hover:text-primary-700 mt-2 inline-block">Back to inbox</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white rounded-t-xl">
        <Link to={basePath} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {other?.avatar ? (
            <img src={other.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-600 font-semibold">{other?.firstName?.[0]}{other?.lastName?.[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 truncate">{other?.firstName} {other?.lastName}</h3>
          <p className="text-xs text-gray-500 truncate">{conversation.listing.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                    {formatDate(msg.createdAt)}
                  </span>
                  {isMine && (
                    msg.read ? <FiCheckSquare className="w-3 h-3 text-primary-200" /> : <FiCheck className="w-3 h-3 text-primary-200" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
