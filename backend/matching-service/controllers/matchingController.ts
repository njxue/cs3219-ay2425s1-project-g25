import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { createRedisClient, logAllQueues, luaScript } from "../utils/redisClient";
import MatchingEventModel from "../models/MatchingEvent";
import { Server } from "socket.io";
import { QueueType } from "../constants/queueTypes";
import { generateQueueKey } from "../utils/queueUtils";

export async function getMatch(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
        const io = getSocket();
        const { username, email, category, difficulty, socketId } = request.body;
  
        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }
  
        const userKey = `user:${socketId}`;
        const userData: Record<string, string> = {
            username,
            email,
            socketId,
            requestedAt: Date.now().toString(),
        };
        
        if (typeof category === 'string' && category.trim() !== '') {
            userData.category = category.trim();
        }
        
        if (typeof difficulty === 'string' && difficulty.trim() !== '') {
            userData.difficulty = difficulty.trim();
        }
        await redisClient.hSet(userKey, userData);
        console.log("Before matching queue state:");
        await logAllQueues();
  
        const matchSocketId = await findMatchForUser(userData);
  
        if (matchSocketId) {
            await handleMatch(userData, matchSocketId);
            console.log("After matching queue state:");
            await logAllQueues();
    
            return response.status(200).json({
                message: "Match found!",
                matchingStatus: MATCHING_STATUS.SUCCESS,
            });
        } else {
            await addUserToQueues(userData);
            console.log("No match found, after adding to queue queue state:");
            await logAllQueues();
    
            return response.status(200).json({
                message: "Searching for a match...",
                matchingStatus: MATCHING_STATUS.SEARCHING,
            });
        }
    } catch (error) {
        next(error);
    }
}  

function isValidSocketId(io: Server, socketId: string): boolean {
    return io.sockets.sockets.has(socketId);
}

async function addUserToQueues(userData: any) {
    const { socketId, difficulty, category } = userData;

    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    const hasCategory = typeof category === 'string' && category.trim() !== '';

    const queues = [];

    if (hasDifficulty && hasCategory) {
        const queueKey1 = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey1);
    } else if (hasDifficulty) {

        const queueKey1 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey1);

        const queueKey2 = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey2);
    } else if (hasCategory) {

        const queueKey1 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey1);

        const queueKey2 = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey2);
    } else {

        const queueKey = generateQueueKey(QueueType.General);
        queues.push(queueKey);
    }

    for (const queueKey of queues) {
        const isMember = await redisClient.lPos(queueKey, socketId);
        if (isMember === null) {
            await redisClient.rPush(queueKey, socketId);
            console.log(`Added ${socketId} to ${queueKey}`);
        }
    }
}


async function findMatchForUser(userData: any): Promise<string | null> {
    const { socketId, difficulty, category } = userData;

    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    const hasCategory = typeof category === 'string' && category.trim() !== '';

    const queueKeys: string[] = [];

    if (hasDifficulty && hasCategory) {
        const queueKey = generateQueueKey(QueueType.All, category, difficulty);
        queueKeys.push(queueKey);
    }

    if (hasDifficulty) {
        const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
        queueKeys.push(queueKey);

        const queueKey2 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queueKeys.push(queueKey2);
    }

    if (hasCategory) {
        const queueKey = generateQueueKey(QueueType.All, category, '*');
        queueKeys.push(queueKey);

        const queueKey2 = generateQueueKey(QueueType.Category, category, undefined);
        queueKeys.push(queueKey2);
    }

    const generalQueueKey = generateQueueKey(QueueType.General);
    queueKeys.push(generalQueueKey);

    try {
        const result = await redisClient.eval(luaScript, {
            keys: queueKeys,
            arguments: [socketId],
        });

        const matchedSocketId = result as string | null;

        if (matchedSocketId) {
            console.log(`Found a match for ${socketId}: ${matchedSocketId}`);
            return matchedSocketId;
        } else {
            console.log(`No match found for ${socketId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error finding match for ${socketId}:`, error);
        return null;
    }
}

async function handleMatch(userData: any, matchSocketId: string) {
    const io = getSocket();
    const { socketId, username, email } = userData;
  
    const matchUserData = await redisClient.hGetAll(`user:${matchSocketId}`);
  
    if (!matchUserData.username || !matchUserData.email) {
        console.error(`matchUserData is missing required fields for socketId: ${matchSocketId}`);
        return;
    }
    
    // Notify both users
    // io.to(socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
    //     message: `You have been matched with ${matchUserData.username}`,
    //     category: userData.category || matchUserData.category || 'Any',
    //     difficulty: userData.difficulty || matchUserData.difficulty || 'Any',
    // });
  
    // io.to(matchSocketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
    //     message: `You have been matched with ${username}`,
    //     category: matchUserData.category || userData.category || 'Any',
    //     difficulty: matchUserData.difficulty || userData.difficulty || 'Any',
    // });
  
    if (process.env.ENABLE_LOGGING) {
        const matchingEvent = new MatchingEventModel({
            user1: { username, email },
            user2: { username: matchUserData.username, email: matchUserData.email },
            category: userData.category || matchUserData.category || 'Any',
            difficulty: userData.difficulty || matchUserData.difficulty || 'Any',
        });
        await matchingEvent.save();
    }
    
    await redisClient.publish(SOCKET_EVENTS.MATCH_FOUND, JSON.stringify({
        user1: userData,
        user2: matchUserData,
    }));
  
    // Remove matched users from all queues and data
    // await removeUserFromQueues(socketId, userData);
    // await removeUserFromQueues(matchSocketId, matchUserData);

    await redisClient.set(`matched:${userData.socketId}`, '1', { EX: 60 });
    await redisClient.set(`matched:${matchSocketId}`, '1', { EX: 60 });
  
    await redisClient.del(`user:${socketId}`);
    await redisClient.del(`user:${matchSocketId}`);
}

async function removeUserFromQueues(socketId: string, userData: any) {
    const { difficulty, category } = userData;

    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    const hasCategory = typeof category === 'string' && category.trim() !== '';

    const queues = [];

    if (hasDifficulty && hasCategory) {
        const queueKey1 = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey1);

        const queueKey2 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey2);

        const queueKey3 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey3);
    } else if (hasDifficulty) {
        const queueKey1 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey1);

        const queueKey2 = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey2);
    } else if (hasCategory) {
        const queueKey1 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey1);

        const queueKey2 = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey2);
    } else {
        const queueKey = generateQueueKey(QueueType.General);
        queues.push(queueKey);
    }

    for (const queueKey of queues) {
        await redisClient.lRem(queueKey, 0, socketId);
        console.log(`Removed ${socketId} from ${queueKey}`);
    }
}

export async function cancelMatch(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
        const { socketId } = request.params;
        const io = getSocket();
    
        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }
  
        const userKey = `user:${socketId}`;
  
        const userData = await redisClient.hGetAll(userKey);
        if (Object.keys(userData).length > 0) {
            await removeUserFromQueues(socketId, userData);
            await redisClient.del(userKey);
        }
  
        console.log(`User ${socketId} canceled their match request via REST API.`);
        return response.status(200).json({ message: "Match request canceled." });
    } catch (error) {
        next(error);
    }
}
  

export function setupSocketListeners() {
    const io = getSocket();
  
    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
        console.log(`User connected: ${socket.id}`);
    
        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: string; difficulty: string; username: string; email: string; }) => {
            const { category, difficulty, username, email } = requestData;
            if (!category || !difficulty || !username || username.trim() === '' || !email || email.trim() === '') {
                console.error("Missing field - All fields must be strings. Empty category/difficulty are to be empty strings. username and email cannot be empty.");
            }
            const socketId = socket.id;
    
            if (!isValidSocketId(io, socketId)) {
                socket.emit('error', { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }
  
            const userKey = `user:${socketId}`;
            const userData = {
                username,
                email,
                category: category,
                difficulty: difficulty,
                socketId,
                requestedAt: Date.now(),
            };
            await redisClient.hSet(userKey, userData);
  
            const matchSocketId = await findMatchForUser(userData);
    
            if (matchSocketId) {
                await handleMatch(userData, matchSocketId);
            } else {
                await addUserToQueues(userData);
            }
        });
  
        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async () => {
            const socketId = socket.id;
            const userKey = `user:${socketId}`;
    
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                await removeUserFromQueues(socketId, userData);
                await redisClient.del(userKey);
            }
    
            console.log(`User ${socketId} canceled their match request.`);
        });
  
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            const socketId = socket.id;
            console.log(`User disconnected: ${socketId}`);
            const userKey = `user:${socketId}`;
        
            // Check if user is in the middle of matching
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                const isMatched = await redisClient.get(`matched:${socketId}`);
                if (!isMatched) {
                    await removeUserFromQueues(socketId, userData);
                    await redisClient.del(userKey);
                }
            }
        });
    });
}

export async function setupSubscriber() {
    const subscriber = createRedisClient();
    await subscriber.connect();
  
    await subscriber.subscribe(SOCKET_EVENTS.MATCH_FOUND, (message) => {
        const { user1, user2 } = JSON.parse(message);
        console.log("Message received for user 1:")
        console.log(user1)
        console.log("Message received for user 2:")
        console.log(user2)

        const io = getSocket();
  
        const socket1 = io.sockets.sockets.get(user1.socketId);
        const socket2 = io.sockets.sockets.get(user2.socketId);
  
        // Add match processing code here in the future

        // Tell the users about the match here
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
    });
  
    subscriber.on('error', (err: any) => {
        console.error('Redis Subscriber Error', err);
    });
}
  