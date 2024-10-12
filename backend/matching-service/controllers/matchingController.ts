// matchingController.ts
import { Request, Response, NextFunction } from "express";
import matchingRequestModel from "../models/MatchingRequest";
import { getSocket } from "../utils/socket";
import { SOCKET_EVENTS } from "constants/socketEventNames";

export async function getMatch(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const io = getSocket();

        const { username, email, category, difficulty, socketId } = request.body;

        const newRequest = new matchingRequestModel({
            username,
            email,
            category,
            difficulty,
            socketId
        });

        await newRequest.save();

        // Try to find a match in MongoDB based on category and difficulty
        const match = await findMatch(category, difficulty, username);

        if (match) {
            io.to(match.socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
                message: `You have been matched with ${username}`,
                category,
                difficulty,
            });

            io.to(socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
                message: `You have been matched with ${match.username}`,
                category,
                difficulty,
            });

            // Remove matched users from MongoDB
            await matchingRequestModel.findByIdAndDelete(match._id);
            await matchingRequestModel.findByIdAndDelete(newRequest._id);

            return response.status(200).json({ message: 'Match found!' });
        } else {
            return response.status(200).json({ message: 'Searching for a match...' });
        }
    } catch (error) {
        next(error);
    }
}

// Helper function to find a match in MongoDB
async function findMatch(category: string, difficulty: string, currentUser: string) {
    const matchByCategory = await matchingRequestModel.findOne({
        category,
        username: { $ne: currentUser },  // Ensure we don’t match with ourselves
    });

    if (matchByCategory) {
        return matchByCategory;
    }

    const matchByDifficulty = await matchingRequestModel.findOne({
        difficulty,
        username: { $ne: currentUser },
    });

    return matchByDifficulty;
}

// Cancel a match request
export async function cancelMatch(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const { socketId } = request.params;
        
        // Find and delete the matching request in MongoDB
        const deletedRequest = await matchingRequestModel.findOneAndDelete({ socketId });

        if (!deletedRequest) {
            return response.status(404).json({ message: 'No matching request found to cancel.' });
        }

        console.log(`User ${socketId} canceled their match request via REST API.`);
        return response.status(200).json({ message: 'Match request canceled.' });
    } catch (error) {
        next(error);
    }
}

// Listen for socket connections
export function setupSocketListeners() {
    const io = getSocket();

    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on(SOCKET_EVENTS.START_MATCHING, async (requestData: { category: any; difficulty: any; username: any; email: any; }) => {
            const { category, difficulty, username, email } = requestData;
            const match = await findMatch(category, difficulty, username);

            if (match) {
                io.to(match.socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
                    message: `You have been matched with ${username}`,
                    category,
                    difficulty,
                });

                io.to(socket.id).emit(SOCKET_EVENTS.MATCH_FOUND, {
                    message: `You have been matched with ${match.username}`,
                    category,
                    difficulty,
                });

                await matchingRequestModel.findByIdAndDelete(match._id);
                await matchingRequestModel.deleteMany({ username });
            }
        });

        socket.on(SOCKET_EVENTS.CANCEL_MATCHING, async (socketId: any) => {
            await matchingRequestModel.findOneAndDelete({ socketId });
            console.log(`User ${socketId} canceled their match request.`);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            console.log(`User disconnected: ${socket.id}`);
            await matchingRequestModel.findOneAndDelete({ socketId: socket.id });
        });
    });
}
