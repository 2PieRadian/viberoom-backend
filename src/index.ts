import { createServer } from "http";
import app from "./app.js";
import initSocket from "./lib/socket.js";

const server = createServer(app);

initSocket(server);

server.listen(8080, () => {
  console.log("Server is running on port 8080...");
});
