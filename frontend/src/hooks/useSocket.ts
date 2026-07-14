import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_BASE_URL?.startsWith('http') ? import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') : 'http://localhost:4000');

interface UseSocketReturn {
  socket: Socket | null;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markRead: (conversationId: string) => void;
  onNewMessage: (handler: (message: Message) => void) => () => void;
  onConversationUpdated: (handler: (data: { conversationId: string }) => void) => () => void;
  onMessagesRead: (handler: (data: { conversationId: string; readBy: string }) => void) => () => void;
  onError: (handler: (error: { message: string }) => void) => () => void;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {});
    socket.on('connect_error', () => {});

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit('send_message', { conversationId, content });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('mark_read', conversationId);
  }, []);

  const onNewMessage = useCallback((handler: (message: Message) => void) => {
    socketRef.current?.on('new_message', handler);
    return () => { socketRef.current?.off('new_message', handler); };
  }, []);

  const onConversationUpdated = useCallback((handler: (data: { conversationId: string }) => void) => {
    socketRef.current?.on('conversation_updated', handler);
    return () => { socketRef.current?.off('conversation_updated', handler); };
  }, []);

  const onMessagesRead = useCallback((handler: (data: { conversationId: string; readBy: string }) => void) => {
    socketRef.current?.on('messages_read', handler);
    return () => { socketRef.current?.off('messages_read', handler); };
  }, []);

  const onError = useCallback((handler: (error: { message: string }) => void) => {
    socketRef.current?.on('error', handler);
    return () => { socketRef.current?.off('error', handler); };
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    markRead,
    onNewMessage,
    onConversationUpdated,
    onMessagesRead,
    onError,
  };
};

export default useSocket;
