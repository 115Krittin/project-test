function hhmm(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("Invalid TIME value returned by the database");
  }
  // MySQL TIME is a wall-clock time; local timezone conversion would shift it.
  return value.toISOString().slice(11, 16);
}

export function scheduleDto(row) {
  return {
    id: row.id,
    course: {
      id: row.course.id,
      code: row.course.code,
      title: row.course.title,
      type: row.course.type,
      yearLevel: row.course.yearLevel,
    },
    section: row.section,
    startWeek: row.startWeek,
    endWeek: row.endWeek,
    dayOfWeek: row.dayOfWeek,
    startTime: hhmm(row.startTime),
    endTime: hhmm(row.endTime),
    studentGroup: row.studentGroup,
    remarks: row.remarks,
  };
}
