// matchingController.ts
import { Request, Response, NextFunction } from "express";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "../constants/socketEventNames";
import { MATCHING_STATUS } from "../constants/matchingStatus";
import redisClient, { logAllQueues, luaScript } from "../utils/redisClient";
import MatchingEventModel from "../models/MatchingEvent";
import { Server } from "socket.io";

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
        queues.push(`queue:combined:${difficulty}:${category}`);
        queues.push(`queue:difficulty:${difficulty}`);
        queues.push(`queue:category:${category}`);
    } else if (hasDifficulty) {
        queues.push(`queue:difficulty:${difficulty}`);
        queues.push(`queue:combined:${difficulty}:*`);
    } else if (hasCategory) {
        queues.push(`queue:category:${category}`);
        queues.push(`queue:combined:*:${category}`);
    } else {
        queues.push(`queue:general`);
    }
  
    for (const queueKey of queues) {
        const isMember = await redisClient.lPos(queueKey, socketId);
        if (isMember === null) {
            await redisClient.rPush(queueKey, socketId);
        }
    }
}

async function findMatchForUser(userData: any): Promise<string | null> {
    const { socketId, difficulty, category } = userData;
  
    // Prepare queue keys in order of specificity
    const queueKeys: string[] = [];
  
    // 1. Combined Queue
    if (difficulty && category) {
        queueKeys.push(`queue:combined:${difficulty}:${category}`);
    }
  
    // 2. Difficulty Queue
    if (difficulty) {
        queueKeys.push(`queue:difficulty:${difficulty}`);
    }
  
    // 3. Category Queue
    if (category) {
        queueKeys.push(`queue:category:${category}`);
    }
  
    // 4. General Queue
    queueKeys.push('queue:general');
  
    try {
        // Prepare arguments for EVAL command
        const args = [socketId];
    
        // Execute the Lua script using redisClient.eval
        const result = await redisClient.eval(luaScript, {
            keys: queueKeys,
            arguments: args,
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
  
    // Notify both users
    io.to(socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        message: `You have been matched with ${matchUserData.username}`,
        category: userData.category || matchUserData.category || 'Any',
        difficulty: userData.difficulty || matchUserData.difficulty || 'Any',
    });
  
    io.to(matchSocketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        message: `You have been matched with ${username}`,
        category: matchUserData.category || userData.category || 'Any',
        difficulty: matchUserData.difficulty || userData.difficulty || 'Any',
    });
  
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
  
    // Remove matched users from all queues and data
    await removeUserFromQueues(socketId, userData);
    await removeUserFromQueues(matchSocketId, matchUserData);
  
    await redisClient.del(`user:${socketId}`);
    await redisClient.del(`user:${matchSocketId}`);
}

async function removeUserFromQueues(socketId: string, userData: any) {
    const { difficulty, category } = userData;
  
    if (difficulty && category) {
        await redisClient.lRem(`queue:combined:${difficulty}:${category}`, 0, socketId);
        await redisClient.lRem(`queue:difficulty:${difficulty}`, 0, socketId);
        await redisClient.lRem(`queue:category:${category}`, 0, socketId);
    } else if (difficulty) {
        await redisClient.lRem(`queue:difficulty:${difficulty}`, 0, socketId);
        await redisClient.lRem(`queue:combined:${difficulty}:*`, 0, socketId);
    } else if (category) {
        await redisClient.lRem(`queue:category:${category}`, 0, socketId);
        await redisClient.lRem(`queue:combined:*:${category}`, 0, socketId);
    } else {
        await redisClient.lRem(`queue:general`, 0, socketId);
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
    
            // Remove user from all queues
            const userData = await redisClient.hGetAll(userKey);
            if (Object.keys(userData).length > 0) {
                await removeUserFromQueues(socketId, userData);
                // Delete user data
                await redisClient.del(userKey);
            }
        });
    });
}
