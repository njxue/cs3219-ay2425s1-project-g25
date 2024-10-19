import React from "react";
import { Button, Tooltip } from "antd";
import { useMatchmaking } from "domain/context/MatchmakingContext";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const MatchingFloatingButton: React.FC = () => {
    const { state, showModal } = useMatchmaking();
    const { isMatching, matchFound, matchFailed } = state;

    const getButtonProps = () => {
        if (isMatching) {
            return {
                icon: <LoadingOutlined />,
                style: { backgroundColor: "#1890ff" },
                tooltipTitle: "Matching in progress..."
            };
        } else if (matchFound) {
            return {
                icon: <CheckCircleOutlined />,
                style: { backgroundColor: "#52c41a" },
                tooltipTitle: "Match found!"
            };
        } else if (matchFailed) {
            return {
                icon: <CloseCircleOutlined />,
                style: { backgroundColor: "#ff4d4f" },
                tooltipTitle: "Matching failed. Click to retry."
            };
        } else {
            return null;
        }
    };

    const handleButtonClick = () => {
        showModal();
    };

    const buttonProps = getButtonProps();

    if (!buttonProps) {
        return null;
    }

    const { icon, style, tooltipTitle } = buttonProps;

    return (
        <Tooltip title={tooltipTitle}>
            <Button
                type="primary"
                shape="circle"
                icon={icon}
                style={{
                    ...style,
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                }}
                onClick={handleButtonClick}
            />
        </Tooltip>
    );
};

export default MatchingFloatingButton;
