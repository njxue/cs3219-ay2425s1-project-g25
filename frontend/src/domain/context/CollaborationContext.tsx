import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from "react";
import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { COLLABORATION_AWARENESS_KEYS, COLLABORATION_YMAP_KEYS } from "presentation/utils/constants";
import PistonClient from "data/piston/PistonClient";
import { Language } from "domain/entities/Language";
import { CodeExecResult } from "domain/entities/CodeExecResult";

interface CollaborationContextType {
    onEditorIsMounted: (editor: monaco.editor.IStandaloneCodeEditor) => void;
    selectedLanguage: Language;
    languages: Language[];
    handleChangeLanguage: (lang: Language) => void;
    handleExecuteCode: () => Promise<void>;
    isExecuting: boolean;
    execResult: CodeExecResult | null;
    setRoomId: (roomId: string) => void;
    connectedUsers: string[];
    disconnect: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const username = user?.username;

    const { USERNAME } = COLLABORATION_AWARENESS_KEYS;
    const { SELECTED_LANGUAGE } = COLLABORATION_YMAP_KEYS;

    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "javascript",
        version: "1.32.3",
        alias: "Javascript"
    });

    const ydoc = useMemo(() => new Y.Doc(), []);
    const ymap: Y.Map<any> = useMemo(() => ydoc.getMap("sharedMap"), [ydoc]);

    const [roomId, setRoomId] = useState<string | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [execResult, setExecResult] = useState<CodeExecResult | null>(null);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [binding, setBinding] = useState<MonacoBinding | null>(null);

    const disconnect = useCallback(() => {
        binding?.destroy();
        provider?.destroy();
        ydoc?.destroy();
        setConnectedUsers([]);
        setProvider(null);
        setBinding(null);
        setRoomId(null);
    }, [binding, provider, ydoc]);

    useEffect(() => {
        if (!roomId) return;

        const newProvider = new WebsocketProvider("ws://localhost:1234", roomId, ydoc);
        setProvider(newProvider);

        newProvider.awareness.setLocalStateField(USERNAME, username);
        newProvider.awareness.on("change", () => {
            const users = Array.from(newProvider.awareness.getStates().values());
            const uniqueUsers = new Set(users.map((user) => user[USERNAME])); // Use Set for uniqueness
            setConnectedUsers(Array.from(uniqueUsers)); // Convert Set back to Array
        });

        return () => {
            disconnect();
        };
    }, [ydoc, roomId, username, USERNAME, disconnect]);

    useEffect(() => {
        if (!provider || !editor?.getModel()) return;

        const newBinding = new MonacoBinding(
            ydoc.getText("monaco"),
            editor.getModel()!,
            new Set([editor]),
            provider.awareness
        );
        setBinding(newBinding);

        ymap.observe((event) => {
            event.changes.keys.forEach((change, key) => {
                if (key === SELECTED_LANGUAGE) {
                    const language: Language = ymap.get(SELECTED_LANGUAGE);
                    setSelectedLanguage(language);
                    monaco.editor.setModelLanguage(editor.getModel()!, language.language);
                }
            });
        });

        const language: Language = ymap.get(SELECTED_LANGUAGE);
        monaco.editor.setModelLanguage(editor.getModel()!, language?.language ?? "javascript");

        return () => newBinding.destroy();
    }, [ydoc, provider, editor, ymap, SELECTED_LANGUAGE]);

    useEffect(() => {
        initialiseLanguages();
    }, []);

    const initialiseLanguages = async () => {
        const allLanguages = monaco.languages.getLanguages();
        const pistonLanguageVersions = await PistonClient.getLanguageVersions();
        setLanguages(
            allLanguages
                .filter((lang) => pistonLanguageVersions.some((pistonLang: any) => pistonLang.language === lang.id))
                .map((lang) => ({
                    alias: lang.aliases?.[0] || lang.id,
                    language: lang.id,
                    version: pistonLanguageVersions.find((pistonLang: any) => pistonLang.language === lang.id)?.version
                }))
        );
    };

    const handleChangeLanguage = (lang: Language) => {
        ymap.set(SELECTED_LANGUAGE, lang);
    };

    const handleExecuteCode = async () => {
        try {
            setIsExecuting(true);
            const sourceCode = editor?.getValue();
            if (!sourceCode) return;

            const output = await PistonClient.executeCode(selectedLanguage, sourceCode);
            setExecResult(output);
        } catch (e) {
            toast.error("There was an issue running the code");
        } finally {
            setIsExecuting(false);
        }
    };

    const onEditorIsMounted = (editor: monaco.editor.IStandaloneCodeEditor) => {
        setEditor(editor);
    };

    return (
        <CollaborationContext.Provider
            value={{
                onEditorIsMounted,
                setRoomId,
                selectedLanguage,
                languages,
                handleChangeLanguage,
                handleExecuteCode,
                isExecuting,
                execResult,
                connectedUsers,
                disconnect
            }}
        >
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
