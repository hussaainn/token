import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'

    useEffect(() => {
        let newSocket;
        if (user) {
            setStatus('connecting');
            newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050', {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            newSocket.on('connect', () => {
                setStatus('connected');
                console.log('Connected to socket server');
                newSocket.emit('join:room', user._id);
                if (user.role === 'admin') {
                    newSocket.emit('join:admin');
                }
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setStatus('disconnected');
                if (reason === 'io server disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    newSocket.connect();
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setStatus('error');
                toast.error('Socket connection error. Real-time updates may be delayed.');
            });

            newSocket.on('reconnect_attempt', (attempt) => {
                console.log(`Socket reconnection attempt #${attempt}`);
                setStatus('connecting');
            });

            newSocket.on('reconnect', () => {
                setStatus('connected');
                toast.success('Real-time connection restored');
            });

            setSocket(newSocket);
        } else {
            setStatus('disconnected');
        }

        return () => {
            if (newSocket) {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                newSocket.off('reconnect_attempt');
                newSocket.off('reconnect');
                newSocket.close();
            }
        };
    }, [user]);

    const value = {
        socket,
        status,
        isConnected: status === 'connected',
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
