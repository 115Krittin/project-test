import { getSchedules } from "../services/schedules.service.js";

export async function listSchedules(req, res) {
  const value = req.query.yearLevel;
  if (value !== undefined && !["1", "2", "3", "4"].includes(value)) {
    return res.status(400).json({ message: "yearLevel must be an integer from 1 to 4" });
  }
  const yearLevel = value === undefined ? undefined : Number(value);
  const schedules = await getSchedules(yearLevel);
  return res.status(200).json(schedules);
}
