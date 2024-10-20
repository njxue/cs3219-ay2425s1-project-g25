// helpers.ts
import { generateQueueKey } from './queueUtils';
import redisClient from './redisClient';
import { Server } from "socket.io";
import { QueueType } from '../constants/queueTypes';

/**
 * Validates if the socket ID is valid and connected.
 * @param io - Socket.IO server instance.
 * @param socketId - Socket ID to validate.
 * @returns Boolean indicating validity.
 */
export function isValidSocketId(io: Server, socketId: string): boolean {
    return io.sockets.sockets.has(socketId);
}

/**
 * Removes a user from all relevant queues based on their criteria.
 * @param socketId - User's socket ID.
 * @param userData - User's data.
 */
export async function removeUserFromQueues(socketId: string, userData: any): Promise<void> {
    const { category, difficulty } = userData;

    const queues = [];

    if (category && difficulty) {
        const queueKey = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey);
    }

    if (difficulty) {
        const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey);
    }

    if (category) {
        const queueKey = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey);
    }

    const generalQueueKey = generateQueueKey(QueueType.General);
    queues.push(generalQueueKey);

    for (const queueKey of queues) {
        await redisClient.lRem(queueKey, 0, socketId);
        console.log(`Removed ${socketId} from ${queueKey}`);
    }
}
