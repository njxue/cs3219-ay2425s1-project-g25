import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { Monaco } from "@monaco-editor/react";
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
    initialiseEditor: (roomId: string, editor: any, monaco: Monaco) => void;
    selectedLanguage: Language;
    languages: Language[];
    handleChangeLanguage: (lang: Language) => void;
    handleExecuteCode: () => Promise<void>;
    isExecuting: boolean;
    execResult: CodeExecResult | null;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const username = user?.username;

    const { USERNAME } = COLLABORATION_AWARENESS_KEYS;
    const { SELECTED_LANGUAGE } = COLLABORATION_YMAP_KEYS;

    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "javascript",
        version: "",
        alias: "Javascript"
    });
    const [languages, setLanguages] = useState<Language[]>([]);

    const [execResult, setExecResult] = useState<CodeExecResult | null>(null);

    const [isExecuting, setIsExecuting] = useState<boolean>(false);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);
    const yMapRef = useRef<Y.Map<any> | null>(null);

    const initialiseEditor = async (roomId: string, editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        const { yDoc, provider, yMap } = initialiseYdoc(roomId);

        bindEditorToDoc(editor, yDoc, provider);
        setUpObserver(yMap);
        setUpConnectionAwareness(provider);
        await initialiseLanguages(monaco, yMap, editor);
    };

    const initialiseLanguages = async (
        monaco: Monaco,
        yMap: Y.Map<any>,
        editor: monaco.editor.IStandaloneCodeEditor
    ) => {
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

        // Set the editor's language
        const language: Language = yMap.get(SELECTED_LANGUAGE);
        const model = editor?.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, language?.language ?? "javascript");
        }
    };

    const initialiseYdoc = (roomId: string): { yDoc: Y.Doc; yMap: Y.Map<any>; provider: WebsocketProvider } => {
        const yDoc = new Y.Doc();
        const yMap: Y.Map<any> = yDoc.getMap("sharedMap");
        ydocRef.current = yDoc;
        yMapRef.current = yMap;
        // TODO: Replace serverUrl once BE ready
        // Test locally across browers with 'HOST=localhost PORT 1234 npx y-websocket'
        const provider = new WebsocketProvider("ws://localhost:1234", roomId, yDoc);
        provider.on("status", (event: any) => {
            if (event.status === "disconnected") {
                //toast.error("You have disconnected");
            }
        });
        providerRef.current = provider;
        return { yDoc, yMap, provider };
    };

    const bindEditorToDoc = (editor: monaco.editor.IStandaloneCodeEditor, yDoc: Y.Doc, provider: WebsocketProvider) => {
        const type = yDoc.getText("monaco");
        const editorModel = editor.getModel();
        if (editorModel == null) {
            toast.error("There was an issue with initialising the code editor");
            return;
        }
        const binding = new MonacoBinding(type, editorModel, new Set([editor]), provider.awareness);
        bindingRef.current = binding;
    };

    // Observer to listen to any changes to shared state (e.g. language changes)
    const setUpObserver = (yMap: Y.Map<any>) => {
        yMap.observe((event) => {
            event.changes.keys.forEach((change, key) => {
                if (key === SELECTED_LANGUAGE) {
                    const language: Language = yMap.get(SELECTED_LANGUAGE);
                    setSelectedLanguage(language);
                    const model = editorRef.current?.getModel();
                    if (model) {
                        monaco.editor.setModelLanguage(model, language.language);
                    }
                }
            });
        });
    };

    // Observer to listen to any changes to users' presence (e.g. connection status, is typing, cursor)
    const setUpConnectionAwareness = (provider: WebsocketProvider) => {
        provider.awareness.setLocalStateField(USERNAME, username);
        provider.awareness.on("change", (update: any) => {
            const users = provider.awareness.getStates();
            // TODO: Some UI feedback about connection status of the other user
        });
    };

    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.disconnect();
            editorRef.current?.dispose();
            ydocRef.current?.destroy();
        };
    }, []);

    const handleChangeLanguage = (lang: Language) => {
        yMapRef.current?.set(SELECTED_LANGUAGE, lang);
    };

    const handleExecuteCode = async () => {
        try {
            setIsExecuting(true);
            const sourceCode = editorRef.current?.getValue();
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

    return (
        <CollaborationContext.Provider
            value={{
                initialiseEditor,
                selectedLanguage,
                languages,
                handleChangeLanguage,
                handleExecuteCode,
                isExecuting,
                execResult
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
