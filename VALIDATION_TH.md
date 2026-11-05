# ผลตรวจชุด Backend

ตรวจบน Node.js 24.22.1 และ MySQL 8.0.46 ใน Instance ชั่วคราวที่แยกจากฐานข้อมูลเดิม

- ติดตั้งจาก package-lock.json สำเร็จ และ npm audit ในการติดตั้งครั้งนี้พบ 0 vulnerabilities
- Prisma CLI, Client, Adapter และ Config เป็น 7.10.1
- Prisma Schema ผ่าน validate และ generate
- Generated Client ที่เป็น TypeScript รันกับ Node 24 ได้โดยตรง
- SQL ที่แนบสร้างข้อมูล 51 รายวิชาและ 92 ตารางเรียนได้จริง
- API Smoke Test ทั้ง 8 ข้อผ่าน โดยตั้ง TZ=Asia/Bangkok
- เทียบ API ทั้ง 92 รายการกับข้อมูลต้นฉบับทุก Field แล้วตรงกัน
- ตรวจทั้ง /api/v1/... และ /intproj26/ip26-grid/api/v1/... แล้วได้ข้อมูลตรงกัน
- ตรวจปี 1/2/3/4 ได้ 27/17/28/20 รายการ
- รูปแบบเวลา HH:MM, NULL, หมายเหตุ Unicode, Field ที่อนุญาต และลำดับแถวถูกต้อง
- Prisma อ่าน Schema จาก MySQL ด้วย db pull --print ได้
- compose.yaml อ่านเป็น YAML ได้และตรวจการเชื่อม Service/Volume/Healthcheck แล้ว
- ไฟล์ SQL ในโฟลเดอร์ database/init ตรงกับ Script ต้นฉบับแบบ byte-for-byte

ข้อจำกัด: เครื่องที่จัดทำไม่มี Docker Engine/CLI จึงยังไม่ได้รัน docker compose build/up
และยังไม่ได้ทดสอบ Image MySQL 8.4 ใน Container จริง ต้องรันขั้นตอนใน README บน VM อีกครั้ง
ชุดทดสอบนี้ไม่แทน Acceptance Tests api/e2e ของอาจารย์ และยังไม่ใช่ระบบ Deploy ครบ 4 Container
