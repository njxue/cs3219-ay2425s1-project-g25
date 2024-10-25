import axios from "axios";

const API_URL = "https://emkc.org/api/v2/piston";

const pistonAxios = axios.create({ baseURL: API_URL });

class PistonClient {
    static async executeCode(language: string, version: string, sourceCode: string) {
        const res = await pistonAxios.post("/execute", { language, version, files: [{ content: sourceCode }] });
    }

    static async getLanguageVersions() {
        const res = await pistonAxios.get("/runtimes");
        return res.data;
    }
}

export default PistonClient;
