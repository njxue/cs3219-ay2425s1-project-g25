import * as Y from 'yjs';

class YDocManager {
    private static docs: Map<string, Y.Doc> = new Map();

    static initializeDoc(sessionId: string): Y.Doc {
        const ydoc = new Y.Doc();
        this.docs.set(sessionId, ydoc);
        return ydoc;
    }

    static getDoc(sessionId: string): Y.Doc | undefined {
        return this.docs.get(sessionId);
    }

    static deleteDoc(sessionId: string): void {
        this.docs.delete(sessionId);
    }
}

export { YDocManager };