import React, { useState, useEffect, useRef } from "react";
import styles from "./CodeEditor.module.css";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button, Select } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";

interface CodeEditorProps {
    initialLanguage?: string;
    roomId: string;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ roomId }) => {
    const { initialiseEditor, languages, selectedLanguage, handleChangeLanguage } = useCollaboration();

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        initialiseEditor(roomId, editor, monaco);
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <Select
                    variant="borderless"
                    style={{ width: "150px" }}
                    placeholder="Select language"
                    options={languages}
                    value={selectedLanguage}
                    onChange={handleChangeLanguage}
                />
            </div>
            <div className={styles.editor}>
                <Editor
                    theme="vs-light"
                    language={selectedLanguage}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        scrollbar: { verticalScrollbarSize: 4 },
                        formatOnPaste: true
                    }}
                />
            </div>
            <div className={styles.buttonGroup}>
                <Button className={styles.runButton}>Run</Button>
                <Button className={styles.submitButton}>Submit</Button>
            </div>
        </div>
    );
};

export default CodeEditor;
