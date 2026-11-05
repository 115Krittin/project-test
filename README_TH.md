# Backend + MySQL สำหรับ ip26-grid

ชุดเริ่มต้น Express + Prisma 7.10.1 + MySQL สำหรับ INT504 Sprint 1
มี API ใช้งานได้จริง พร้อม Schema และ Seed 51 รายวิชา / 92 ตารางเรียนที่ส่งมาในแชต
Node.js ใช้รุ่น 24 ส่วน MySQL Container ใช้รุ่น 8.4

ชุดนี้มี 2 Container คือ Backend และ Database สำหรับเริ่มพัฒนา
เมื่อนำไปรวมระบบของวิชาต้องเพิ่ม Proxy และ Frontend เป็น Container แยกอีก 2 ส่วน
Proxy ของทีมต้องส่ง API มาที่ Backend โดยคง Path ของทีมไว้

## โครงสร้าง

```text
ip26-grid-backend-docker/
├── compose.yaml
├── .env.example                  # ตั้งรหัสผ่านและ Team Code สำหรับ Compose
├── .gitignore
├── README_TH.md
├── database/
│   ├── init/
│   │   ├── 01_schema.sql         # สร้าง itb_csv และสองตาราง
│   │   ├── 02_seed_courses.sql   # 51 รายวิชา
│   │   └── 03_seed_schedules.sql # 92 ตารางเรียน
│   └── 04_verify.sql             # SQL ตรวจข้อมูล อ่านอย่างเดียว
└── backend/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example              # สำหรับรัน Node นอก Docker เท่านั้น
    ├── package.json
    ├── package-lock.json
    ├── prisma7.config.ts
    ├── prisma/schema.prisma
    ├── src/
    │   ├── server.js             # เปิด Server และปิด Connection เมื่อหยุด
    │   ├── app.js                # Express, Base Path และ Error Handler
    │   ├── config/env.js         # อ่าน/ตรวจ Environment
    │   ├── lib/prisma.js         # Prisma Client + MySQL Adapter
    │   ├── routes/api.routes.js
    │   ├── controllers/schedules.controller.js
    │   ├── services/schedules.service.js
    │   └── dto/schedule.dto.js   # เลือก Field และจัดรูปแบบ HH:MM
    └── test/api.smoke.test.js    # ทดสอบ API ของชุดเริ่มต้นนี้
```

Prisma จะสร้าง `backend/src/generated/prisma/` ตอน Build ไม่ต้องเขียนหรือแก้ไฟล์ในนี้เอง
โค้ดที่ทีมแก้เป็น JavaScript ส่วน Client ที่ Prisma สร้างเป็น TypeScript ที่ Node 24 อ่านได้โดยตรง

เส้นทางทำงาน: Request → Route → Controller → Service → Prisma → MySQL → DTO → JSON

## เริ่มบน Linux VM

แตก ZIP ลงโฟลเดอร์ใหม่ เช่น `/srv/ip26-grid/ip26-grid-backend-docker`
ทดลองชุดนี้แยกจาก Backend เดิมก่อน ไม่ต้องนำไฟล์ไปทับของเดิม
เครื่อง VM ต้องมี Docker Engine และ Docker Compose plugin
เมื่อใช้วิธีนี้ VM ไม่จำเป็นต้องติดตั้ง Node/npm เพิ่ม เพราะจะทำงานใน Container

```bash
cd /srv/ip26-grid/ip26-grid-backend-docker
docker --version
docker compose version
cp .env.example .env
nano .env
```

ตั้ง `MYSQL_ROOT_PASSWORD` และ `MYSQL_PASSWORD` ให้มีค่าใน `.env` เช่น:

```env
TEAM_CODE=ip26-grid
BACKEND_PORT=3000
MYSQL_ROOT_PASSWORD="ใส่รหัสผ่านสำหรับ root ที่คุณเลือก"
MYSQL_PASSWORD="ใส่รหัสผ่านสำหรับ itb_app ที่คุณเลือก"
```

ถ้าพอร์ต 3000 ของ VM มีโปรแกรมอื่นใช้อยู่ ให้เปลี่ยน BACKEND_PORT เช่นเป็น 3001
บัญชีที่ Backend ใช้คือ `itb_app` ซึ่งมีสิทธิ์ในฐานข้อมูล `itb_csv`
ไฟล์ `.env` จริงอยู่ใน `.gitignore`; เก็บ `.env.example` และไฟล์ตั้งค่าอื่นลง Git ได้

ตรวจ Config โดยไม่แสดงรหัสผ่าน แล้วเปิดระบบ:

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=80 db backend
```

Compose รอให้ DB ผ่าน Healthcheck ก่อนเปิด Backend
ชื่อ Project ของชุดนี้คือ `ip26-grid-backend-starter` เพื่อแยก Volume จากงานเดิม

## Volume และ Seed

- Named Volume `mysql_data` ผูกกับ `/var/lib/mysql` เพื่อเก็บข้อมูลจริง
- โฟลเดอร์ `database/init` ผูกแบบอ่านอย่างเดียวกับ `/docker-entrypoint-initdb.d`
- MySQL จะรัน 01 → 02 → 03 อัตโนมัติเมื่อเริ่มด้วยพื้นที่ข้อมูลว่าง
- ฐานข้อมูลและ Seed ไม่ได้อยู่ใน Backend Container
- ไม่ต้องรัน Seed ด้วยมือซ้ำหลังเริ่มสำเร็จ เพราะ Script เป็น INSERT ที่รักษา ID ต้นฉบับ
- การ Restart ไม่รัน Seed อีก และไม่เปลี่ยนรหัสผ่านเดิมจากค่า Environment ใหม่
- ถ้าต้องเปลี่ยน Schema หลังมีข้อมูลแล้ว ให้ทำ ALTER/Migration โดยรักษาข้อมูลเดิม
- `docker compose down` หยุดและถอด Container แต่เก็บ Named Volume ไว้
- การลบ Volume จะลบข้อมูลในฐานข้อมูลชุดนั้นด้วย จึงไม่ใช้ `down -v` ในขั้นตอนเริ่มต้นนี้

MySQL จะสร้างฐานข้อมูลชุดใหม่ใน Volume นี้ ข้อมูลจาก MySQL ตัวเดิมนอก Docker ไม่ได้ย้ายมาเอง
ชุดนี้มี Seed ที่ส่งมาให้แล้ว จึงไม่ต้องคัดลอกไฟล์ข้อมูลภายใน MySQL เครื่องเดิม

## ทดลอง API จาก Terminal ของ VM

Backend เปิดให้ Host เข้าที่ `127.0.0.1:3000` เท่านั้น
ถ้าเปลี่ยน BACKEND_PORT ให้เปลี่ยนเลขพอร์ตในตัวอย่างตามด้วย

```bash
curl http://127.0.0.1:3000/api/v1/health
curl http://127.0.0.1:3000/api/v1/schedules
curl "http://127.0.0.1:3000/api/v1/schedules?yearLevel=2"
```

Health ควรตอบ:

```json
{"status":"ok","team":"ip26-grid"}
```

Schedule ควรได้ 92 รายการ; ปี 1/2/3/4 ได้ 27/17/28/20 รายการตามลำดับ
Response เป็น Array โดยตรง มี Course เป็น Object ซ้อน ไม่มีห้องเรียน และเวลาเป็น HH:MM
ลำดับคือชั้นปี → course id → section → วันจันทร์ก่อน → เวลาเริ่ม → schedule id
ค่าที่ไม่มีข้อมูลส่งเป็น null; Backend ไม่แปลงเป็นข้อความว่างแทน Frontend

รองรับ Full Path ที่ Proxy ส่งมาโดยไม่ตัด Prefix ด้วย:

```bash
curl http://127.0.0.1:3000/intproj26/ip26-grid/api/v1/health
curl "http://127.0.0.1:3000/intproj26/ip26-grid/api/v1/schedules?yearLevel=2"
```

TEAM_CODE เปลี่ยนได้จาก `.env` และ Full Path จะเปลี่ยนตาม
กรณี query yearLevel ผิดหรือซ้ำจะตอบ 400; ถ้าอ่าน DB ไม่สำเร็จจะตอบ 500 พร้อมข้อความทั่วไป
Health ตรวจว่า Backend รับ Request ได้ โดย Server จะเชื่อม DB ให้สำเร็จก่อนเริ่มรับ Request

## ตรวจฐานข้อมูลใน Container

```bash
docker compose exec db mysql -u itb_app -p itb_csv
```

กรอกรหัสผ่าน MYSQL_PASSWORD ที่ตั้งไว้ แล้วใช้:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM courses_schedule;
```

ต้องได้สองตารางและจำนวน 51 / 92 แถว
ไฟล์ `database/04_verify.sql` มีคำสั่งตรวจเพิ่มเติมและตัวอย่าง JOIN

## ทดสอบ API

หลัง Container พร้อมแล้ว รัน:

```bash
docker compose exec backend npm test
```

ตรวจ Health, จำนวนข้อมูลทุกปี, ชื่อ Field ตรงสเปก, ไม่มีห้องเรียน,
เวลาไม่เลื่อนตาม TZ, หมายเหตุ Unicode, ลำดับแถว, URL เต็ม และการปฏิเสธปีที่ไม่ถูกต้อง
ชุดนี้เป็น Smoke Test ของ Starter ไม่ใช่ชุด Acceptance Tests ของอาจารย์
ก่อนส่งงานยังต้องรัน api/e2e ของ requirements repository กับเว็บ Deploy จริง

## Prisma ในชุดนี้

Prisma CLI, Client และ Adapter ล็อกที่ 7.10.1 และมี package-lock.json ให้แล้ว
ใช้ `npm ci` ตอน Build เพื่อไม่ดึง Prisma 8 RC เข้ามาโดยไม่ตั้งใจ
Dockerfile สร้าง Client สำหรับ Linux เอง ไม่คัดลอก node_modules จากเครื่อง Windows
แพ็กเกจ Prisma ที่จำเป็นมีรายการอนุญาต Install Scripts แบบระบุเวอร์ชันไว้ใน package.json

มี Model ที่แมปกับ SQL ให้แล้ว ไม่ต้อง `prisma init` ซ้ำ
ตรวจ Schema ปัจจุบันของ MySQL โดยไม่เขียนทับไฟล์ได้ด้วย:

```bash
docker compose exec backend npm run db:inspect
```

CHECK constraints อยู่ใน SQL/MySQL แม้ Prisma จะเตือนว่าแสดงใน Model ได้ไม่ครบ
ยังไม่ได้ตั้ง Prisma Migrate baseline; ถ้าจะเปลี่ยนมาใช้ Prisma Migrate ต้องวาง baseline ก่อน
การ Generate Client ไม่เปลี่ยนฐานข้อมูล และการเปิด Container ไม่รัน reset หรือ migrate dev

## การเชื่อมต่อที่ต้องเข้าใจ

| รันโปรแกรมที่ไหน | Host ของ MySQL |
|---|---|
| Backend Container ใน Compose นี้ | `db:3306` ตามที่ตั้งให้แล้ว |
| Terminal บน VM | DB ไม่ได้ Publish Port ให้ Host; ใช้ docker compose exec |
| เครื่อง Windows | เข้าถึง DB นี้โดยตรงไม่ได้จากตัวอย่างนี้ |

Backend Container ต้องใช้ชื่อ Service `db` ไม่ใช่ localhost
ส่วน Proxy/Frontend Container ที่จะเพิ่มภายหลังต้องอยู่ใน Docker Network เดียวกัน
แล้ว Proxy จึงส่ง API ไปที่ `backend:3000`
ตัวอย่างนี้ยังไม่มี Proxy, Frontend, TLS certificate หรือ Public HTTPS Endpoint ของวิชา

## แก้โค้ดและหยุดระบบ

```bash
# หลังแก้โค้ด Backend
docker compose up -d --build backend

# หยุดโดยคงข้อมูลใน Named Volume
docker compose down
```

## เอกสารที่อ้างอิง

- https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/mysql
- https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators
- https://nodejs.org/docs/latest-v24.x/api/typescript.html
- https://hub.docker.com/_/mysql
- https://docs.docker.com/engine/storage/volumes/
- https://docs.docker.com/compose/how-tos/startup-order/
