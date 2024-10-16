// matchingController.ts
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
  
        // Validate the socket ID
        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }
  
        // Store user data in Redis
        const userKey = `user:${socketId}`;
        const userData: Record<string, string> = {
            username,
            email,
            socketId,
            requestedAt: Date.now().toString(),
        };
        
        // Conditionally add 'category' and 'difficulty' only if they are provided and are strings
        if (typeof category === 'string' && category.trim() !== '') {
            userData.category = category.trim();
        }
        
        if (typeof difficulty === 'string' && difficulty.trim() !== '') {
            userData.difficulty = difficulty.trim();
        }
        await redisClient.hSet(userKey, userData);
        console.log("Before matching queue state:");
        await logAllQueues();
  
        // Try to find a match
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
            // No match found, add user to queues
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

// Redis helper functions
function isValidSocketId(io: Server, socketId: string): boolean {
    return io.sockets.sockets.has(socketId);
}

async function addUserToQueues(userData: any) {
    const { socketId, difficulty, category } = userData;

    const hasDifficulty = typeof difficulty === 'string' && difficulty.trim() !== '';
    const hasCategory = typeof category === 'string' && category.trim() !== '';

    // Define the queues to add the user to
    const queues = [];

    if (hasDifficulty && hasCategory) {
        // Add to combined queue
        const queueKey1 = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey1);
        // Add to difficulty queue
        const queueKey2 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey2);
        // Add to category queue
        const queueKey3 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey3);
    } else if (hasDifficulty) {
        // Add to difficulty queue
        const queueKey1 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey1);
        // Add to combined queue with wildcard category
        const queueKey2 = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey2);
    } else if (hasCategory) {
        // Add to category queue
        const queueKey1 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey1);
        // Add to combined queue with wildcard difficulty
        const queueKey2 = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey2);
    } else {
        // Add to general queue
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

    // Prepare queue keys in order of specificity
    const queueKeys: string[] = [];

    if (hasDifficulty && hasCategory) {
        // 1. Combined Queue with specific category and difficulty
        const queueKey = generateQueueKey(QueueType.All, category, difficulty);
        queueKeys.push(queueKey);
    }

    if (hasDifficulty) {
        // 2. Combined Queue with wildcard category
        const queueKey = generateQueueKey(QueueType.All, '*', difficulty);
        queueKeys.push(queueKey);
        // 3. Difficulty Only Queue
        const queueKey2 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queueKeys.push(queueKey2);
    }

    if (hasCategory) {
        // 4. Combined Queue with wildcard difficulty
        const queueKey = generateQueueKey(QueueType.All, category, '*');
        queueKeys.push(queueKey);
        // 5. Category Only Queue
        const queueKey2 = generateQueueKey(QueueType.Category, category, undefined);
        queueKeys.push(queueKey2);
    }

    // 6. General Queue
    const generalQueueKey = generateQueueKey(QueueType.General);
    queueKeys.push(generalQueueKey);

    try {
        // Execute the Lua script
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
  
    // Ensure that matchUserData has required fields
    if (!matchUserData.username || !matchUserData.email) {
        console.error(`matchUserData is missing required fields for socketId: ${matchSocketId}`);
        // Handle error appropriately (e.g., return, throw error)
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
  
    // Conditionally log the matching event
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

    // Define the queues to remove the user from
    const queues = [];

    if (hasDifficulty && hasCategory) {
        // Remove from combined queue
        const queueKey1 = generateQueueKey(QueueType.All, category, difficulty);
        queues.push(queueKey1);
        // Remove from difficulty queue
        const queueKey2 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey2);
        // Remove from category queue
        const queueKey3 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey3);
    } else if (hasDifficulty) {
        // Remove from difficulty queue
        const queueKey1 = generateQueueKey(QueueType.Difficulty, undefined, difficulty);
        queues.push(queueKey1);
        // Remove from combined queue with wildcard category
        const queueKey2 = generateQueueKey(QueueType.All, '*', difficulty);
        queues.push(queueKey2);
    } else if (hasCategory) {
        // Remove from category queue
        const queueKey1 = generateQueueKey(QueueType.Category, category, undefined);
        queues.push(queueKey1);
        // Remove from combined queue with wildcard difficulty
        const queueKey2 = generateQueueKey(QueueType.All, category, '*');
        queues.push(queueKey2);
    } else {
        // Remove from general queue
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
    
        // Validate the socket ID
        if (!isValidSocketId(io, socketId)) {
            return response.status(400).json({
                message: "Invalid socket ID. Please ensure you are connected.",
            });
        }
  
        const userKey = `user:${socketId}`;
  
        // Remove user from all queues
        const userData = await redisClient.hGetAll(userKey);
        if (Object.keys(userData).length > 0) {
            await removeUserFromQueues(socketId, userData);
            // Delete user data
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
            // console.log(requestData)
            if (!category || !difficulty || !username || username.trim() === '' || !email || email.trim() === '') {
                console.error("Missing field - All fields must be strings. Empty category/difficulty are to be empty strings. username and email cannot be empty.");
            }
            const socketId = socket.id;
    
            // Validate the socket ID (optional here since it's from the connected socket)
            if (!isValidSocketId(io, socketId)) {
                socket.emit('error', { message: 'Invalid socket ID. Please ensure you are connected.' });
                return;
            }
  
            // Store user data in Redis
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
  
            // Try to find a match
            const matchSocketId = await findMatchForUser(userData);
    
            if (matchSocketId) {
                await handleMatch(userData, matchSocketId);
            } else {
                // No match found, add user to queues
                await addUserToQueues(userData);
            }
        });
  
        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async () => {
            const socketId = socket.id;
            const userKey = `user:${socketId}`;
    
            // Remove user from all queues
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                await removeUserFromQueues(socketId, userData);
                // Delete user data
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
                // Determine if the user has already been matched
                const isMatched = await redisClient.get(`matched:${socketId}`);
                if (!isMatched) {
                    await removeUserFromQueues(socketId, userData);
                    // Delete user data
                    await redisClient.del(userKey);
                }
            }
        });
    });
}

export async function setupSubscriber() {
    // Create a new Redis client for subscribing
    const subscriber = createRedisClient();
    await subscriber.connect();
  
    // Subscribe to the MATCH_FOUND channel
    await subscriber.subscribe(SOCKET_EVENTS.MATCH_FOUND, (message) => {
        const { user1, user2 } = JSON.parse(message);
        console.log("Message received for user 1:")
        console.log(user1)
        console.log("Message received for user 2:")
        console.log(user2)

        const io = getSocket();
  
        // Get the Socket.IO clients
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
  