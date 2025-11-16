import { Router } from "express";
import db from "../db";

const router = Router();
const TABLE = "workflowsData";

router.get("/", async (req, res) => {
  const rows = await db(TABLE);
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const row = await db(TABLE).where({ id: req.params.id }).first();
  res.json(row);
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // ✅ Ensure phases is stored as JSON STRING in MySQL
    const finalData = {
      id: payload.id,
      name: payload.name,
      description: payload.description || "",
      phases: JSON.stringify(payload.phases || []),
      template: payload.template,
      status: payload.status || "in-progress",
      progress: payload.progress || 0,
      currentPhase: payload.currentPhase || "",
      assignee: payload.assignee || "",
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      priority: payload.priority || "medium",
      location: payload.location || "",
    };

    await db(TABLE).insert(finalData);

    res.json(finalData);

  } catch (err) {
    console.error("Workflow Insert Error:", err);
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = req.body;

    const finalData = {
      ...payload,
      phases: JSON.stringify(payload.phases || []),
    };

    await db(TABLE).where({ id: req.params.id }).update(finalData);
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  await db(TABLE).where({ id: req.params.id }).del();
  res.json({ success: true });
});

export default router;