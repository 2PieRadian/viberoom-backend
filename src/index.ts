import { createServer } from "http";
import app from "./app.js";
import initSocket from "./lib/socket.js";

const server = createServer(app);

initSocket(server);

const PORT = Number(process.env.PORT) || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
