// ChatFrame.tsx
import React from "react";
import styles from "./ChatFrame.module.css";
import AuthClientStore from "data/auth/AuthClientStore";

interface ChatFrameProps {
    roomId: string;
}

const ChatFrame: React.FC<ChatFrameProps> = ({ roomId }) => {
    const token = AuthClientStore.getAccessToken();
    const chatUrl = `http://localhost:7000/chat/${encodeURIComponent(roomId)}?token=${token}`;

    return (
        <div className={styles.chatFrameWrapper}>
            <iframe
                src={chatUrl}
                className={styles.chatFrame}
                title="Chat Embed"
                allow="camera; microphone; fullscreen; display-capture"
            />
        </div>
    );
};

export default ChatFrame;
