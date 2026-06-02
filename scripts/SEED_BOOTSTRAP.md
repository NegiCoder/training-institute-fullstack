# Azure SQL Seed Bootstrap

The `scripts/seed-azure-bulk.sh` script populates a fully-empty Azure SQL DB
with realistic demo data (admin + 12 trainers + 100 students + 60 courses +
~300 enrollments + progress + ~20 certificates).

It only requires that an admin user already exists with `Role = 3` in the DB.
Follow these one-time steps before running the script.

---

## Step 1: Wipe existing data (optional)

If your Azure SQL already has test data, clear it via the
**Azure Portal -> SQL databases -> training-institute-db -> Query editor**.

Login with `sqladmin` and run:

```sql
DELETE FROM StudentModuleProgress;
DELETE FROM CertificateIssued;
DELETE FROM CourseEnrollments;
DELETE FROM CourseTrainers;
DELETE FROM CourseContents;
DELETE FROM CoursePricings;
DELETE FROM Students;
DELETE FROM Notifications;
DELETE FROM Courses;
DELETE FROM CourseCategories;
DELETE FROM Users;
DBCC CHECKIDENT ('StudentModuleProgress', RESEED, 0);
DBCC CHECKIDENT ('CertificateIssued',     RESEED, 0);
DBCC CHECKIDENT ('CourseEnrollments',     RESEED, 0);
DBCC CHECKIDENT ('CourseTrainers',        RESEED, 0);
DBCC CHECKIDENT ('CourseContents',        RESEED, 0);
DBCC CHECKIDENT ('CoursePricings',        RESEED, 0);
DBCC CHECKIDENT ('Students',              RESEED, 0);
DBCC CHECKIDENT ('Notifications',         RESEED, 0);
DBCC CHECKIDENT ('Courses',               RESEED, 0);
DBCC CHECKIDENT ('CourseCategories',      RESEED, 0);
DBCC CHECKIDENT ('Users',                 RESEED, 0);
```

---

## Step 2: Register the admin user via API

The public registration endpoint always creates `Student` accounts, which is
intentional for security. We register an admin email first, then promote in DB.

```bash
API='https://training-institute-api.wittywave-65888691.centralindia.azurecontainerapps.io'

curl -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin Boss","email":"admin@training.local","password":"Admin@12345"}'
```

A `userId` and JWT token come back. Account is created with `Role = 1`
(Student). We'll fix that next.

---

## Step 3: Promote to Admin in Azure Portal Query Editor

Run this single SQL statement:

```sql
UPDATE Users
SET Role = 3, FullName = 'Admin Boss'
WHERE Email = 'admin@training.local';
```

`Role = 3` means `Admin` (1=Student, 2=Trainer, 3=Admin).

---

## Step 4: Run the bulk seed

From the project root:

```bash
API='https://training-institute-api.wittywave-65888691.centralindia.azurecontainerapps.io' \
bash scripts/seed-azure-bulk.sh
```

Expect 4-7 minutes against Azure due to network latency.

When it finishes you'll have:

- `admin@training.local` / `Admin@12345`
- `trainer.aman.sharma@training.local` ... 12 trainers / `Trainer@123`
- `student001@training.local` ... `student100@training.local` / `Student@123`
- 8 categories, 60 courses with pricing + modules + assigned trainers
  (mix of Free + Paid + a few Draft courses)
- ~300 enrollments with mixed progress + ~20 certificates
