-- =============================================================================
-- ExcelGens demo seed backdating
-- =============================================================================
-- Ye script API se create hue fresh seed data ko realistic timeline deta hai.
-- Goal: reports me 10 months ka growth curve, idle students, completion lag,
-- aur certificate dates natural dikhe.
--
-- Run through scripts/backdate-azure.sh. Production app endpoints ko seed-only
-- date fields dene ki zarurat nahi padti.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @Now datetime2 = SYSUTCDATETIME();
DECLARE @CurrentMonthStart date = DATEFROMPARTS(YEAR(@Now), MONTH(@Now), 1);
DECLARE @MaxCurrentMonthDay int = IIF(DAY(@Now) <= 1, 1, DAY(@Now) - 1);

PRINT 'Backdating users and student profiles...';

-- Users/Students ko bhi backdate karte hai, warna profile today aur activity
-- 8 months old dikhegi, jo demo me fake lagta hai.
UPDATE u
SET
    CreatedAt = DATEADD(day, -1 * (ABS(CHECKSUM(u.UserId, 'user-created')) % 300), @Now),
    UpdatedAt = DATEADD(day, -1 * (ABS(CHECKSUM(u.UserId, 'user-updated')) % 120), @Now)
FROM Users u
WHERE u.Email LIKE 'student%@training.local'
   OR u.Email LIKE 'trainer.%@training.local';

UPDATE s
SET
    CreatedAt = u.CreatedAt,
    UpdatedAt = u.UpdatedAt
FROM Students s
INNER JOIN Users u ON u.UserId = s.UserId;

PRINT 'Backdating courses...';

UPDATE c
SET
    CreatedAt = DATEADD(day, -1 * (ABS(CHECKSUM(c.CourseId, 'course-created')) % 300), @Now),
    UpdatedAt = DATEADD(day, -1 * (ABS(CHECKSUM(c.CourseId, 'course-updated')) % 120), @Now)
FROM Courses c;

PRINT 'Backdating enrollments across last 10 months with growth curve...';

;WITH OrderedEnrollments AS
(
    SELECT
        e.CourseEnrollmentId,
        ROW_NUMBER() OVER (ORDER BY e.CourseEnrollmentId) AS rn,
        COUNT(*) OVER () AS totalRows
    FROM CourseEnrollments e
),
Buckets AS
(
    SELECT
        CourseEnrollmentId,
        CASE
            WHEN rn <= totalRows * 1  / 55 THEN 9
            WHEN rn <= totalRows * 3  / 55 THEN 8
            WHEN rn <= totalRows * 6  / 55 THEN 7
            WHEN rn <= totalRows * 10 / 55 THEN 6
            WHEN rn <= totalRows * 15 / 55 THEN 5
            WHEN rn <= totalRows * 21 / 55 THEN 4
            WHEN rn <= totalRows * 28 / 55 THEN 3
            WHEN rn <= totalRows * 36 / 55 THEN 2
            WHEN rn <= totalRows * 45 / 55 THEN 1
            ELSE 0
        END AS monthOffset
    FROM OrderedEnrollments
),
EnrollmentDates AS
(
    SELECT
        CourseEnrollmentId,
        DATEADD(
            hour,
            ABS(CHECKSUM(CourseEnrollmentId, 'enroll-hour')) % 10,
            DATEADD(
                day,
                CASE
                    WHEN monthOffset = 0
                        THEN ABS(CHECKSUM(CourseEnrollmentId, 'enroll-day')) % @MaxCurrentMonthDay
                    ELSE ABS(CHECKSUM(CourseEnrollmentId, 'enroll-day')) % 25
                END,
                DATEADD(month, -monthOffset, CAST(@CurrentMonthStart AS datetime2))
            )
        ) AS enrolledAt
    FROM Buckets
)
UPDATE e
SET
    CreatedAt = d.enrolledAt,
    StartDate = d.enrolledAt,
    EndDate = DATEADD(day, 60, d.enrolledAt),
    UpdatedAt = CASE
        WHEN e.Status = 1 THEN d.enrolledAt
        ELSE DATEADD(day, 7 + (ABS(CHECKSUM(e.CourseEnrollmentId, 'enrollment-updated')) % 25), d.enrolledAt)
    END
FROM CourseEnrollments e
INNER JOIN EnrollmentDates d ON d.CourseEnrollmentId = e.CourseEnrollmentId;

PRINT 'Backdating completed enrollments...';

;WITH ProposedCompletion AS
(
    SELECT
        e.CourseEnrollmentId,
        DATEADD(day, 14 + (ABS(CHECKSUM(e.CourseEnrollmentId, 'complete-lag')) % 32), e.CreatedAt) AS proposedCompletedAt
    FROM CourseEnrollments e
    WHERE e.Status = 3
)
UPDATE e
SET
    CompletedAt = CASE
        WHEN p.proposedCompletedAt > @Now THEN @Now
        ELSE p.proposedCompletedAt
    END,
    UpdatedAt = CASE
        WHEN p.proposedCompletedAt > @Now THEN @Now
        ELSE p.proposedCompletedAt
    END
FROM CourseEnrollments e
INNER JOIN ProposedCompletion p ON p.CourseEnrollmentId = e.CourseEnrollmentId;

PRINT 'Backdating module progress...';

;WITH ProgressOrder AS
(
    SELECT
        p.StudentModuleProgressId,
        p.CourseEnrollmentId,
        ROW_NUMBER() OVER (
            PARTITION BY p.CourseEnrollmentId
            ORDER BY p.StudentModuleProgressId
        ) AS moduleNumber
    FROM StudentModuleProgress p
),
ProgressDates AS
(
    SELECT
        po.StudentModuleProgressId,
        e.CreatedAt,
        COALESCE(e.CompletedAt, e.UpdatedAt, @Now) AS capDate,
        DATEADD(
            day,
            (po.moduleNumber * 4) + (ABS(CHECKSUM(po.StudentModuleProgressId, 'module-lag')) % 4),
            e.CreatedAt
        ) AS proposedCompletedAt
    FROM ProgressOrder po
    INNER JOIN CourseEnrollments e ON e.CourseEnrollmentId = po.CourseEnrollmentId
)
UPDATE p
SET CompletedAt = CASE
    WHEN d.proposedCompletedAt > d.capDate THEN d.capDate
    ELSE d.proposedCompletedAt
END
FROM StudentModuleProgress p
INNER JOIN ProgressDates d ON d.StudentModuleProgressId = p.StudentModuleProgressId;

PRINT 'Keeping certificate issue dates unchanged...';

-- Certificate PDFs already have the issued date printed inside them.
-- Agar DB date ko backdate kar diya aur PDF me today rahe, verify page mismatch
-- dikha sakta hai. Isliye learning activity backdate hoti hai, certificates
-- apni real generated date par rehte hai.

PRINT 'Backdating notifications lightly...';

-- Bell panel me sab notifications "today" na dikhe; thoda recent spread kar dete hai.
UPDATE n
SET CreatedAt = DATEADD(day, -1 * (ABS(CHECKSUM(n.NotificationId, 'notify')) % 45), @Now)
FROM Notifications n;

PRINT 'Backdate complete.';

SELECT 'Users' AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL SELECT 'Students', COUNT(*) FROM Students
UNION ALL SELECT 'Courses', COUNT(*) FROM Courses
UNION ALL SELECT 'CourseEnrollments', COUNT(*) FROM CourseEnrollments
UNION ALL SELECT 'StudentModuleProgress', COUNT(*) FROM StudentModuleProgress
UNION ALL SELECT 'CertificateIssued', COUNT(*) FROM CertificateIssued
UNION ALL SELECT 'Notifications', COUNT(*) FROM Notifications;
