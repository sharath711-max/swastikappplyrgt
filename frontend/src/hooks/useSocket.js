import { useEffect, useRef, useCallback } from 'react';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000')
    .replace(/\/api$/, ''); // strip /api suffix if present

/**
 * useSocket — subscribe to real-time events from the backend.
 *
 * Connects via socket.io-client (install once: npm install socket.io-client in /frontend).
 * Falls back silently if the package is not installed — polling still works.
 *
 * @param {string[]} rooms    Socket.IO rooms to join, e.g. ['gold_test', 'workflow']
 * @param {Object}   handlers { 'item:added': fn, 'item:done': fn, ... }
 * @param {any[]}    deps     Additional useEffect deps that should trigger reconnect
 */
export function useSocket(rooms, handlers, deps = []) {
    const socketRef = useRef(null);
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers; // always latest without re-subscribing

    const connect = useCallback(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        // Dynamic import so the app still loads if socket.io-client is not yet installed
        import('socket.io-client').then(({ io }) => {
            if (socketRef.current?.connected) return;

            const socket = io(BASE_URL, {
                auth: { token },
                transports: ['websocket'],
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
            });

            socket.on('connect', () => {
                rooms.forEach(room => socket.emit('join', room));
            });

            // Register all event handlers — use handlersRef so they stay current
            Object.entries(handlersRef.current).forEach(([event, fn]) => {
                socket.on(event, (...args) => handlersRef.current[event]?.(...args));
            });

            socketRef.current = socket;
        }).catch(() => {
            // socket.io-client not installed — silent fallback, polling still works
        });
    }, [rooms.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        connect();
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [connect, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    return socketRef;
}
