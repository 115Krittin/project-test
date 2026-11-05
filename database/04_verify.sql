-- Read-only checks; expected results are documented beside each query.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE itb_csv;

-- Expected PASS: courses 51; courses_schedule 92.
SELECT 'courses' AS table_name, COUNT(*) AS actual_count, 51 AS expected_count,
  IF(COUNT(*) = 51, 'PASS', 'FAIL') AS result FROM courses
UNION ALL
SELECT 'courses_schedule', COUNT(*), 92, IF(COUNT(*) = 92, 'PASS', 'FAIL') FROM courses_schedule;

-- Expected: 1/27, 2/17, 3/28, 4/20. Include a year even if its data is missing.
SELECT expected.year_level, COUNT(s.id) AS actual_count, expected.expected_count,
  IF(COUNT(s.id) = expected.expected_count, 'PASS', 'FAIL') AS result
FROM (
  SELECT 1 AS year_level, 27 AS expected_count UNION ALL SELECT 2, 17
  UNION ALL SELECT 3, 28 UNION ALL SELECT 4, 20
) AS expected
LEFT JOIN courses AS c ON c.year_level = expected.year_level
LEFT JOIN courses_schedule AS s ON s.course_id = c.id
GROUP BY expected.year_level, expected.expected_count ORDER BY expected.year_level;

-- Together with PRIMARY KEY and counts above, these confirm all expected ids exist.
SELECT 'courses' AS table_name, MIN(id) AS min_id, MAX(id) AS max_id,
  SUM(id NOT BETWEEN 1 AND 51) AS ids_outside_expected_range FROM courses
UNION ALL
SELECT 'courses_schedule', MIN(id), MAX(id), SUM(id NOT BETWEEN 1 AND 92) FROM courses_schedule;

-- Expected: 0 orphan schedules.
SELECT COUNT(*) AS orphan_schedules FROM courses_schedule AS s
LEFT JOIN courses AS c ON c.id = s.course_id WHERE c.id IS NULL;

-- Expected: room=1, student_group=62, remarks=87.
SELECT SUM(room IS NULL) AS null_rooms, SUM(student_group IS NULL) AS null_groups,
  SUM(remarks IS NULL) AS null_remarks FROM courses_schedule;

-- Expected: id=90 has NULL room; id=60 preserves the original en dash.
SELECT id, room, remarks FROM courses_schedule WHERE id IN (60, 63, 73, 74, 75, 90) ORDER BY id;

-- Expected: INT403 has 3 courses, INT521 has 2, INT540 has 3.
SELECT code, COUNT(*) AS topic_count FROM courses
WHERE code IN ('INT403', 'INT521', 'INT540') GROUP BY code ORDER BY code;

-- These are valid: course_id=6 has two meetings per section.
SELECT course_id, section, COUNT(*) AS meetings FROM courses_schedule
GROUP BY course_id, section HAVING COUNT(*) > 1 ORDER BY course_id, section;

-- Guest-page preview: 92 rows, no room, in the required order.
-- This is a flat SQL preview, not the nested JSON API response.
SELECT c.code AS Code, c.title AS Title, c.type AS Type, s.section AS Section,
  COALESCE(s.student_group, '') AS `Group`,
  CONCAT(LEFT(s.day_of_week, 1), LOWER(SUBSTRING(s.day_of_week, 2))) AS Day,
  CONCAT(TIME_FORMAT(s.start_time, '%H:%i'), '-', TIME_FORMAT(s.end_time, '%H:%i')) AS Time,
  CONCAT(s.start_week, '-', s.end_week) AS Weeks,
  COALESCE(s.remarks, '') AS Remarks
FROM courses_schedule AS s JOIN courses AS c ON c.id = s.course_id
ORDER BY c.year_level, c.id, s.section,
  FIELD(s.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
  s.start_time, s.id;

-- Example for the backend: selected year, exact PBI ordering, raw NULL values.
SET @selected_year = 2;
SELECT s.id, c.id AS course_id, c.code, c.title, c.type, c.year_level,
  s.section, s.start_week, s.end_week, s.day_of_week,
  TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
  TIME_FORMAT(s.end_time, '%H:%i') AS end_time, s.student_group, s.remarks
FROM courses_schedule AS s JOIN courses AS c ON c.id = s.course_id
WHERE c.year_level = @selected_year
ORDER BY c.year_level, c.id, s.section,
  FIELD(s.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
  s.start_time, s.id;
