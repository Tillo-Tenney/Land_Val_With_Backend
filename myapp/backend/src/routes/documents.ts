import { Router } from "express";
import db from "../db";

const router = Router();
const TABLE = "documentsData";

router.get("/", async (req, res) => {
  const data = await db(TABLE);
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const row = await db(TABLE).where({ id: req.params.id }).first();
  res.json(row);
});

router.post("/", async (req, res) => {
  await db(TABLE).insert(req.body);
  res.json({ success: true });
});

router.put("/:id", async (req, res) => {
  await db(TABLE).where({ id: req.params.id }).update(req.body);
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await db(TABLE).where({ id: req.params.id }).del();
  res.json({ success: true });
});

export default router;