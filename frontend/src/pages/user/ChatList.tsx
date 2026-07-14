import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { chatApi } from '../../api/authApi';
import useSocket from '../../hooks/useSocket';
import { FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import type { Conversation } from '../../types';
import type { RootState } from '../../store';

const ChatList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const { onConversationUpdated } = useSocket();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await chatApi.getConversations();
        setConversations(res.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const unsub = onConversationUpdated(() => {
      chatApi.getConversations().then((res) => setConversations(res.data.data));
    });
    return unsub;
  }, [onConversationUpdated]);

  const getOtherParty = (conv: Conversation) => {
    if (!user) return null;
    return user.id === conv.userId ? conv.provider : conv.user;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <FiMessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500">Start a conversation from a listing page</p>
      </div>
    );
  }

  const basePath = user?.role === 'PROVIDER' ? '/provider/inbox' : '/inbox';

  return (
    <div className="space-y-3">
      {conversations.map((conv) => {
        const other = getOtherParty(conv);
        return (
          <Link
            key={conv.id}
            to={`${basePath}/${conv.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {other?.avatar ? (
                <img src={other.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-600 font-semibold text-lg">
                  {other?.firstName?.[0]}{other?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {other?.firstName} {other?.lastName}
                </h4>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(conv.lastMessageAt)}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {conv.listing.title}
              </p>
              {conv.lastMessage && (
                <p className="text-sm text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
              )}
            </div>
            <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
};

export default ChatList;
