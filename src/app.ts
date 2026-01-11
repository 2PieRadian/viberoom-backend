import express from "express";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: ["https://viberoom.ramanbhardwaj.me", "http://localhost:3000"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

export default app;
