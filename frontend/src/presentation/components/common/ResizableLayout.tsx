import React, { ReactNode, useState } from "react";
import Resizable from "react-resizable-layout";

interface ResizableLayoutProps {
    initialWidth?: number;
    minWidth?: number;
    leftBlock: ReactNode;
    rightBlock: ReactNode;
}
const ResizableLayout: React.FC<ResizableLayoutProps> = ({
    initialWidth = 300,
    minWidth = 300,
    leftBlock,
    rightBlock
}) => {
    return (
        <Resizable axis={"x"}>
            {({ position, separatorProps }) => (
                <div className="wrapper">
                    <div style={{ width: position }}>{leftBlock}</div>
                    <div {...separatorProps} />
                    <div style={{ flex: 1 }}>{rightBlock}</div>
                </div>
            )}
        </Resizable>
    );
};

export default ResizableLayout;
