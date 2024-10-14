import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/user";

const PORT = process.env["PORT"] || 8080;

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello Worlds!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
