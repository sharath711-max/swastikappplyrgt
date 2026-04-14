'use strict';

/**
 * socket.js — singleton Socket.IO emitter
 *
 * Usage anywhere in the backend:
 *   const { emit } = require('./socket');
 *   emit('gold_test', 'item:added', { id, customer_name, status, ... });
 *
 * The io instance is attached in app.js after server.listen().
 * All emits before attach are silently dropped — safe during startup/tests.
 */

let _io = null;

/**
 * Called once from app.js after httpServer.listen().
 * @param {import('socket.io').Server} io
 */
function attach(io) {
    _io = io;

    io.on('connection', (socket) => {
        // Client joins a named room: socket.emit('join', 'gold_test')
        socket.on('join', (room) => {
            if (typeof room === 'string' && room.length < 64) {
                socket.join(room);
            }
        });

        socket.on('leave', (room) => {
            socket.leave(room);
        });
    });
}

/**
 * Emit an event to all clients in a room.
 * Fire-and-forget — never throws.
 *
 * @param {string} room   e.g. 'gold_test' | 'silver_test' | 'workflow'
 * @param {string} event  e.g. 'item:added' | 'item:done' | 'cert:created'
 * @param {object} payload
 */
function emit(room, event, payload) {
    if (!_io) return; // not yet attached — safe during tests
    try {
        _io.to(room).emit(event, payload);
    } catch (_) {
        // never let a socket error crash the business logic caller
    }
}

/**
 * Return the raw io instance (for advanced use — avoid in services).
 * @returns {import('socket.io').Server | null}
 */
function getIo() {
    return _io;
}

module.exports = { attach, emit, getIo };
