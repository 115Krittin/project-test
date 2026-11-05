import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";

const base = (process.env.BASE_URL || "http://127.0.0.1:3000/").replace(/\/+$/, "");
const team = process.env.TEAM_CODE || "ip26-grid";
const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

async function get(path) {
  const response = await fetch(`${base}/api/v1${path}`, { signal: AbortSignal.timeout(10_000) });
  assert.equal(response.status, 200);
  return response.json();
}

function exactKeys(value, keys) {
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort());
}

test("health returns exactly status and team", async () => {
  assert.deepEqual(await get("/health"), { status: "ok", team });
});

test("all schedules have exact fields, original values and PBI ordering", async () => {
  const rows = await get("/schedules");
  assert.equal(rows.length, 92);
  assert.equal(new Set(rows.map(row => row.id)).size, 92);
  for (const row of rows) {
    exactKeys(row, ["id", "course", "section", "startWeek", "endWeek", "dayOfWeek", "startTime", "endTime", "studentGroup", "remarks"]);
    exactKeys(row.course, ["id", "code", "title", "type", "yearLevel"]);
    assert.match(row.startTime, /^\d{2}:\d{2}$/);
    assert.match(row.endTime, /^\d{2}:\d{2}$/);
    assert.ok(row.studentGroup === null || ["A", "B"].includes(row.studentGroup));
    assert.ok(row.remarks === null || typeof row.remarks === "string");
  }
  const key = row => [row.course.yearLevel, row.course.id, row.section, days.indexOf(row.dayOfWeek), Number(row.startTime.replace(":", "")), row.id];
  for (let i = 1; i < rows.length; i++) {
    const previous = key(rows[i - 1]);
    const current = key(rows[i]);
    const firstDifference = previous.findIndex((value, index) => value !== current[index]);
    assert.ok(firstDifference < 0 || previous[firstDifference] < current[firstDifference]);
  }
  assert.deepEqual(rows.find(row => row.id === 40), {
    id: 40,
    course: { id: 34, code: "INT504", title: "Integrated Project", type: "CORE", yearLevel: 2 },
    section: 1, startWeek: 11, endWeek: 15, dayOfWeek: "TUESDAY",
    startTime: "09:30", endTime: "12:30", studentGroup: null, remarks: null,
  });
  assert.equal(rows.find(row => row.id === 60).remarks, "Classes: Jul 26–Aug 23");
  assert.equal(rows.find(row => row.id === 63).remarks, "Classes: Jul 25–Nov 14");
  assert.equal(new Set(rows.filter(row => row.course.code === "INT403").map(row => row.course.id)).size, 3);
});

for (const [year, count] of [[1, 27], [2, 17], [3, 28], [4, 20]]) {
  test(`year ${year} returns ${count} matching rows`, async () => {
    const all = await get("/schedules");
    const filtered = await get(`/schedules?yearLevel=${year}`);
    assert.equal(filtered.length, count);
    assert.deepEqual(filtered, all.filter(row => row.course.yearLevel === year));
  });
}

test("invalid year is rejected with 400", async () => {
  for (const query of ["0", "5", "abc", "", "2&yearLevel=3"]) {
    const response = await fetch(`${base}/api/v1/schedules?yearLevel=${query}`);
    assert.equal(response.status, 400);
  }
});

test("the full team path is accepted", async () => {
  const response = await fetch(`${base}/intproj26/${team}/api/v1/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", team });
});
