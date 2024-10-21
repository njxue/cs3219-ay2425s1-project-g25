import React, { useState, useEffect, useRef } from "react";
import styles from "./CodeEditor.module.css";
import Editor, { Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebrtcProvider } from "y-webrtc";
import { Button, Select } from "antd";

interface CodeEditorProps {
    initialLanguage?: string;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ initialLanguage = "javascript" }) => {
    const [languages, setLanguages] = useState<{ label: string; value: string }[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);

    const editorRef = useRef(null);
    const monacoRef = useRef<Monaco | null>(null); // useMonaco() not working for some reason
    const bindingRef = useRef<MonacoBinding | null>(null);

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        const allLanguages = monaco.languages.getLanguages();
        setLanguages(allLanguages.map((lang) => ({ label: lang.id, value: lang.id })));

        const doc = new Y.Doc();

        // TODO: change to room-id emitted from matching service. Use y-websocket(?)
        const provider = new WebrtcProvider("test-room", doc);
        const type = doc.getText("monaco");
        const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness);
        bindingRef.current = binding;
    }

    useEffect(() => {
        return () => {
            bindingRef?.current?.destroy();
        };
    }, []);

    const handleChangeLanguage = (lang: string) => {
        setSelectedLanguage(lang);
        // TODO: Emit socket event
    };

    

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <Select
                    variant="borderless"
                    style={{ width: "150px" }}
                    placeholder="Select language"
                    options={languages}
                    defaultValue={"javascript"}
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
