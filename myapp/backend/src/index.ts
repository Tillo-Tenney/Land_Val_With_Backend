import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import documentsRouter from "./routes/documents";
import tasksRouter from "./routes/tasks";
import templatesRouter from "./routes/templates";
import workflowsRouter from "./routes/workflows";

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/documents", documentsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/workflows", workflowsRouter);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});