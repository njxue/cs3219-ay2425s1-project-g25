import React, { useState, useEffect, useRef } from "react";
import styles from "./CodeEditor.module.css";
import Editor, { Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { Button, Select } from "antd";

interface CodeEditorProps {
    initialLanguage?: string;
    roomId: string;
    userId: string;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ initialLanguage = "javascript", roomId, userId }) => {
    const [languages, setLanguages] = useState<{ label: string; value: string }[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);

    const editorRef = useRef(null);
    const monacoRef = useRef<Monaco | null>(null); // useMonaco() not working for some reason
    const bindingRef = useRef<MonacoBinding | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        // Populate languages
        editorRef.current = editor;
        monacoRef.current = monaco;
        const allLanguages = monaco.languages.getLanguages();
        setLanguages(allLanguages.map((lang) => ({ label: lang.id, value: lang.id })));

        // Set up shared doc
        const doc = new Y.Doc();
        const provider = new WebsocketProvider("ws://localhost:1234", roomId, doc);
        provider.on("status", (event: any) => {
            console.log(event.status);
        });
        providerRef.current = provider;
        const type = doc.getText("monaco");
        const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness);
        bindingRef.current = binding;

        // Initialise awareness state
        provider.awareness.setLocalStateField("userId", userId);
        provider.awareness.setLocalStateField("selectedLanguage", selectedLanguage);

        provider.awareness.on("change", ({ updated }: { updated: any }) => {
            updated.forEach((id: number) => {
                const trigger = provider.awareness.getStates().get(id);
                if (trigger && trigger.selectedLanguage) {
                    if (trigger.userId !== userId) {
                        setSelectedLanguage(trigger.selectedLanguage);
                    }
                }
            });
        });
    }

    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.disconnect();
        };
    }, []);

    const handleChangeLanguage = (lang: string) => {
        setSelectedLanguage(lang);
        providerRef.current?.awareness.setLocalStateField("selectedLanguage", lang);
    };

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
