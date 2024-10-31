import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
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

    const [roomId, setRoomId] = useState<string | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [execResult, setExecResult] = useState<CodeExecResult | null>(null);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [binding, setBinding] = useState<MonacoBinding | null>(null);

    // Connect to the server-managed Yjs document when roomId is set
    useEffect(() => {
        if (roomId == null) {
            console.log(`RoomId is null!`)
            return;
        }
        console.log(`Starting Collaboration Context with roomId: ${roomId}`)

        const provider = new WebsocketProvider(`ws://localhost:3004/${roomId}`, roomId, new Y.Doc());
        setProvider(provider);

        provider.awareness.setLocalStateField(USERNAME, username);
        provider.awareness.on("change", (update: any) => {
            const users = Array.from(provider.awareness.getStates().values());
            setConnectedUsers(users.map((user) => user[USERNAME]));
            // TODO: Some UI feedback about connection status of the other user
        });

        return () => {
            provider?.destroy();
        };
    }, [roomId]);

    // Set up Monaco editor with server-managed Yjs document
    useEffect(() => {
        if (provider == null || editor == null || editor.getModel() == null) {
            return;
        }

        // Access the server-managed ydoc via provider.doc
        const ytext = provider.doc.getText("monaco");
        const binding = new MonacoBinding(ytext, editor.getModel()!, new Set([editor]), provider.awareness);
        setBinding(binding);

        // Listen for changes in selected language from the shared Yjs map
        const ymap = provider.doc.getMap("sharedMap");
        ymap.observe((event) => {
            event.changes.keys.forEach((change, key) => {
                if (key === SELECTED_LANGUAGE) {
                    const language: Language = ymap.get(SELECTED_LANGUAGE) as Language;
                    setSelectedLanguage(language);
                    const model = editor.getModel();
                    monaco.editor.setModelLanguage(model!, language.language);
                }
            });
        });

        // Initialize editor language from the shared Yjs map
        const language = ymap.get(SELECTED_LANGUAGE) as Language;
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model!, language?.language ?? "javascript");

        return () => binding.destroy();
    }, [provider, editor]);

    useEffect(() => {
        console.log("Initialising Languages!");
        initialiseLanguages();
    }, []);

    const initialiseLanguages = async () => {
        // Initialise language dropdown
        const allLanguages = monaco.languages.getLanguages();
        const pistonLanguageVersions = await PistonClient.getLanguageVersions();
        setLanguages(
            allLanguages
                .filter((lang) => pistonLanguageVersions.some((pistonLang: any) => pistonLang.language === lang.id))
                .map((lang) => ({
                    alias: lang.aliases && lang.aliases.length > 0 ? lang.aliases[0] : lang.id,
                    language: lang.id,
                    version: pistonLanguageVersions.find((pistonLang: any) => pistonLang.language === lang.id)?.version
                }))
        );
    };

    const handleChangeLanguage = (lang: Language) => {
        const ymap = provider?.doc.getMap("sharedMap");
        ymap?.set(SELECTED_LANGUAGE, lang);
    };

    const handleExecuteCode = async () => {
        try {
            setIsExecuting(true);
            const sourceCode = editor?.getValue();
            if (!sourceCode) {
                // TODO
                return;
            }
            const output: CodeExecResult = await PistonClient.executeCode(selectedLanguage, sourceCode);
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
                connectedUsers
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
