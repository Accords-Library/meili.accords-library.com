export class TokenCache {
    private token: string | undefined;
    private expiration: number | undefined;
  
    get() {
      if (!this.token) return undefined;
      if (!this.expiration || this.expiration < Date.now()) {
        console.log("[PayloadSDK] No token to be retrieved or the token expired");
        return undefined;
      }
      return this.token;
    }
  
    set(newToken: string, newExpiration: number) {
      this.token = newToken;
      this.expiration = newExpiration * 1000;
      const diffInMinutes = Math.floor(
        (this.expiration - Date.now()) / 1000 / 60
      );
      console.log(
        "[PayloadSDK] New token set. TTL is",
        diffInMinutes,
        "minutes."
      );
    }
  }