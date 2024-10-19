import { socketService } from "./SocketService";

class MatchService {
    private onMatchFoundCallbacks: ((data: any) => void)[] = [];
    private onMatchCancelCallbacks: ((data: any) => void)[] = [];
    private eventsRegistered: boolean = false;

    private setupEventListeners() {
        if (this.eventsRegistered) return;

        socketService.on("matchFound", (data) => {
            console.log("MatchService: Match found:", data);
            this.onMatchFoundCallbacks.forEach(callback => callback(data));
            this.disconnect(); 
        });

        socketService.on("cancelMatching", (data) => {
            console.log("MatchService: Match canceled:", data);
            this.onMatchCancelCallbacks.forEach(callback => callback(data));
        });

        this.eventsRegistered = true;
    }

    public ensureConnected(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                resolve();
            } else {
                socketService.connect();

                socketService.onConnect(() => {
                    console.log("MatchService: Socket connected, registering event listeners.");
                    this.setupEventListeners();
                    resolve();
                });

                socketService.onDisconnect(() => {
                    console.log("MatchService: Socket disconnected.");
                    reject("Socket disconnected before it could connect.");
                });
            }
        });
    }

    startMatch(username: string, email: string, category: string, difficulty: string) {
        return this.ensureConnected()
            .then(() => {
                const requestData = { username, email, category, difficulty };
                console.log("MatchService: Starting match with data:", requestData);
                socketService.emit('startMatching', requestData);
            })
            .catch((error) => {
                console.error("MatchService: Failed to start match:", error);
            });
    }

    cancelMatch() {
        return this.ensureConnected()
            .then(() => {
                console.log("MatchService: Canceling match.");
            })
            .catch((error) => {
                console.error("MatchService: Failed to cancel match:", error);
            });
    }

    disconnect() {
        console.log("MatchService: Disconnecting socket.");
        socketService.disconnect();
    }

    isConnected() {
        return socketService.isConnected();
    }

    onMatchFound(callback: (data: any) => void) {
        this.onMatchFoundCallbacks.push(callback);
    }

    onMatchCancel(callback: (data: any) => void) {
        this.onMatchCancelCallbacks.push(callback);
    }
}

export const matchService = new MatchService();
