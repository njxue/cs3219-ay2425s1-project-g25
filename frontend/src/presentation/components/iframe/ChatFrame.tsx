// ChatFrame.tsx
import React from "react";
import styles from "./ChatFrame.module.css";

interface ChatFrameProps {
    roomId: string;
}

const ChatFrame: React.FC<ChatFrameProps> = ({ roomId }) => {
    const chatUrl = `http://localhost:5173/Assistant`;

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
