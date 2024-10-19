import React, { createContext, useReducer, useContext, ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { matchService } from "infrastructure/services/MatchService";

interface MatchmakingState {
    isMatching: boolean;
    matchFound: boolean;
    elapsedTime: number;
    connected: boolean;

    isModalVisible: boolean;
    countdown: number;
    matchFailed: boolean;
}

const initialState: MatchmakingState = {
    isMatching: false,
    matchFound: false,
    elapsedTime: 0,
    connected: false,
    isModalVisible: false,
    countdown: 3,
    matchFailed: false
};

type MatchmakingAction =
    | { type: "START_MATCHING" }
    | { type: "MATCH_FOUND" }
    | { type: "MATCH_FAILED" }
    | { type: "CANCEL_MATCHING" }
    | { type: "RESET" }
    | { type: "INCREMENT_TIME" }
    | { type: "SOCKET_CONNECTED" }
    | { type: "SOCKET_DISCONNECTED" }
    | { type: "INCREMENT_ATTEMPT" }
    | { type: "SHOW_MODAL" }
    | { type: "HIDE_MODAL" }
    | { type: "SET_COUNTDOWN"; payload: number };

const matchmakingReducer = (state: MatchmakingState, action: MatchmakingAction): MatchmakingState => {
    switch (action.type) {
        case "START_MATCHING":
            return { ...state, isMatching: true, matchFound: false, elapsedTime: 0, isModalVisible: true };
        case "MATCH_FOUND":
            return { ...state, isMatching: false, matchFound: true };
        case "MATCH_FAILED":
            return { ...state, isMatching: false, matchFailed: true, isModalVisible: true };
        case "CANCEL_MATCHING":
            return { ...state, isMatching: false, matchFound: false, isModalVisible: false };
        case "INCREMENT_TIME":
            return { ...state, elapsedTime: state.elapsedTime + 1 };
        case "SOCKET_CONNECTED":
            return { ...state, connected: true };
        case "SOCKET_DISCONNECTED":
            return { ...state, connected: false, isMatching: false };
        case "RESET":
            return { ...initialState, countdown: 3 };
        case "SHOW_MODAL":
            return { ...state, isModalVisible: true };
        case "HIDE_MODAL":
            return { ...state, isModalVisible: false };
        case "SET_COUNTDOWN":
            return { ...state, countdown: action.payload };
        default:
            return state;
    }
};

const MatchmakingContext = createContext<{
    state: MatchmakingState;
    dispatch: React.Dispatch<MatchmakingAction>;
    startMatching: (username: string, email: string, category: string, difficulty: string) => void;
    cancelMatching: () => void;
    reset: () => void;
    closeModal: () => void;
    showModal: () => void;
}>({
    state: initialState,
    dispatch: () => null,
    startMatching: () => {},
    cancelMatching: () => {},
    reset: () => {},
    closeModal: () => {},
    showModal: () => {}
});

export const MatchmakingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(matchmakingReducer, initialState);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    const startTimer = () => {
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                dispatch({ type: "INCREMENT_TIME" });
            }, 1000);
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startMatching = (username: string, email: string, category: string, difficulty: string) => {
        reset();
        matchService
            .ensureConnected()
            .then(() => {
                dispatch({ type: "SOCKET_CONNECTED" });
                matchService.startMatch(username, email, category, difficulty);
                dispatch({ type: "START_MATCHING" });
                startTimer();

                setTimeout(() => {
                    if (!state.matchFound) {
                        dispatch({ type: "MATCH_FAILED" });
                        stopTimer();
                    }
                }, 30000);
            })
            .catch(() => {
                dispatch({ type: "SOCKET_DISCONNECTED" });
            });
    };

    const cancelMatching = () => {
        matchService.cancelMatch();
        matchService.disconnect();
        dispatch({ type: "CANCEL_MATCHING" });
        dispatch({ type: "SOCKET_DISCONNECTED" });
        stopTimer();
        reset();
    };

    const reset = () => {
        dispatch({ type: "RESET" });
        stopTimer();
        if (navigationTimerRef.current) {
            clearTimeout(navigationTimerRef.current);
            navigationTimerRef.current = null;
        }
    };

    const closeModal = () => {
        dispatch({ type: "HIDE_MODAL" });
    };

    const showModal = () => {
        dispatch({ type: "SHOW_MODAL" });
    };

    useEffect(() => {
        if (state.matchFound) {
            stopTimer();
            let countdown = state.countdown;
            const intervalId = setInterval(() => {
                if (countdown > 0) {
                    dispatch({ type: "SET_COUNTDOWN", payload: countdown - 1 });
                    countdown--;
                } else {
                    clearInterval(intervalId);
                    reset();
                    navigate("/questions");
                }
            }, 1000);
            return () => clearInterval(intervalId);
        }
    }, [state.matchFound, state.countdown, navigate, reset]);

    useEffect(() => {
        matchService.onMatchFound((data) => {
            dispatch({ type: "MATCH_FOUND" });
        });
    }, [dispatch]);

    return (
        <MatchmakingContext.Provider
            value={{ state, dispatch, startMatching, cancelMatching, reset, closeModal, showModal }}
        >
            {children}
        </MatchmakingContext.Provider>
    );
};

export const useMatchmaking = () => useContext(MatchmakingContext);
