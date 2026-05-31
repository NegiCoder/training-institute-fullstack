#!/usr/bin/env bash
# =============================================================================
# Training Institute - BULK API Seed Script (Azure / any environment)
# =============================================================================
# What it does:
#   - 1 admin (must already exist + be promoted to Role=3 in DB)
#   - 10 trainers (created via admin)
#   - 100 students (registered + full profiles)
#   - 8 categories
#   - 30 courses with pricing, modules and trainer assignments
#   - ~200 enrollments distributed across students
#   - Module progress for many enrollments
#   - Status lifecycle moves and a handful of certificates
#
# Requirements:
#   - Backend reachable at $API (Azure URL or local)
#   - jq + curl installed
#   - An admin user already exists with Role=3 in the DB
#       (for Azure, see scripts/SEED_BOOTSTRAP.md)
#
# Usage:
#   API='https://training-institute-api.wittywave-65888691.centralindia.azurecontainerapps.io' \
#   bash scripts/seed-azure-bulk.sh
# =============================================================================

set -euo pipefail

API="${API:-http://localhost:5045}"

NUM_TRAINERS=10
NUM_STUDENTS=100

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
  local status="$7"; local openAccess="$8"; local featured="$9"
  local token="${10}"
  post "$API/api/Courses" \
"{\"courseCategoryId\":$catId,\"title\":\"$title\",\"description\":\"$desc\",\"level\":\"$level\",\"mode\":\"$mode\",\"duration\":\"$duration\",\"status\":$status,\"isOpenAccess\":$openAccess,\"isFeatured\":$featured}" \
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

# ---------- name + city pools ----------------------------------------------

FIRST_NAMES=(Aarav Diya Ishaan Saanvi Karan Aryan Riya Vivaan Anaya Atharv \
  Aadhya Vihaan Ananya Reyansh Pari Ayaan Aaradhya Sai Avani Krish \
  Khushi Arjun Myra Dhruv Ira Yuvraj Tara Aanya Kabir Anvi \
  Aarush Navya Veer Aarna Shaurya Suhana Rudra Pihu Ranveer Saira \
  Adya Trisha Ayush Niharika Mahika Daksh Yash Anushka Pranav Charvi \
  Aditya Avantika Misha Ronak Tia Yashvi Kian Mishti Hriday Aniket \
  Mira Aditi Anika Lakshya Aarush Aanya Yug Pari Krish Anaya \
  Vidya Rohit Sneha Aakash Pooja Manish Neha Vikas Swati Amit \
  Ritu Sandeep Megha Rajesh Anita Suresh Divya Mahesh Geeta Naveen \
  Shalini Vijay Anjali Deepak Aishwarya Nikhil Preeti Sagar Tanvi Harsh)

LAST_NAMES=(Sharma Verma Patel Reddy Mehta Singh Iyer Nair Gupta Kumar \
  Joshi Khanna Kapoor Bose Chatterjee Mukherjee Choudhary Banerjee Sen Das \
  Saxena Aggarwal Bansal Goyal Mittal Tiwari Yadav Pandey Mishra Tripathi \
  Shukla Trivedi Dubey Chauhan Rajput Rana Bisht Negi Rawat Thakur \
  Bhatt Pant Bhandari Pillai Menon Krishnan Subramanian Anand Malhotra Kohli \
  Chopra Bhalla Sethi Ahuja Wadhwa Bhasin Tandon Bedi Kapur Kaul)

CITIES=(Pune Mumbai Bangalore Hyderabad Delhi Chennai Kolkata Ahmedabad Jaipur \
  Lucknow Indore Chandigarh Coimbatore Kochi Bhopal Vadodara Nagpur Surat \
  Patna Visakhapatnam Mysore Mangalore Trivandrum Noida Gurgaon)

COLLEGES=("PICT" "VJTI" "RVCE" "JNTU" "DTU" "NIT Trichy" "IIT Delhi" \
  "BITS Pilani" "VIT Vellore" "MIT Manipal" "SRM" "PSG Tech" \
  "IIIT Hyderabad" "COEP" "Thapar" "NSIT" "Jadavpur" "Anna University" \
  "BMS College" "MS Ramaiah")

PASSOUT_YEARS=(2022 2023 2024 2025 2026)

TRAINER_FIRST=(Aman Priya Rahul Kavita Vikram Neha Suresh Anjali Deepak Pooja)
TRAINER_LAST=(Sharma Iyer Mehta Khanna Singh Verma Reddy Nair Joshi Gupta)

# ---------- step 0: sanity check --------------------------------------------

hdr "Step 0: Sanity check"
curl -fs "$API/api/health" >/dev/null || fail "Backend not reachable at $API/api/health"
ok "Backend is reachable at $API"

# ---------- step 1: admin login --------------------------------------------

hdr "Step 1: Login as admin ($ADMIN_EMAIL)"
ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASS" || true)
if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  fail "Admin login failed. See scripts/SEED_BOOTSTRAP.md to create + promote admin first."
fi
ok "Admin logged in"

# ---------- step 2: trainers ------------------------------------------------

hdr "Step 2: Creating $NUM_TRAINERS trainers"
declare -a TRAINER_IDS=()
declare -a TRAINER_TOKENS=()
declare -a TRAINER_EMAILS=()
for ((i=0; i<NUM_TRAINERS; i++)); do
  FIRST="${TRAINER_FIRST[$i]}"
  LAST="${TRAINER_LAST[$i]}"
  EMAIL="trainer.${FIRST,,}.${LAST,,}@training.local"
  FULL="$FIRST $LAST"
  TID=$(create_trainer "$FULL" "$EMAIL" "$ADMIN_TOKEN")
  TTOK=$(login "$EMAIL" "$TRAINER_PASS")
  TRAINER_IDS+=("$TID")
  TRAINER_TOKENS+=("$TTOK")
  TRAINER_EMAILS+=("$EMAIL")
  ok "Trainer #$((i+1)): $FULL ($EMAIL, userId=$TID)"
done

# ---------- step 3: students + profiles -------------------------------------

hdr "Step 3: Creating $NUM_STUDENTS students with profiles"
declare -a STUDENT_TOKENS=()
declare -a STUDENT_EMAILS=()
for ((i=0; i<NUM_STUDENTS; i++)); do
  FIRST="${FIRST_NAMES[$((RANDOM % ${#FIRST_NAMES[@]}))]}"
  LAST="${LAST_NAMES[$((RANDOM % ${#LAST_NAMES[@]}))]}"
  EMAIL="student$(printf "%03d" $((i+1)))@training.local"
  FULL="$FIRST $LAST"
  PHONE="9$(printf "%09d" $((900000000 + i)))"
  CITY="${CITIES[$((RANDOM % ${#CITIES[@]}))]}"
  COLLEGE="${COLLEGES[$((RANDOM % ${#COLLEGES[@]}))]}"
  PASSOUT="${PASSOUT_YEARS[$((RANDOM % ${#PASSOUT_YEARS[@]}))]}"
  register_student "$FULL" "$EMAIL" "$STUDENT_PASS"
  TOK=$(login "$EMAIL" "$STUDENT_PASS")
  STUDENT_TOKENS+=("$TOK")
  STUDENT_EMAILS+=("$EMAIL")
  create_profile "$FIRST" "$LAST" "$PHONE" "$CITY" "$COLLEGE" "$PASSOUT" "$TOK"
  if (( (i+1) % 10 == 0 )); then
    ok "  Registered $((i+1))/$NUM_STUDENTS students..."
  fi
done
ok "All $NUM_STUDENTS students created"

# ---------- step 4: categories ----------------------------------------------

hdr "Step 4: Creating 8 categories"
CAT_PROG=$(create_category   "Programming"      "$ADMIN_TOKEN")
CAT_WEB=$(create_category    "Web Development"  "$ADMIN_TOKEN")
CAT_DATA=$(create_category   "Data Science"     "$ADMIN_TOKEN")
CAT_CLOUD=$(create_category  "Cloud & DevOps"   "$ADMIN_TOKEN")
CAT_MOB=$(create_category    "Mobile"           "$ADMIN_TOKEN")
CAT_AI=$(create_category     "AI / ML"          "$ADMIN_TOKEN")
CAT_SEC=$(create_category    "Cybersecurity"    "$ADMIN_TOKEN")
CAT_DB=$(create_category     "Database"         "$ADMIN_TOKEN")
ok "Categories created"

# ---------- step 5: 30 courses + pricing + modules + trainer assignments ----

hdr "Step 5: Creating 30 courses (pricing + modules + trainers)"

# status: 1=Draft, 2=Published, 3=Archived
# contentType: 1=Video, 2=Pdf, 3=Link

# Course rows: catId | title | description | level | mode | duration | status | openAccess | featured
declare -a COURSES=(
"$CAT_PROG|ASP.NET Core Mastery|Build production grade Web APIs using ASP.NET Core 8 with EF Core, JWT and clean architecture.|Intermediate|Online|10 weeks|2|true|true"
"$CAT_PROG|Java Spring Boot Fundamentals|Master Spring Boot, Spring Data JPA, REST APIs and Spring Security.|Beginner|Hybrid|8 weeks|2|true|false"
"$CAT_PROG|Modern C++ Programming|C++17 and C++20 features, RAII, smart pointers and templates.|Advanced|Online|10 weeks|2|true|false"
"$CAT_PROG|Go for Backend Developers|Build scalable backends with Go, goroutines and channels.|Intermediate|Online|6 weeks|2|true|false"
"$CAT_PROG|Rust Programming Bootcamp|Systems programming with Rust, ownership, lifetimes and async.|Advanced|Online|8 weeks|2|true|false"

"$CAT_WEB|React from Zero to Hero|Build modern SPAs with React 19, Vite, React Router, hooks and forms.|Beginner|Online|6 weeks|2|true|true"
"$CAT_WEB|Full-Stack MERN Bootcamp|Build complete apps with MongoDB, Express, React and Node.js. Includes deployment.|Advanced|Hybrid|12 weeks|2|false|true"
"$CAT_WEB|Vue.js Complete Guide|Composition API, Pinia, Vue Router and Vite tooling.|Intermediate|Online|6 weeks|2|true|false"
"$CAT_WEB|Angular for Enterprise Apps|Build large Angular apps with RxJS and signals.|Advanced|Hybrid|10 weeks|2|false|false"
"$CAT_WEB|Next.js Production Apps|App Router, server components and edge runtime.|Intermediate|Online|6 weeks|2|true|true"

"$CAT_DATA|Python for Data Science|Numpy, Pandas, Matplotlib, Seaborn and scikit-learn.|Intermediate|Online|10 weeks|2|true|false"
"$CAT_DATA|R Programming for Statistics|Data analysis and visualization with R and ggplot2.|Beginner|Online|6 weeks|2|true|false"
"$CAT_DATA|Data Analysis with Pandas|Cleaning, transforming and visualizing data with Pandas.|Intermediate|Online|4 weeks|2|true|true"
"$CAT_DATA|Big Data with Apache Spark|Distributed data processing with PySpark and Spark SQL.|Advanced|Hybrid|8 weeks|2|false|false"

"$CAT_CLOUD|AWS Cloud Practitioner|Foundational AWS certification prep — EC2, S3, IAM, VPC, billing.|Beginner|Online|4 weeks|1|true|false"
"$CAT_CLOUD|Azure Fundamentals|Azure services overview, identity, networking and AZ-900 prep.|Beginner|Online|4 weeks|2|true|true"
"$CAT_CLOUD|Kubernetes for DevOps|Pods, deployments, services, ingress and Helm.|Advanced|Hybrid|8 weeks|2|false|true"
"$CAT_CLOUD|Docker and Containers Deep Dive|Images, networking, volumes, Compose and best practices.|Intermediate|Online|4 weeks|2|true|false"

"$CAT_MOB|Flutter Mobile App Development|Build cross-platform apps with Flutter, Dart and Riverpod.|Intermediate|Online|8 weeks|2|true|true"
"$CAT_MOB|React Native Crash Course|Build mobile apps reusing your React skills.|Intermediate|Online|6 weeks|2|true|false"
"$CAT_MOB|iOS Development with Swift|SwiftUI, MVVM and Combine for iOS apps.|Beginner|Hybrid|8 weeks|2|false|false"

"$CAT_AI|Machine Learning Foundations|Supervised, unsupervised learning and model evaluation.|Intermediate|Online|10 weeks|2|true|true"
"$CAT_AI|Deep Learning with PyTorch|Neural networks, CNNs, RNNs and transfer learning with PyTorch.|Advanced|Hybrid|12 weeks|2|false|true"
"$CAT_AI|Natural Language Processing|Transformers, tokenization, embeddings and fine-tuning.|Advanced|Online|8 weeks|2|true|false"
"$CAT_AI|Computer Vision Essentials|Image classification, detection and segmentation with deep learning.|Intermediate|Online|8 weeks|2|true|false"

"$CAT_SEC|Ethical Hacking Bootcamp|Recon, scanning, exploitation and reporting.|Intermediate|Hybrid|10 weeks|2|false|true"
"$CAT_SEC|Network Security Fundamentals|Firewalls, IDS, VPN and secure protocols.|Beginner|Online|6 weeks|2|true|false"
"$CAT_SEC|Web Application Security|OWASP Top 10, SAST, DAST and secure coding.|Advanced|Online|8 weeks|2|true|false"

"$CAT_DB|SQL Mastery|Joins, indexes, window functions and query tuning.|Beginner|Online|6 weeks|2|true|true"
"$CAT_DB|MongoDB for Developers|Documents, aggregation pipeline and indexing.|Intermediate|Online|4 weeks|2|true|false"
)

declare -a COURSE_IDS=()
declare -a COURSE_MODULE_LISTS=()
declare -a COURSE_TRAINER_TOKENS=()

CIDX=0
for row in "${COURSES[@]}"; do
  IFS='|' read -r CAT TITLE DESC LEVEL MODE DURATION STATUS OPEN FEAT <<< "$row"

  COURSE_ID=$(create_course "$CAT" "$TITLE" "$DESC" "$LEVEL" "$MODE" "$DURATION" "$STATUS" "$OPEN" "$FEAT" "$ADMIN_TOKEN")
  COURSE_IDS+=("$COURSE_ID")

  # 1-2 pricings per course
  PRICE=$((((RANDOM % 20) + 5) * 1000))
  IS_FREE="false"
  if (( RANDOM % 8 == 0 )); then
    PRICE=0
    IS_FREE="true"
  fi
  create_pricing "$COURSE_ID" 2025 "$PRICE" "$IS_FREE" "$ADMIN_TOKEN"
  if (( RANDOM % 2 == 0 )); then
    NEW_PRICE=$((PRICE + 2000))
    [[ "$IS_FREE" == "true" ]] && NEW_PRICE=$((((RANDOM % 15) + 5) * 1000))
    create_pricing "$COURSE_ID" 2026 "$NEW_PRICE" "false" "$ADMIN_TOKEN"
  fi

  # 1-2 trainers per course
  T1=$((RANDOM % NUM_TRAINERS))
  assign_trainer "$COURSE_ID" "${TRAINER_IDS[$T1]}" "$ADMIN_TOKEN"
  PRIMARY_TRAINER_TOKEN="${TRAINER_TOKENS[$T1]}"
  if (( RANDOM % 3 == 0 )); then
    T2=$(((T1 + 1 + RANDOM % (NUM_TRAINERS - 1)) % NUM_TRAINERS))
    assign_trainer "$COURSE_ID" "${TRAINER_IDS[$T2]}" "$ADMIN_TOKEN"
  fi
  COURSE_TRAINER_TOKENS+=("$PRIMARY_TRAINER_TOKEN")

  # 3-5 modules created by the assigned trainer
  NUM_MODULES=$(( (RANDOM % 3) + 3 ))
  MODULE_IDS=""
  for ((m=1; m<=NUM_MODULES; m++)); do
    MTYPE=$(( (RANDOM % 3) + 1 ))
    case "$MTYPE" in
      1) URL="https://example.com/courses/${COURSE_ID}/module${m}.mp4" ;;
      2) URL="https://example.com/courses/${COURSE_ID}/module${m}.pdf" ;;
      3) URL="https://example.com/courses/${COURSE_ID}/module${m}" ;;
    esac
    MNAME="Module $m"
    MID=$(create_module "$COURSE_ID" "$MNAME" "$MTYPE" "$URL" "$m" "$PRIMARY_TRAINER_TOKEN")
    MODULE_IDS="${MODULE_IDS}${MID} "
  done
  COURSE_MODULE_LISTS+=("$MODULE_IDS")

  CIDX=$((CIDX + 1))
  if (( CIDX % 5 == 0 )); then
    ok "  Created $CIDX/30 courses..."
  fi
done
ok "All 30 courses ready"

# ---------- step 6: enrollments ---------------------------------------------

hdr "Step 6: Creating enrollments (each student in 1-3 courses)"

YEAR_AGO=$(date -u -v -30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)
TODAY=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TWO_MONTHS=$(date -u -v +60d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '60 days' +%Y-%m-%dT%H:%M:%SZ)

declare -a ALL_ENROLLMENT_IDS=()
declare -a ALL_ENROLLMENT_STUDENT_TOKENS=()
declare -a ALL_ENROLLMENT_COURSE_IDX=()

NUM_COURSES=${#COURSE_IDS[@]}
for ((s=0; s<NUM_STUDENTS; s++)); do
  STOK="${STUDENT_TOKENS[$s]}"
  NUM_ENROLLS=$(( (RANDOM % 3) + 1 ))
  # pick distinct course indexes
  declare -a PICKED=()
  while (( ${#PICKED[@]} < NUM_ENROLLS )); do
    IDX=$((RANDOM % NUM_COURSES))
    DUP=0
    for p in "${PICKED[@]:-}"; do
      [[ "$p" == "$IDX" ]] && DUP=1 && break
    done
    [[ $DUP -eq 0 ]] && PICKED+=("$IDX")
  done

  for IDX in "${PICKED[@]}"; do
    CID="${COURSE_IDS[$IDX]}"
    if (( RANDOM % 2 == 0 )); then
      START="$YEAR_AGO"
    else
      START="$TODAY"
    fi
    EID=$(enroll_student "$CID" "$START" "$TWO_MONTHS" "$STOK" || true)
    if [[ -n "$EID" && "$EID" != "null" ]]; then
      ALL_ENROLLMENT_IDS+=("$EID")
      ALL_ENROLLMENT_STUDENT_TOKENS+=("$STOK")
      ALL_ENROLLMENT_COURSE_IDX+=("$IDX")
    fi
  done
  unset PICKED

  if (( (s+1) % 20 == 0 )); then
    ok "  Enrolled $((s+1))/$NUM_STUDENTS students..."
  fi
done
ok "Total enrollments created: ${#ALL_ENROLLMENT_IDS[@]}"

# ---------- step 7: progress + status -------------------------------------

hdr "Step 7: Random module progress + status lifecycle"

NUM_ENROLLMENTS=${#ALL_ENROLLMENT_IDS[@]}
COMPLETED_ENROLLMENT_IDS=()

for ((e=0; e<NUM_ENROLLMENTS; e++)); do
  EID="${ALL_ENROLLMENT_IDS[$e]}"
  STOK="${ALL_ENROLLMENT_STUDENT_TOKENS[$e]}"
  CIDX="${ALL_ENROLLMENT_COURSE_IDX[$e]}"
  MODULES_STR="${COURSE_MODULE_LISTS[$CIDX]}"
  # split modules into array
  read -r -a MODULES <<< "$MODULES_STR"
  MOD_COUNT=${#MODULES[@]}

  ROLL=$((RANDOM % 10))
  if (( ROLL < 4 )); then
    # 40% complete some modules but not all (in progress)
    DONE=$(( (RANDOM % (MOD_COUNT - 1)) + 1 ))
    for ((m=0; m<DONE; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 2 "$ADMIN_TOKEN" || true
  elif (( ROLL < 6 )); then
    # 20% complete all modules and mark completed
    for ((m=0; m<MOD_COUNT; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 3 "$ADMIN_TOKEN" || true
    COMPLETED_ENROLLMENT_IDS+=("$EID")
  fi
  # else 40% remains in initial Pending state with no progress

  if (( (e+1) % 50 == 0 )); then
    ok "  Updated progress for $((e+1))/$NUM_ENROLLMENTS enrollments..."
  fi
done
ok "Progress + lifecycle done. Completed: ${#COMPLETED_ENROLLMENT_IDS[@]}"

# ---------- step 8: certificates -------------------------------------------

hdr "Step 8: Issuing certificates for first 10 completed enrollments"
COUNT=0
for EID in "${COMPLETED_ENROLLMENT_IDS[@]}"; do
  [[ $COUNT -ge 10 ]] && break
  issue_certificate "$EID" "$ADMIN_TOKEN"
  COUNT=$((COUNT + 1))
done
ok "Certificates issued: $COUNT"

# ---------- summary --------------------------------------------------------

hdr "Seed complete"

echo
color "1;32" "Login credentials:"; echo
echo "  Admin    : $ADMIN_EMAIL  /  $ADMIN_PASS"
echo
echo "  Trainers : (password = $TRAINER_PASS)"
for e in "${TRAINER_EMAILS[@]}"; do echo "             $e"; done
echo
echo "  Students : (password = $STUDENT_PASS)"
echo "             student001@training.local ... student$(printf "%03d" "$NUM_STUDENTS")@training.local"
echo
echo "  Categories : 8"
echo "  Courses    : 30"
echo "  Enrollments: ${#ALL_ENROLLMENT_IDS[@]}"
echo "  Certificates issued: $COUNT"
echo
