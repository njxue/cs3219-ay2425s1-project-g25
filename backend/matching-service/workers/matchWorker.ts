import redisClient from '../utils/redisClient';
import { getSocket } from '../utils/socket';
import MatchingEventModel from '../models/MatchingEvent';
import { SOCKET_EVENTS } from '../constants/socketEventNames';

// Configurable settings for time-based relaxing the matching criteria
const MATCHING_INTERVAL = parseInt(process.env.MATCHING_INTERVAL || "3000");
const RELAXATION_INTERVAL = parseInt(process.env.RELAXATION_INTERVAL || "10000");
const MATCH_TIMEOUT = parseInt(process.env.MATCH_TIMEOUT || "30000");

/**
 * Starts the matchmaking worker that periodically attempts to match users
 * and handles timeout scenarios by emitting MATCH_FAILED events.
 */
export async function matchingWorker() {
    setInterval(async () => {
        try {
            const now = Date.now();

            // Get all users from the sorted set
            const userKeys = await redisClient.zRange('matching_queue', 0, -1);

            // Map userKeys to userData
            const users = await Promise.all(
                userKeys.map(async (userKey) => {
                    const userData = await redisClient.hGetAll(userKey);
                    return userData ? { userKey, userData } : null;
                })
            );

            // Filter out null entries
            const validUsers = users.filter((u) => u !== null) as Array<{ userKey: string; userData: any }>;

            // Sort users by requestedAt to prioritize earlier requests
            validUsers.sort((a, b) => parseInt(a.userData.requestedAt, 10) - parseInt(b.userData.requestedAt, 10));

            // Keep track of matched users to prevent multiple matches
            const matchedUsers = new Set<string>();

            // Attempt to match users
            for (let i = 0; i < validUsers.length; i++) {
                const { userKey: userKey1, userData: userData1 } = validUsers[i];

                if (matchedUsers.has(userKey1)) continue; // Skip if already matched

                // Check if user is still in the queue (may have been matched already)
                const isInQueue1 = await redisClient.zRank('matching_queue', userKey1);
                if (isInQueue1 === null) continue;

                const relaxationLevel1 = getRelaxationLevel(userData1);

                for (let j = i + 1; j < validUsers.length; j++) {
                    const { userKey: userKey2, userData: userData2 } = validUsers[j];

                    if (matchedUsers.has(userKey2)) continue; // Skip if already matched

                    // Check if user2 is still in the queue
                    const isInQueue2 = await redisClient.zRank('matching_queue', userKey2);
                    if (isInQueue2 === null) continue;

                    const relaxationLevel2 = getRelaxationLevel(userData2);

                    // Check mutual compatibility
                    if (canUsersMatch(userData1, userData2, relaxationLevel1, relaxationLevel2)) {
                        // Mark users as matched
                        matchedUsers.add(userKey1);
                        matchedUsers.add(userKey2);

                        // Remove both users from the queue
                        await redisClient.zRem('matching_queue', userKey1);
                        await redisClient.zRem('matching_queue', userKey2);

                        // Handle the match
                        await handleMatch(userData1, userData2);

                        break; // Move to the next user1
                    }
                }
            }

            // After matching, handle timeout for unmatched users
            await handleTimeouts(validUsers, now);
        } catch (error) {
            console.error('Error in matching worker:', error);
        }
    }, MATCHING_INTERVAL);
}

/**
 * Determines the relaxation level based on elapsed time.
 * @param userData - The user data object.
 * @returns The current relaxation level (0 to 2).
 */
function getRelaxationLevel(userData: any): number {
    const now = Date.now();
    const requestedAt = parseInt(userData.requestedAt, 10);
    const elapsedTime = now - requestedAt;

    if (elapsedTime <= RELAXATION_INTERVAL) {
        return 0; // No relaxation
    } else if (elapsedTime <= RELAXATION_INTERVAL * 2) {
        return 1; // Relax difficulty
    } else {
        return 2; // Relax category
    }
}

/**
 * Checks if two users can be matched based on their relaxation levels and criteria.
 * @param user1 - Data of the first user.
 * @param user2 - Data of the second user.
 * @param relaxationLevel1 - Relaxation level of the first user.
 * @param relaxationLevel2 - Relaxation level of the second user.
 * @returns True if users can be matched, else false.
 */
function canUsersMatch(user1: any, user2: any, relaxationLevel1: number, relaxationLevel2: number): boolean {
    // Get relaxed criteria for both users
    const relaxedCriteria1 = getRelaxedCriteria(relaxationLevel1, user1);
    const relaxedCriteria2 = getRelaxedCriteria(relaxationLevel2, user2);

    // Check if user1's original criteria are satisfied by user2's relaxed criteria
    const user1SatisfiedByUser2 = isCriteriaSatisfied(user1, relaxedCriteria2);

    // Check if user2's original criteria are satisfied by user1's relaxed criteria
    const user2SatisfiedByUser1 = isCriteriaSatisfied(user2, relaxedCriteria1);

    // Users can be matched if either condition is true
    return user1SatisfiedByUser2 || user2SatisfiedByUser1;
}

/**
 * Determines the relaxed criteria based on relaxation level.
 * @param relaxationLevel - The current relaxation level.
 * @param userData - The user data object.
 * @returns An object with relaxed category and difficulty.
 */
function getRelaxedCriteria(relaxationLevel: number, userData: any): { category: string; difficulty: string } {
    switch (relaxationLevel) {
        case 0:
            return { category: userData.category, difficulty: userData.difficulty };
        case 1:
            return { category: userData.category, difficulty: 'Any' }; // Relax difficulty
        case 2:
            return { category: 'Any', difficulty: userData.difficulty }; // Relax category
        default:
            return { category: userData.category, difficulty: userData.difficulty };
    }
}

/**
 * Checks if a user's criteria are satisfied by relaxed criteria.
 * @param user - The user data object.
 * @param relaxedCriteria - The relaxed criteria to satisfy.
 * @returns True if satisfied, else false.
 */
function isCriteriaSatisfied(user: any, relaxedCriteria: { category: string; difficulty: string }): boolean {
    const categoryMatch = relaxedCriteria.category === 'Any' || user.category === relaxedCriteria.category;
    const difficultyMatch = relaxedCriteria.difficulty === 'Any' || user.difficulty === relaxedCriteria.difficulty;
    return categoryMatch && difficultyMatch;
}

/**
 * Handles the match between two users.
 * Emits MATCH_FOUND event to both users and logs the match in MongoDB.
 * @param user1 - Data of the first user.
 * @param user2 - Data of the second user.
 */
async function handleMatch(user1: any, user2: any) {
    const io = getSocket();

    const socket1 = io.sockets.sockets.get(user1.socketId);
    const socket2 = io.sockets.sockets.get(user2.socketId);

    if (socket1 && socket2) {
        // Create MatchEvent in MongoDB
        const matchingEvent = new MatchingEventModel({
            user1: { username: user1.username, email: user1.email },
            user2: { username: user2.username, email: user2.email },
            category: user1.category || user2.category || 'Any',
            difficulty: user1.difficulty || user2.difficulty || 'Any',
        });
        const savedEvent = await matchingEvent.save();

        // Emit match found event to both users, including the MatchEvent _id
        socket1.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user2.username}`,
            category: user1.category || user2.category || 'Any',
            difficulty: user1.difficulty || user2.difficulty || 'Any',
            matchId: savedEvent._id,
        });

        socket2.emit(SOCKET_EVENTS.MATCH_FOUND, {
            message: `You have been matched with ${user1.username}`,
            category: user2.category || user1.category || 'Any',
            difficulty: user2.difficulty || user1.difficulty || 'Any',
            matchId: savedEvent._id,
        });
    }

    // Remove user data from Redis
    await redisClient.del(`user:${user1.socketId}`);
    await redisClient.del(`user:${user2.socketId}`);
}

/**
 * Handles timeout scenarios by emitting MATCH_FAILED events to users
 * whose match requests have exceeded MATCH_TIMEOUT.
 * @param validUsers - Array of valid user objects currently in the queue.
 * @param currentTime - The current timestamp.
 */
async function handleTimeouts(validUsers: Array<{ userKey: string; userData: any }>, currentTime: number) {
    const io = getSocket();

    for (const { userKey, userData } of validUsers) {
        const requestedAt = parseInt(userData.requestedAt, 10);
        const elapsedTime = currentTime - requestedAt;

        if (elapsedTime >= MATCH_TIMEOUT) {
            const socketId = userData.socketId;
            const socket = io.sockets.sockets.get(socketId);

            if (socket && socket.connected) {
                // Emit MATCH_FAILED event
                socket.emit(SOCKET_EVENTS.MATCH_FAILED, {
                    message: "Match timed out. Please try again.",
                });
                console.log(`Emitted MATCH_FAILED to ${socketId} due to timeout.`);

                // Remove user from the queue and delete their data
                await redisClient.zRem('matching_queue', userKey);
                await redisClient.del(userKey);
                console.log(`Stale user ${socketId} has been cleaned up.`);
            }
        }
    }
}
