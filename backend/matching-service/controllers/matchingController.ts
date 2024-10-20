import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { createRedisClient, logAllQueues } from "../utils/redisClient";
import { decodeToken } from "../utils/tokenUtils";
import Room from "../models/RoomSchema";

import { startStaleUserCleanup } from '../workers/staleUserCleaner';
import { isValidSocketId } from "../utils/helpers";
// -------------------------------------REST FUNCTIONS-------------------------------------------
export async function startMatching(request: Request, response: Response, next: NextFunction) {
    try {
        const io = getSocket();
        const { category, difficulty, socketId } = request.body;

        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }

        const userKey = `user:${socketId}`;
        const requestedAt = Date.now();

        const userData: Record<string, string> = {
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

    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
     
        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: string; difficulty: string; }) => {
            const { category, difficulty} = requestData;
            if ((!category && category !== '') || (!difficulty && difficulty !== '')) {
                console.error("Missing field - All fields must be strings. Empty category/difficulty are to be empty strings. username and email cannot be empty.");
                return;
            }

            const socketId = socket.id;

            if (!isValidSocketId(io, socketId)) {
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }

            const userKey = `user:${socketId}`;
            const requestedAt = Date.now();

            const token = socket.handshake.auth?.token;

            // Use the decodeToken utility to decode the token
            const decodedToken = decodeToken(token);
            if (!decodedToken) {
                socket.emit('error', { message: 'Invalid or missing token' });
                return;
            }

            const userId = decodedToken.id;
            console.log(`User connected: ${socket.id}, User ID: ${userId}`);

            // Save user ID with socket ID in Redis only on connect
            const userData = {
                userId,
                socketId: socket.id,
                connectedAt: Date.now(),
            };
            redisClient.hSet(userKey, userData);
            // Log the saved user data
            console.log('User data saved:', { userKey, userData });

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

// Room creation function
async function createRoom(user1: any, user2: any) {
    // Create a new room in MongoDB and save it
    const newRoom = new Room({
        participants: [
            { userId: user1.userId },
            { userId: user2.userId }
        ],
        category: user1.category || user2.category || 'Any',
        difficulty: user1.difficulty || user2.difficulty || 'Any',
    });

    // Save the room to the database
    const savedRoom = await newRoom.save();
    return savedRoom._id.toString(); // Return the roomId as a string
}

// Handle match event function
async function handleMatchEvent(user1: any, user2: any) {
    const io = getSocket();

    // Log the user objects to inspect their contents
    console.log("User1 Object:", user1);
    console.log("User2 Object:", user2);

    const socket1 = io.sockets.sockets.get(user1.socketId);
    const socket2 = io.sockets.sockets.get(user2.socketId);

    if (socket1 && socket2) {
        // Call the createRoom function to create a room for the match
        const roomId = await createRoom(user1, user2);

        // Both users join the newly created room
        socket1.join(roomId);
        socket2.join(roomId);

        // Emit the match found event to both users in the room
        io.to(roomId).emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched!`,
            category: user1.category || user2.category || 'Any',
            difficulty: user1.difficulty || user2.difficulty || 'Any',
            roomId: roomId,
        });

        console.log(`Room created with MongoDB ObjectId: ${roomId}, users: ${user1.userId}, ${user2.userId}`);
    } else {
        console.error("One or both users are not connected.");
    }
}