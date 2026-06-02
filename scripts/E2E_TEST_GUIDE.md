# ExcelGens - End-to-End Test Guide

A step-by-step manual test walkthrough that exercises **every feature** of the project — for student, trainer, and admin roles. Follow it top-down. Each section ends with an "Expected" checkbox.

---

## 0. Prerequisites — Make sure everything is up


| Component  | Check Command                                                                                                                                                | Expected          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| SQL Server | `docker ps | grep training-sql`                                                                                                                              | container running |
| Backend    | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5045/swagger/index.html`                                                                            | `200`             |
| Frontend   | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`                                                                                              | `200`             |
| Seeded DB  | `docker exec training-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASS" -d TrainingInstitute -C -Q "SELECT COUNT(*) FROM Users"` | at least `9`      |


If anything fails, re-run the seed with your local SQL password: `SQL_PASS='your-local-sa-password' bash scripts/seed.sh`.

---

## 1. Test Accounts (from seed)


| Role    | Email                          | Password      |
| ------- | ------------------------------ | ------------- |
| Admin   | `admin@training.local`         | `Admin@12345` |
| Trainer | `trainer.aman@training.local`  | `Trainer@123` |
| Trainer | `trainer.priya@training.local` | `Trainer@123` |
| Trainer | `trainer.rahul@training.local` | `Trainer@123` |
| Student | `aarav@training.local`         | `Student@123` |
| Student | `diya@training.local`          | `Student@123` |
| Student | `ishaan@training.local`        | `Student@123` |
| Student | `saanvi@training.local`        | `Student@123` |
| Student | `karan@training.local`         | `Student@123` |


---

## 2. PUBLIC pages (no login)

Open **[http://localhost:5173/](http://localhost:5173/)** in browser.

### 2.1 Home page

- Page loads, header shows "Login" and "Register"
- No errors in browser console

### 2.2 Course catalog

- Click **Courses** in nav.
- You see ~5 published courses (Draft course "AWS" should be hidden)
- Search box: type "React" → only React course appears
- Clear search, paginate if pagination exists

### 2.3 Course detail

- Click **React from Zero to Hero**.
- Title, description, level, mode shown
- Pricing rows: 2025 (Free), 2026 (₹9999)
- Trainer "Priya Iyer" listed
- 5 modules listed (Video / PDF / Link)
- An "Enroll" button is visible BUT clicking it redirects to login (because you're not logged in)

---

## 3. NEW STUDENT registration flow

### 3.1 Register

- Click **Register** in nav.
- Fill: Full Name = `Test User`, Email = `test@training.local`, Password = `Test@1234`, Confirm = `Test@1234`.
- Submit.
- Success — redirected to student dashboard

### 3.2 Logout, log back in

- Click **Logout**.
- Click **Login**, enter same creds.
- Lands back on student dashboard (proves localStorage + JWT working)

### 3.3 Negative auth checks

- Logout. Try `/login` with wrong password.
- Error message shown, NOT redirected
- Logout. Try `/login` with non-existent email.
- Error message shown

---

## 4. STUDENT role tests (login as `aarav@training.local`)

### 4.1 Dashboard

- After login you should be on `/student`.
- Stats cards visible
- Quick links to Profile, Enrollments, Certificates

### 4.2 Profile

- Click **Profile**.
- Existing data filled (Aarav Sharma, Pune, PICT, 2024)
- Change phone to `9999999999`. Save.
- Success toast / message
- Refresh page.
- New phone persists

### 4.3 Browse → Enroll

- Click **Courses** (catalog) in top nav.
- Open **AWS Cloud Practitioner** — wait, it's Draft, so it shouldn't be visible. Good ✓
- Open **Full-Stack MERN Bootcamp**.
- Click **Enroll**.
- Success — redirected to My Enrollments
- MERN now appears in your enrollments

### 4.4 My Enrollments

- Visit **My Enrollments**.
- 3 enrollments visible:
  - ASP.NET Core Mastery (InProgress, 50%)
  - React from Zero to Hero (Assigned, 0%)
  - Full-Stack MERN Bootcamp (Assigned, 0%)

### 4.5 Track Progress

- Click **View Progress** on ASP.NET row.
- 4 modules listed
- First 2 already marked complete
- Click **Mark Complete** on module 3 (Entity Framework Core).
- Progress jumps to 75%
- Click **Mark Complete** on module 4.
- Progress becomes 100%

### 4.6 My Certificates

- Click **My Certificates** (Aarav has none yet).
- Empty state shown OR no rows

### 4.7 Route protection

- Manually change URL to `/admin` in the address bar.
- You are redirected back to home (or shown denied)

---

## 5. TRAINER role tests (logout, login as `trainer.aman@training.local`)

### 5.1 Trainer dashboard

- After login → `/trainer`.
- Stats: Assigned Courses, Enrolled Students, Trainer name, Role
- Quick links: My Courses, Manage Content, My Students, Course Catalog

### 5.2 My Courses

- Click **My Courses**.
- You see 3 courses assigned to Aman:
  - ASP.NET Core Mastery
  - Java Spring Boot Fundamentals
  - AWS Cloud Practitioner

### 5.3 Manage Content (trainer-only content upload)

- Click **Manage Content**.
- Course dropdown only shows Aman's 3 assigned courses (NOT all 6).
- Select `ASP.NET Core Mastery`. 4 modules listed (uploaded by Aman during seed).
- Add a new module: name `Bonus Q&A`, type Link, url `https://meet.google.com/abc`, sort 10. Appears in list.
- Edit it → rename to `Bonus Q&A Session`. Save.
- Delete it.

### 5.4 My Students (new)

- Click **My Students**.
- Page groups enrollments by course title.
- Under ASP.NET Core Mastery: Aarav (InProgress 50%) and Diya (Assigned 0%).
- Under Java Spring Boot Fundamentals: Ishaan (Completed 100%).

### 5.5 Route protection

- Manually change URL to `/admin` → redirected.
- Manually change URL to `/student` → redirected.

### 5.6 Trainer cannot touch other trainer's courses

- UI: dropdown only shows Aman's courses.
- API direct attack: try POST `/api/CourseContents` with someone else's `courseId` → backend returns `400 You are not assigned to this course.`

### 5.7 Admin cannot upload modules anymore

- Logout. Login as admin.
- No "Modules" link in admin nav.
- Direct API attempt:

```bash
ADMIN=$(curl -s -X POST http://localhost:5045/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@training.local","password":"Admin@12345"}' | jq -r '.token')
curl -i -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -X POST http://localhost:5045/api/CourseContents \
  -d '{"courseId":1,"moduleName":"Admin should not be able","contentType":1,"urlOrPath":"x","sortOrder":99,"isActive":true}'
```

Returns `403 Forbidden`.

---

## 6. ADMIN role tests (logout, login as `admin@training.local`)

### 6.1 Dashboard

- After login → `/admin`.
- Stat cards: Students = 6 (5 seeded + the Test User you registered earlier), Courses = 6, Enrollments = 10, Certificates = 1

### 6.2 Course Categories CRUD

- Click **Categories**.
- 5 categories visible
- Create new: `Cyber Security`.
- Appears in list with Active = true
- Edit it → rename to `Cyber Security & Hacking`.
- Updates immediately
- Delete (deactivate) it.
- Row shows Inactive

### 6.3 Courses CRUD

- Click **Courses (Admin)**.
- 6 courses visible (including Draft "AWS Cloud Practitioner")
- Create a new course: title `Test Course`, category Programming, status Draft, level Beginner, mode Online, duration `2 weeks`.
- Appears with status Draft
- Edit → change status to Published.
- Now visible in public catalog
- Delete it.
- Gone from list

### 6.4 Course Pricing

- Click **Course Pricing**.
- Select `ASP.NET Core Mastery`.
- 2 pricing rows visible (2025 = 14999, 2026 = 16999)
- Add: 2027 = 19999.
- New row appears
- Delete the 2025 row.
- Removed

### 6.5 Course Modules — removed from Admin

Module/content management is now a **trainer-only** feature (see section 5.3). Admin can no longer create, edit or delete modules.

- Confirm there is no "Modules" link in the admin nav.
- Visiting `/admin/course-modules` directly should land you on Not Found.

### 6.6 Trainer Assignments

- Click **Course Trainers**.
- Select `ASP.NET Core Mastery`.
- Aman is shown
- Add Priya (trainer id from dropdown / known = 3).
- Priya appears in list
- Remove Priya.

### 6.7 Students browse

- Click **Students**.
- 6 student profiles visible
- Search by city `Pune`.
- Aarav appears
- Clear, search by college `RVCE`.
- Ishaan appears

### 6.8 Enrollments management

- Click **Enrollments**.
- ~10 rows visible across students
- Filter status = `Completed`.
- Only Ishaan / Spring Boot row visible
- Filter status = `InProgress`.
- Aarav/ASP.NET, Diya/Python DS, Karan/React (and Aarav/ASP.NET should be at 100% after step 4.5)
- Pick the Aarav/ASP.NET row at 100% → change status to `Completed`.
- Status badge changes

### 6.9 Certificates

- Click **Certificates**.
- 1 existing certificate (Ishaan / Spring Boot)
- Click **Download** → PDF downloads.
- PDF opens, has Ishaan's name and course title
- Now issue a new one: enrollment ID = the Aarav/ASP.NET enrollment (id from previous step, probably 1).
- New certificate row appears
- Download it.
- PDF opens

### 6.10 Create new Trainer

- Click **Create Trainer**.
- Fill: Full Name = `New Trainer`, Email = `newtrainer@training.local`, Password = `Newtrainer@1`.
- Submit.
- Success, user ID returned
- Logout. Login as `newtrainer@training.local`.
- Lands on trainer dashboard

### 6.11 Create new Admin

- Login as admin again. Click **Create Admin**.
- Fill: Full Name = `Second Admin`, Email = `admin2@training.local`, Password = `Admin2@123`.
- Submit.
- Success
- Logout. Login as `admin2@training.local`.
- Lands on admin dashboard

---

## 7. EMAIL flow (Mailtrap)

After issuing a certificate in 6.9:

- Open [https://mailtrap.io](https://mailtrap.io) → your inbox.
- An email "Your certificate is ready" should be present with the certificate PDF attached.

(If the seed already issued one for Ishaan, the inbox should already have that email.)

---

## 8. API / Swagger smoke test

Open [http://localhost:5045/swagger](http://localhost:5045/swagger).

### 8.1 Public endpoints

- `GET /api/Courses/search` → returns 5 published courses (without auth).
- Works without authorize header

### 8.2 Auth-required endpoint

- `GET /api/Enrollments/me` without token → `401`.
- Returns 401

### 8.3 Get a JWT

```bash
curl -X POST http://localhost:5045/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aarav@training.local","password":"Student@123"}'
```

- Copy the `token` value, click **Authorize** in Swagger, paste it.
- Now `GET /api/Enrollments/me` → returns Aarav's enrollments.

### 8.4 Role-restricted endpoint

- Logout in Swagger, login as student again.
- Call `POST /api/Courses` (admin-only).
- Returns `403 Forbidden`

---

## 9. Security checks

### 9.1 Cannot register as Admin

```bash
curl -X POST http://localhost:5045/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Hacker","email":"hacker@x.com","password":"hacker123","role":3}'
```

- Returns 200, but user gets created as **Student** (role 1) — verify in admin Students list

### 9.2 Cannot call admin endpoint without admin token

```bash
TOK=$(curl -s -X POST http://localhost:5045/api/auth/login -H "Content-Type: application/json" -d '{"email":"hacker@x.com","password":"hacker123"}' | jq -r '.token')
curl -i -H "Authorization: Bearer $TOK" -X POST http://localhost:5045/api/auth/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Bad","email":"bad@x.com","password":"bad@1234"}'
```

- Returns `403 Forbidden`

### 9.3 401 → auto logout (interceptor)

- Login in browser. Open DevTools → Application → Local Storage → edit the `training-institute-auth` key, set the `token` field to a garbage string.
- Reload the page and click any protected page.
- You get auto-logged-out and bounced to `/login`

---

## 10. Build verification

```bash
cd backend/TrainingInstitute.Api && dotnet build --configuration Release
cd ../../frontend && npm run quality
```

- Both succeed without errors

---

## ✅ Definition of Done

When all checkboxes above are ticked, the project is **fully functional end-to-end**. You are ready to:

1. Initialize git + push to GitHub (`git init && git add . && git commit -m "..." && git push`)
2. Watch the two GitHub Actions workflows run on push
3. Move on to deployment (Render/Vercel/Azure)

