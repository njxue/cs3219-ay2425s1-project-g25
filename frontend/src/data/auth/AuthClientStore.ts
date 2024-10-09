const ACCESS_TOKEN_KEY = "accessToken";

class AuthClientStore {
    static getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    static setAccessToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    static removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    static containsAccessToken() {
        return this.getAccessToken() !== null;
    }
}

export default AuthClientStore;
