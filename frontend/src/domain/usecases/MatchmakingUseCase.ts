// src/domain/useCases/matchmakingUseCase.ts
import { useEffect, useCallback } from "react";
import { socketService } from "infrastructure/services/SocketService";
import { useMatchmaking } from "../context/MatchmakingContext";

export const useMatchmakingUseCase = () => {
    const { state, dispatch } = useMatchmaking();

    const updateConnectionStatus = useCallback((isConnected: boolean) => {
        dispatch({ type: isConnected ? "SOCKET_CONNECTED" : "SOCKET_DISCONNECTED" });
    }, [dispatch]);

    useEffect(() => {
        socketService.onConnect(() => updateConnectionStatus(true));
        socketService.onDisconnect(() => updateConnectionStatus(false));
        socketService.onMatchingStart(() => dispatch({ type: "START_MATCHING" }));
        socketService.onMatchFound(() => dispatch({ type: "MATCH_FOUND" }));
        socketService.onCancelMatching(() => dispatch({ type: "CANCEL_MATCHING" }));

        updateConnectionStatus(socketService.isConnected());

        return () => {
            socketService.disconnect();
        };
    }, [dispatch, updateConnectionStatus]);

    const connectSocket = useCallback(() => {
        socketService.connect();
        updateConnectionStatus(true);
    }, [updateConnectionStatus]);

    const disconnectSocket = useCallback(() => {
        socketService.disconnect();
        updateConnectionStatus(false);
    }, [updateConnectionStatus]);

    const startMatching = useCallback(() => {
        if (state.attempts < state.maxRetries) {
            socketService.startMatching();
            dispatch({ type: "START_MATCHING" });
            dispatch({ type: "INCREMENT_ATTEMPT" });
        } else {
            console.log("Max retries reached.");
            cancelMatching(); // cancel if retries are exhausted
        }
    }, [dispatch, state.attempts, state.maxRetries]);

    const cancelMatching = useCallback(() => {
        socketService.cancelMatching();
        dispatch({ type: "CANCEL_MATCHING" });
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, [dispatch]);

    const incrementTime = useCallback(() => {
        dispatch({ type: "INCREMENT_TIME" });
    }, [dispatch]);

    return {
        state,
        connectSocket,
        disconnectSocket,
        startMatching,
        cancelMatching,
        reset,
        incrementTime,
    };
};
