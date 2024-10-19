import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { createRedisClient, logAllQueues } from "../utils/redisClient";
import { startStaleUserCleanup } from '../workers/staleUserCleaner';
import { isValidSocketId } from "../utils/helpers";
// -------------------------------------REST FUNCTIONS-------------------------------------------
export async function startMatching(request: Request, response: Response, next: NextFunction) {
    try {
        const io = getSocket();
        const { username, email, category, difficulty, socketId } = request.body;

        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }

        const userKey = `user:${socketId}`;
        const requestedAt = Date.now();

        const userData: Record<string, string> = {
            username,
            email,
            category: category || '',
            difficulty: difficulty || '',
            socketId,
            requestedAt: requestedAt.toString(),
        };

        await redisClient.hSet(userKey, userData);

        await redisClient.zAdd('matching_queue', {
            score: requestedAt,
            value: userKey,
        });

        response.status(200).json({
            message: "Searching for a match...",
            matchingStatus: MATCHING_STATUS.SEARCHING,
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelMatch(request: Request, response: Response, next: NextFunction) {
    try {
        const { socketId } = request.params;
        const userKey = `user:${socketId}`;

        await redisClient.zRem('matching_queue', userKey);

        await redisClient.del(userKey);

        response.status(200).json({ message: "Match request canceled." });
    } catch (error) {
        next(error);
    }
}

// -----------------------------SOCKET LISTENERS----------------------------------------------
export function setupSocketListeners() {
    const io = getSocket();

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: string; difficulty: string; username: string; email: string; }) => {
            const { category, difficulty, username, email } = requestData;
            if (
                typeof category !== 'string' ||
                typeof difficulty !== 'string' ||
                !username ||
                username.trim() === '' ||
                !email ||
                email.trim() === ''
            ) {
                console.error("Missing field - All fields must be strings. Empty category/difficulty are allowed. Username and email cannot be empty.");
                return;
            }
            const socketId = socket.id;

            if (!isValidSocketId(io, socketId)) {
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }

            const userKey = `user:${socketId}`;
            const requestedAt = Date.now();

            const userData = {
                username,
                email,
                category: category || '',
                difficulty: difficulty || '',
                socketId,
                requestedAt: requestedAt.toString(),
            };
            await redisClient.hSet(userKey, userData);
            await redisClient.zAdd('matching_queue', {
                score: requestedAt,
                value: userKey,
            });
        });

        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async () => {
            const socketId = socket.id;
            const userKey = `user:${socketId}`;

            await redisClient.zRem('matching_queue', userKey);

            await redisClient.del(userKey);

            console.log(`User ${socketId} canceled their match request.`);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            const socketId = socket.id;
            console.log(`User disconnected: ${socketId}`);
            const userKey = `user:${socketId}`;

            // Remove user from queue and delete data
            await redisClient.zRem('matching_queue', userKey);
            await redisClient.del(userKey);
        });
    });
}

// -----------------------------REDIS STREAMS----------------------------------------------
export async function setupSubscriber() {
    const redisClientInstance = createRedisClient();
    await redisClientInstance.connect();

    const streamKey = 'match_events';
    const consumerGroup = 'match_consumers';
    const consumerName = `consumer_${process.pid}`; // Unique consumer name

    // Create the consumer group if it doesn't exist
    try {
        await redisClientInstance.xGroupCreate(streamKey, consumerGroup, '0', { MKSTREAM: true });
        console.log(`Consumer group '${consumerGroup}' created.`);
    } catch (err: any) {
        if (err.code === 'BUSYGROUP') {
            console.log(`Consumer group '${consumerGroup}' already exists.`);
        } else {
            console.error(`Error creating consumer group '${consumerGroup}':`, err);
        }
    }

    // Start processing messages
    processMatchEvents(redisClientInstance, streamKey, consumerGroup, consumerName);

    // Start the periodic cleanup for stale users
    startStaleUserCleanup();
}

async function processMatchEvents(
    redisClient: any,
    streamKey: string,
    consumerGroup: string,
    consumerName: string
) {
    while (true) {
        try {
            const streams = await redisClient.xReadGroup(
                consumerGroup,
                consumerName,
                [
                    {
                        key: streamKey,
                        id: '>',
                    }
                ],
                {
                    COUNT: 10,
                    BLOCK: 5000,
                }
            );

            if (streams) {
                for (const stream of streams) {
                    const messages = stream.messages;

                    for (const message of messages) {
                        const id = message.id;
                        const fields = message.message;
                        const user1 = JSON.parse(fields.user1);
                        const user2 = JSON.parse(fields.user2);

                        await handleMatchEvent(user1, user2);
                        await logAllQueues();
                        await redisClient.xAck(streamKey, consumerGroup, id);
                        await redisClient.xDel(streamKey, id);
                    }
                }
            }
        } catch (err) {
            console.error('Error processing match events:', err);
        }
        await new Promise(resolve => setImmediate(resolve));
    }
}

async function handleMatchEvent(user1: any, user2: any) {
    const io = getSocket();

    const socket1 = io.sockets.sockets.get(user1.socketId);
    const socket2 = io.sockets.sockets.get(user2.socketId);

    if (socket1) {
        socket1.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user2.username}`,
            category: user1.category || user2.category || 'Any',
            difficulty: user1.difficulty || user2.difficulty || 'Any',
        });
    }

    if (socket2) {
        socket2.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user1.username}`,
            category: user2.category || user1.category || 'Any',
            difficulty: user2.difficulty || user1.difficulty || 'Any',
        });
    }
}
