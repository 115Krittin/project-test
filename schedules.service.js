import { prisma } from "../lib/prisma.js";
import { scheduleDto } from "../dto/schedule.dto.js";

export async function getSchedules(yearLevel) {
  const rows = await prisma.schedule.findMany({
    where: yearLevel === undefined ? undefined : { course: { yearLevel } },
    select: {
      id: true,
      course: { select: { id: true, code: true, title: true, type: true, yearLevel: true } },
      section: true,
      startWeek: true,
      endWeek: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      studentGroup: true,
      remarks: true,
    },
    orderBy: [
      { course: { yearLevel: "asc" } },
      { courseId: "asc" },
      { section: "asc" },
      // The SQL ENUM is declared MONDAY through SUNDAY in this exact order.
      { dayOfWeek: "asc" },
      { startTime: "asc" },
      { id: "asc" },
    ],
  });
  return rows.map(scheduleDto);
}
