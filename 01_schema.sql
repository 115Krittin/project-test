-- INT504 Sprint 1: itb_csv schema. Requires MySQL 8.0.16 or later.
-- Run against a new database. IF NOT EXISTS does not migrate existing tables.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS itb_csv
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE itb_csv;

CREATE TABLE IF NOT EXISTS courses (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  title VARCHAR(100) NOT NULL,
  type ENUM('CORE', 'ELECTIVE') NOT NULL,
  year_level TINYINT UNSIGNED NOT NULL,
  CONSTRAINT pk_courses PRIMARY KEY (id),
  CONSTRAINT uq_courses_code_title UNIQUE (code, title),
  CONSTRAINT ck_courses_code CHECK (
    CHAR_LENGTH(code) = 6 AND REGEXP_LIKE(code, '^[A-Z]{3}[0-9]{3}$', 'c')
  ),
  CONSTRAINT ck_courses_title CHECK (CHAR_LENGTH(TRIM(title)) > 0),
  CONSTRAINT ck_courses_type CHECK (type IN ('CORE', 'ELECTIVE')),
  CONSTRAINT ck_courses_year CHECK (year_level BETWEEN 1 AND 4),
  INDEX idx_courses_year (year_level, id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses_schedule (
  id INT NOT NULL AUTO_INCREMENT,
  course_id INT NOT NULL,
  section TINYINT UNSIGNED NOT NULL,
  start_week TINYINT UNSIGNED NOT NULL,
  end_week TINYINT UNSIGNED NOT NULL,
  day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(20) NULL,
  student_group ENUM('A', 'B') NULL,
  remarks VARCHAR(255) NULL,
  CONSTRAINT pk_courses_schedule PRIMARY KEY (id),
  CONSTRAINT fk_schedule_course FOREIGN KEY (course_id) REFERENCES courses (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ck_schedule_section CHECK (section BETWEEN 1 AND 99),
  CONSTRAINT ck_schedule_start_week CHECK (start_week BETWEEN 1 AND 15),
  CONSTRAINT ck_schedule_end_week CHECK (end_week BETWEEN 1 AND 15),
  CONSTRAINT ck_schedule_week_order CHECK (start_week <= end_week),
  CONSTRAINT ck_schedule_day CHECK (
    day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
  ),
  CONSTRAINT ck_schedule_time_range CHECK (
    start_time >= '00:00:00' AND end_time < '24:00:00' AND start_time < end_time
  ),
  CONSTRAINT ck_schedule_time_minutes CHECK (SECOND(start_time) = 0 AND SECOND(end_time) = 0),
  CONSTRAINT ck_schedule_group CHECK (student_group IS NULL OR student_group IN ('A', 'B')),
  INDEX idx_schedule_course_order (course_id, section, day_of_week, start_time, id)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
