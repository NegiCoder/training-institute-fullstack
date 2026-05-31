#!/usr/bin/env bash
# =============================================================================
# Training Institute - API-only Seed Script
# =============================================================================
# What it does:
#   1. Logs in as an existing admin (already created by backend startup seeder)
#   2. Creates 3 trainers + 5 students with profiles
#   3. Creates 5 categories, 6 courses, pricing, modules, trainer assignments
#   4. Creates enrollments, marks progress, updates statuses, issues 1 certificate
#
# Requirements:
#   - Backend reachable at $API (default http://localhost:5045)
#   - jq + curl installed
#   - An admin user already exists in the database
#
# Usage:
#   bash scripts/seed-api-only.sh
#   API='https://your-azure-backend' bash scripts/seed-api-only.sh
# =============================================================================

set -euo pipefail

API="${API:-http://localhost:5045}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@training.local}"
ADMIN_PASS="${ADMIN_PASS:-Admin@12345}"
TRAINER_PASS="Trainer@123"
STUDENT_PASS="Student@123"

# ---------- helpers ---------------------------------------------------------

color() { printf "\033[%sm%s\033[0m" "$1" "$2"; }
hdr()   { echo; color "1;36" "==== $* ===="; echo; }
ok()    { color "1;32" "  ✔ $*"; echo; }
warn()  { color "1;33" "  ! $*"; echo; }
fail()  { color "1;31" "  ✗ $*"; echo; exit 1; }

# POST JSON, return body, fail on non-2xx
post() {
  local url="$1"; local data="$2"; local token="${3:-}"
  local headers=(-H "Content-Type: application/json")
  [[ -n "$token" ]] && headers+=(-H "Authorization: Bearer $token")
  local resp http
  resp=$(curl -s -w "\n__HTTP__:%{http_code}" "${headers[@]}" -X POST "$url" -d "$data")
  http=$(echo "$resp" | sed -n 's/^__HTTP__://p')
  local body; body=$(echo "$resp" | sed '$d')
  if [[ "$http" -lt 200 || "$http" -ge 300 ]]; then
    fail "POST $url -> HTTP $http\n$body"
  fi
  echo "$body"
}

# PUT JSON
put() {
  local url="$1"; local data="$2"; local token="${3:-}"
  local headers=(-H "Content-Type: application/json")
  [[ -n "$token" ]] && headers+=(-H "Authorization: Bearer $token")
  local resp http
  resp=$(curl -s -w "\n__HTTP__:%{http_code}" "${headers[@]}" -X PUT "$url" -d "$data")
  http=$(echo "$resp" | sed -n 's/^__HTTP__://p')
  local body; body=$(echo "$resp" | sed '$d')
  if [[ "$http" -lt 200 || "$http" -ge 300 ]]; then
    fail "PUT $url -> HTTP $http\n$body"
  fi
  echo "$body"
}

login() {
  local email="$1"; local pass="$2"
  post "$API/api/auth/login" "{\"email\":\"$email\",\"password\":\"$pass\"}" | jq -r '.token'
}

register_student() {
  local name="$1"; local email="$2"; local pass="$3"
  post "$API/api/auth/register" \
    "{\"fullName\":\"$name\",\"email\":\"$email\",\"password\":\"$pass\"}" >/dev/null
}

create_trainer() {
  local name="$1"; local email="$2"; local token="$3"
  post "$API/api/auth/admin/create-trainer" \
    "{\"fullName\":\"$name\",\"email\":\"$email\",\"password\":\"$TRAINER_PASS\"}" \
    "$token" | jq -r '.userId'
}

create_category() {
  local name="$1"; local token="$2"
  post "$API/api/CourseCategories" "{\"name\":\"$name\"}" "$token" \
    | jq -r '.courseCategoryId'
}

create_course() {
  local catId="$1"; local title="$2"; local desc="$3"
  local level="$4"; local mode="$5"; local duration="$6"
  local status="$7"; local featured="$8"
  local token="$9"
  post "$API/api/Courses" \
"{\"courseCategoryId\":$catId,\"title\":\"$title\",\"description\":\"$desc\",\"level\":\"$level\",\"mode\":\"$mode\",\"duration\":\"$duration\",\"status\":$status,\"isFeatured\":$featured}" \
    "$token" | jq -r '.courseId'
}

create_pricing() {
  local courseId="$1"; local year="$2"; local price="$3"; local isFree="$4"; local token="$5"
  post "$API/api/CoursePricings" \
"{\"courseId\":$courseId,\"year\":$year,\"price\":$price,\"isFree\":$isFree}" \
    "$token" >/dev/null
}

create_module() {
  local courseId="$1"; local name="$2"; local type="$3"; local url="$4"; local order="$5"; local token="$6"
  post "$API/api/CourseContents" \
"{\"courseId\":$courseId,\"moduleName\":\"$name\",\"contentType\":$type,\"urlOrPath\":\"$url\",\"sortOrder\":$order,\"isActive\":true}" \
    "$token" | jq -r '.courseContentId'
}

assign_trainer() {
  local courseId="$1"; local trainerId="$2"; local token="$3"
  post "$API/api/CourseTrainers" \
"{\"courseId\":$courseId,\"trainerId\":$trainerId}" \
    "$token" >/dev/null
}

enroll_student() {
  local courseId="$1"; local start="$2"; local end="$3"; local token="$4"
  post "$API/api/Enrollments/me" \
"{\"courseId\":$courseId,\"startDate\":\"$start\",\"endDate\":\"$end\"}" \
    "$token" | jq -r '.courseEnrollmentId'
}

mark_module_complete() {
  local enrollmentId="$1"; local contentId="$2"; local token="$3"
  post "$API/api/StudentModuleProgress/complete" \
"{\"courseEnrollmentId\":$enrollmentId,\"courseContentId\":$contentId}" \
    "$token" >/dev/null
}

update_enrollment_status() {
  local enrollmentId="$1"; local status="$2"; local token="$3"
  put "$API/api/Enrollments/$enrollmentId/status" \
"{\"status\":$status}" "$token" >/dev/null
}

issue_certificate() {
  local enrollmentId="$1"; local token="$2"
  post "$API/api/Certificates/issue" \
"{\"courseEnrollmentId\":$enrollmentId}" "$token" >/dev/null || true
}

create_profile() {
  local first="$1"; local last="$2"; local phone="$3"; local city="$4"
  local college="$5"; local passout="$6"; local token="$7"
  post "$API/api/students/me" \
"{\"firstName\":\"$first\",\"lastName\":\"$last\",\"phone\":\"$phone\",\"city\":\"$city\",\"collegeName\":\"$college\",\"passoutYear\":$passout}" \
    "$token" >/dev/null
}

# ---------- step 0: sanity check --------------------------------------------

hdr "Step 0: Sanity check"
curl -fs "$API/api/health" >/dev/null || fail "Backend not reachable at $API/api/health"
ok "Backend is reachable at $API"

# ---------- step 1: admin login --------------------------------------------

hdr "Step 1: Login as admin"
ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASS" || true)
if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  fail "Admin login failed. Make sure the backend startup seeder created an admin with email '$ADMIN_EMAIL'."
fi
ok "Admin logged in"

# ---------- step 2: trainers ------------------------------------------------

hdr "Step 2: Creating 3 trainers"
TRAINER1_ID=$(create_trainer "Aman Sharma"   "trainer.aman@training.local"   "$ADMIN_TOKEN")
TRAINER2_ID=$(create_trainer "Priya Iyer"    "trainer.priya@training.local"  "$ADMIN_TOKEN")
TRAINER3_ID=$(create_trainer "Rahul Mehta"   "trainer.rahul@training.local"  "$ADMIN_TOKEN")
TRAINER1_TOKEN=$(login "trainer.aman@training.local"  "$TRAINER_PASS")
TRAINER2_TOKEN=$(login "trainer.priya@training.local" "$TRAINER_PASS")
TRAINER3_TOKEN=$(login "trainer.rahul@training.local" "$TRAINER_PASS")
ok "Trainers created: IDs $TRAINER1_ID $TRAINER2_ID $TRAINER3_ID"

# ---------- step 3: students + profiles -------------------------------------

hdr "Step 3: Creating 5 students with profiles"
declare -a STUDENT_EMAILS=(
  "aarav@training.local"
  "diya@training.local"
  "ishaan@training.local"
  "saanvi@training.local"
  "karan@training.local"
)
declare -a STUDENT_FULL=(
  "Aarav Sharma"
  "Diya Verma"
  "Ishaan Patel"
  "Saanvi Reddy"
  "Karan Mehta"
)
declare -a STUDENT_FIRST=(Aarav Diya Ishaan Saanvi Karan)
declare -a STUDENT_LAST=(Sharma Verma Patel Reddy Mehta)
declare -a STUDENT_PHONE=(9999990001 9999990002 9999990003 9999990004 9999990005)
declare -a STUDENT_CITY=(Pune Mumbai Bangalore Hyderabad Delhi)
declare -a STUDENT_COLLEGE=("PICT" "VJTI" "RVCE" "JNTU" "DTU")
declare -a STUDENT_PASSOUT=(2024 2025 2023 2024 2025)
declare -a STUDENT_TOKENS=()

for i in "${!STUDENT_EMAILS[@]}"; do
  register_student "${STUDENT_FULL[$i]}" "${STUDENT_EMAILS[$i]}" "$STUDENT_PASS"
  TOK=$(login "${STUDENT_EMAILS[$i]}" "$STUDENT_PASS")
  STUDENT_TOKENS+=("$TOK")
  create_profile \
    "${STUDENT_FIRST[$i]}" "${STUDENT_LAST[$i]}" \
    "${STUDENT_PHONE[$i]}" "${STUDENT_CITY[$i]}" \
    "${STUDENT_COLLEGE[$i]}" "${STUDENT_PASSOUT[$i]}" \
    "$TOK"
  ok "Student ${STUDENT_EMAILS[$i]} registered + profile created"
done

# ---------- step 4: categories ----------------------------------------------

hdr "Step 4: Creating 5 categories"
CAT_PROG=$(create_category "Programming"      "$ADMIN_TOKEN")
CAT_WEB=$(create_category  "Web Development"  "$ADMIN_TOKEN")
CAT_DATA=$(create_category "Data Science"     "$ADMIN_TOKEN")
CAT_CLOUD=$(create_category "Cloud & DevOps"  "$ADMIN_TOKEN")
CAT_MOB=$(create_category  "Mobile"           "$ADMIN_TOKEN")
ok "Categories: $CAT_PROG $CAT_WEB $CAT_DATA $CAT_CLOUD $CAT_MOB"

# ---------- step 5: courses + pricing + modules + trainers ------------------

hdr "Step 5: Creating 6 courses (with pricing, modules, trainer assignments)"

# status: 1=Draft, 2=Published, 3=Archived
# contentType: 1=Video, 2=Pdf, 3=Link

# --- Course 1: ASP.NET Core Mastery (Trainer: Aman) ---
C1=$(create_course "$CAT_PROG" "ASP.NET Core Mastery" \
  "Build production grade Web APIs using ASP.NET Core 8 with EF Core, JWT and clean architecture." \
  "Intermediate" "Online" "10 weeks" 2 true "$ADMIN_TOKEN")
create_pricing "$C1" 2025 14999 false "$ADMIN_TOKEN"
create_pricing "$C1" 2026 16999 false "$ADMIN_TOKEN"
assign_trainer "$C1" "$TRAINER1_ID" "$ADMIN_TOKEN"
C1M1=$(create_module "$C1" "Intro to ASP.NET Core"      1 "https://example.com/aspnet/01.mp4" 1 "$TRAINER1_TOKEN")
C1M2=$(create_module "$C1" "Controllers & Routing"      1 "https://example.com/aspnet/02.mp4" 2 "$TRAINER1_TOKEN")
C1M3=$(create_module "$C1" "Entity Framework Core"      1 "https://example.com/aspnet/03.mp4" 3 "$TRAINER1_TOKEN")
C1M4=$(create_module "$C1" "JWT Auth & Roles"           2 "https://example.com/aspnet/04.pdf" 4 "$TRAINER1_TOKEN")
ok "Course 1 (ASP.NET Core Mastery) ready"

# --- Course 2: Java Spring Boot Fundamentals (Trainers: Aman + Priya) ---
C2=$(create_course "$CAT_PROG" "Java Spring Boot Fundamentals" \
  "Master Spring Boot, Spring Data JPA, REST APIs and Spring Security." \
  "Beginner" "Hybrid" "8 weeks" 2 false "$ADMIN_TOKEN")
create_pricing "$C2" 2025 12999 false "$ADMIN_TOKEN"
create_pricing "$C2" 2026 13999 false "$ADMIN_TOKEN"
assign_trainer "$C2" "$TRAINER1_ID" "$ADMIN_TOKEN"
assign_trainer "$C2" "$TRAINER2_ID" "$ADMIN_TOKEN"
C2M1=$(create_module "$C2" "Java Refresher"             1 "https://example.com/spring/01.mp4" 1 "$TRAINER1_TOKEN")
C2M2=$(create_module "$C2" "Spring Boot Basics"         1 "https://example.com/spring/02.mp4" 2 "$TRAINER1_TOKEN")
C2M3=$(create_module "$C2" "Spring Data JPA"            2 "https://example.com/spring/03.pdf" 3 "$TRAINER2_TOKEN")
C2M4=$(create_module "$C2" "Spring Security & JWT"      3 "https://docs.spring.io/security"   4 "$TRAINER2_TOKEN")
ok "Course 2 (Spring Boot) ready"

# --- Course 3: React from Zero to Hero (Trainer: Priya) ---
C3=$(create_course "$CAT_WEB" "React from Zero to Hero" \
  "Build modern SPAs with React 19, Vite, React Router, hooks, Zustand and forms." \
  "Beginner" "Online" "6 weeks" 2 true "$ADMIN_TOKEN")
create_pricing "$C3" 2025 0 true "$ADMIN_TOKEN"
create_pricing "$C3" 2026 9999 false "$ADMIN_TOKEN"
assign_trainer "$C3" "$TRAINER2_ID" "$ADMIN_TOKEN"
C3M1=$(create_module "$C3" "What is React?"             1 "https://example.com/react/01.mp4" 1 "$TRAINER2_TOKEN")
C3M2=$(create_module "$C3" "JSX & Components"           1 "https://example.com/react/02.mp4" 2 "$TRAINER2_TOKEN")
C3M3=$(create_module "$C3" "Hooks Deep Dive"            1 "https://example.com/react/03.mp4" 3 "$TRAINER2_TOKEN")
C3M4=$(create_module "$C3" "Routing & State"            2 "https://example.com/react/04.pdf" 4 "$TRAINER2_TOKEN")
C3M5=$(create_module "$C3" "Cheat Sheet"                3 "https://react.dev/learn"           5 "$TRAINER2_TOKEN")
ok "Course 3 (React) ready"

# --- Course 4: Full-Stack MERN Bootcamp (Trainers: Priya + Rahul) ---
C4=$(create_course "$CAT_WEB" "Full-Stack MERN Bootcamp" \
  "Build complete apps with MongoDB, Express, React and Node.js. Includes deployment." \
  "Advanced" "Hybrid" "12 weeks" 2 true "$ADMIN_TOKEN")
create_pricing "$C4" 2026 24999 false "$ADMIN_TOKEN"
assign_trainer "$C4" "$TRAINER2_ID" "$ADMIN_TOKEN"
assign_trainer "$C4" "$TRAINER3_ID" "$ADMIN_TOKEN"
C4M1=$(create_module "$C4" "Node.js + Express"          1 "https://example.com/mern/01.mp4" 1 "$TRAINER3_TOKEN")
C4M2=$(create_module "$C4" "MongoDB & Mongoose"         1 "https://example.com/mern/02.mp4" 2 "$TRAINER3_TOKEN")
C4M3=$(create_module "$C4" "Building the API"           1 "https://example.com/mern/03.mp4" 3 "$TRAINER3_TOKEN")
C4M4=$(create_module "$C4" "React Frontend"             1 "https://example.com/mern/04.mp4" 4 "$TRAINER2_TOKEN")
C4M5=$(create_module "$C4" "Deploy to Render & Vercel"  2 "https://example.com/mern/05.pdf" 5 "$TRAINER3_TOKEN")
ok "Course 4 (MERN) ready"

# --- Course 5: Python for Data Science (Trainer: Rahul) ---
C5=$(create_course "$CAT_DATA" "Python for Data Science" \
  "Numpy, Pandas, Matplotlib, Seaborn, scikit-learn. End to end ML project." \
  "Intermediate" "Online" "10 weeks" 2 false "$ADMIN_TOKEN")
create_pricing "$C5" 2025 11999 false "$ADMIN_TOKEN"
create_pricing "$C5" 2026 12999 false "$ADMIN_TOKEN"
assign_trainer "$C5" "$TRAINER3_ID" "$ADMIN_TOKEN"
C5M1=$(create_module "$C5" "Python Refresher"           1 "https://example.com/pyds/01.mp4" 1 "$TRAINER3_TOKEN")
C5M2=$(create_module "$C5" "Numpy & Pandas"             1 "https://example.com/pyds/02.mp4" 2 "$TRAINER3_TOKEN")
C5M3=$(create_module "$C5" "Visualization"              1 "https://example.com/pyds/03.mp4" 3 "$TRAINER3_TOKEN")
C5M4=$(create_module "$C5" "scikit-learn Intro"         2 "https://example.com/pyds/04.pdf" 4 "$TRAINER3_TOKEN")
ok "Course 5 (Python DS) ready"

# --- Course 6: AWS Cloud Practitioner (Trainer: Aman, status=Draft) ---
C6=$(create_course "$CAT_CLOUD" "AWS Cloud Practitioner" \
  "Foundational AWS certification prep — EC2, S3, IAM, VPC, billing." \
  "Beginner" "Online" "4 weeks" 1 false "$ADMIN_TOKEN")
create_pricing "$C6" 2026 7999 false "$ADMIN_TOKEN"
assign_trainer "$C6" "$TRAINER1_ID" "$ADMIN_TOKEN"
C6M1=$(create_module "$C6" "AWS Overview"               1 "https://example.com/aws/01.mp4" 1 "$TRAINER1_TOKEN")
C6M2=$(create_module "$C6" "Compute & Storage"          1 "https://example.com/aws/02.mp4" 2 "$TRAINER1_TOKEN")
C6M3=$(create_module "$C6" "Networking & IAM"           2 "https://example.com/aws/03.pdf" 3 "$TRAINER1_TOKEN")
ok "Course 6 (AWS) ready (status=Draft)"

# ---------- step 6: enrollments ---------------------------------------------

hdr "Step 6: Creating enrollments"

YEAR_AGO=$(date -u -v -30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)
TODAY=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TWO_MONTHS=$(date -u -v +60d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '60 days' +%Y-%m-%dT%H:%M:%SZ)

S1=${STUDENT_TOKENS[0]}
E_S1_C1=$(enroll_student "$C1" "$YEAR_AGO" "$TWO_MONTHS" "$S1")
E_S1_C3=$(enroll_student "$C3" "$TODAY"    "$TWO_MONTHS" "$S1")

S2=${STUDENT_TOKENS[1]}
E_S2_C5=$(enroll_student "$C5" "$YEAR_AGO" "$TWO_MONTHS" "$S2")
E_S2_C1=$(enroll_student "$C1" "$TODAY"    "$TWO_MONTHS" "$S2")

S3=${STUDENT_TOKENS[2]}
E_S3_C2=$(enroll_student "$C2" "$YEAR_AGO" "$TODAY"      "$S3")
E_S3_C3=$(enroll_student "$C3" "$YEAR_AGO" "$TWO_MONTHS" "$S3")

S4=${STUDENT_TOKENS[3]}
E_S4_C4=$(enroll_student "$C4" "$TODAY"    "$TWO_MONTHS" "$S4")

S5=${STUDENT_TOKENS[4]}
E_S5_C3=$(enroll_student "$C3" "$YEAR_AGO" "$TWO_MONTHS" "$S5")
E_S5_C5=$(enroll_student "$C5" "$TODAY"    "$TWO_MONTHS" "$S5")

ok "Enrollments created"

# ---------- step 7: module progress ----------------------------------------

hdr "Step 7: Marking module progress"

mark_module_complete "$E_S1_C1" "$C1M1" "$S1"
mark_module_complete "$E_S1_C1" "$C1M2" "$S1"

mark_module_complete "$E_S2_C5" "$C5M1" "$S2"
mark_module_complete "$E_S2_C5" "$C5M2" "$S2"
mark_module_complete "$E_S2_C5" "$C5M3" "$S2"

mark_module_complete "$E_S3_C2" "$C2M1" "$S3"
mark_module_complete "$E_S3_C2" "$C2M2" "$S3"
mark_module_complete "$E_S3_C2" "$C2M3" "$S3"
mark_module_complete "$E_S3_C2" "$C2M4" "$S3"

mark_module_complete "$E_S5_C3" "$C3M1" "$S5"
mark_module_complete "$E_S5_C3" "$C3M2" "$S5"

ok "Progress recorded"

# ---------- step 8: admin status updates -----------------------------------

hdr "Step 8: Admin moves enrollments through lifecycle"

update_enrollment_status "$E_S1_C1" 2 "$ADMIN_TOKEN"
update_enrollment_status "$E_S2_C5" 2 "$ADMIN_TOKEN"
update_enrollment_status "$E_S5_C3" 2 "$ADMIN_TOKEN"
update_enrollment_status "$E_S3_C2" 3 "$ADMIN_TOKEN"

ok "Statuses updated"

# ---------- step 9: certificate -------------------------------------------

hdr "Step 9: Issuing certificate for the completed enrollment"
issue_certificate "$E_S3_C2" "$ADMIN_TOKEN"
ok "Certificate issued (email may fail in dev — OK)"

# ---------- summary --------------------------------------------------------

hdr "Seed complete"

echo
color "1;32" "All done. Login credentials below:"; echo
echo "  Admin    : $ADMIN_EMAIL  /  $ADMIN_PASS"
echo "  Trainers : trainer.aman@training.local   /  $TRAINER_PASS"
echo "             trainer.priya@training.local  /  $TRAINER_PASS"
echo "             trainer.rahul@training.local  /  $TRAINER_PASS"
echo "  Students : aarav@training.local    /  $STUDENT_PASS"
echo "             diya@training.local     /  $STUDENT_PASS"
echo "             ishaan@training.local   /  $STUDENT_PASS"
echo "             saanvi@training.local   /  $STUDENT_PASS"
echo "             karan@training.local    /  $STUDENT_PASS"
echo