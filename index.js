import express from "express";
import cors from "cors";
import placesRouter from "./src/routes/placesRouter.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    method: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.use("/places", placesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
