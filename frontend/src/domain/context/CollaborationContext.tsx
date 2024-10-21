import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useAuth } from "./AuthContext";

interface CollaborationContextType {
    initialiseEditor: (roomId: string, editor: any, monaco: Monaco) => void;
    selectedLanguage: string;
    languages: any;
    handleChangeLanguage: (lang: string) => void;
}
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id;

    const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
    const [languages, setLanguages] = useState<{ label: string; value: string }[]>([]);

    const editorRef = useRef(null);
    const monacoRef = useRef<Monaco | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    const initialiseEditor = (roomId: string, editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        const allLanguages = monaco.languages.getLanguages();

        // TODO: Filter all the useless ones like HTML
        setLanguages(allLanguages.map((lang) => ({ label: lang.id, value: lang.id })));
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
    };

    const handleChangeLanguage = (lang: string) => {
        setSelectedLanguage(lang);
        providerRef.current?.awareness.setLocalStateField("selectedLanguage", lang);
    };
    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.disconnect();
        };
    }, []);

    return (
        <CollaborationContext.Provider value={{ initialiseEditor, selectedLanguage, languages, handleChangeLanguage }}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error("useCollaboration must be used within a CollaborationProvider");
    }
    return context;
};
