import { MeiliSearch } from "meilisearch";
import { PayloadSDK } from "./shared/payload/sdk";
import { TokenCache } from "./tokenCache";

export const meili = new MeiliSearch({
  host: process.env.MEILI_URL ?? "",
  apiKey: process.env.MEILI_MASTER_KEY ?? "",
});

const tokenCache = new TokenCache();

export const payload = new PayloadSDK(
  process.env.PAYLOAD_API_URL ?? "",
  process.env.PAYLOAD_USER ?? "",
  process.env.PAYLOAD_PASSWORD ?? ""
);

payload.addTokenCache(tokenCache);
