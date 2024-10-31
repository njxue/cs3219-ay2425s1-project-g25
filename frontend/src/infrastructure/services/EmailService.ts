import axios from "axios";

const emailAxios = axios.create({ baseURL: "http://localhost/api/email" });

class EmailService {
    static async sendEmail(to: string, subject: string, html: string) {
        const res = await emailAxios.post("/", { to, subject, html });
    }
}

export default EmailService;
