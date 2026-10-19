import type { ChatServer, DataChange } from '../models/Message';

let io: ChatServer | null = null;

export const setIo = (server: ChatServer): void => {
    io = server;
};

// Avisa a todos los clientes conectados de que un dato ha cambiado.
export const notifyChange = (change: DataChange): void => {
    io?.emit('data:changed', change);
};
