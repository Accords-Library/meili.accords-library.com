import http from "http";
import { synchronizeMeiliDocs } from "./synchro";


await synchronizeMeiliDocs();

export const requestListener: http.RequestListener = async (req, res) => {
  if (req.method !== "POST") {
    res
      .writeHead(405, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "Method Not Allowed. Use POST." }));
    return;
  }

  if (req.headers.authorization !== `Bearer ${process.env.WEBHOOK_TOKEN}`) {
    res
      .writeHead(403, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "Invalid auth token." }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" }).end(
    JSON.stringify({
      message: "Done.",
    })
  );
};

http.createServer(requestListener).listen(process.env.PORT, () => {
  console.log(`Server started: http://localhost:${process.env.PORT}`);
});


