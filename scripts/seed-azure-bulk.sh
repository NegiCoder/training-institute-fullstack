#!/usr/bin/env bash
# Copyright (c) 2026 Anshul Negi
# GitHub: https://github.com/NegiCoder
# Unauthorized copying, modification, or distribution of this file
# without explicit permission is prohibited.

# =============================================================================
# ExcelGens - BULK API Seed Script (Azure / any environment)
# =============================================================================
# What it does:
#   - 1 admin (must already exist + be promoted to Role=3 in DB)
#   - 1 business user (reports-only demo account)
#   - 15 trainers (created via admin)
#   - 150 students (registered + full profiles)
#   - 10 categories
#   - 80 courses with pricing, modules and trainer assignments
#       * every course has a 2026 pricing row (~30% Free, rest Paid)
#       * many courses also have a 2025 historical pricing row
#       * a few Draft courses for testing draft visibility
#   - ~600 enrollments distributed with demo-friendly variance
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

NUM_TRAINERS=15
NUM_STUDENTS=150
TARGET_CERTIFICATES=25

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@training.local}"
ADMIN_PASS="${ADMIN_PASS:-Admin@12345}"
TRAINER_PASS="Trainer@123"
STUDENT_PASS="Student@123"
BUSINESS_PASS="Business@123"

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

create_business_user() {
  local name="$1"; local email="$2"; local token="$3"
  post "$API/api/auth/admin/create-business-user" \
    "{\"fullName\":\"$name\",\"email\":\"$email\",\"password\":\"$BUSINESS_PASS\"}" \
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
  local resp http
  resp=$(curl -s -w "\n__HTTP__:%{http_code}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -X POST "$API/api/Certificates/issue" \
    -d "{\"courseEnrollmentId\":$enrollmentId}")
  http=$(echo "$resp" | sed -n 's/^__HTTP__://p')

  [[ "$http" -ge 200 && "$http" -lt 300 ]]
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

TRAINER_FIRST=(Aman Priya Rahul Kavita Vikram Neha Suresh Anjali Deepak Pooja Manish Divya Rohan Meera Arjun)
TRAINER_LAST=(Sharma Iyer Mehta Khanna Singh Verma Reddy Nair Joshi Gupta Pant Saxena Kapoor Bose Malhotra)

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

# ---------- step 2: business user -------------------------------------------

hdr "Step 2: Creating business user (reports-only)"
BUSINESS_EMAIL="business@training.local"
BUSINESS_USER_ID=$(create_business_user "Business Analyst" "$BUSINESS_EMAIL" "$ADMIN_TOKEN")
ok "Business user: Business Analyst ($BUSINESS_EMAIL, userId=$BUSINESS_USER_ID)"

# ---------- step 3: trainers ------------------------------------------------

hdr "Step 3: Creating $NUM_TRAINERS trainers"
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

# ---------- step 4: students + profiles -------------------------------------

hdr "Step 4: Creating $NUM_STUDENTS students with profiles"
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

# ---------- step 5: categories ----------------------------------------------

hdr "Step 5: Creating 10 categories"
CAT_PROG=$(create_category   "Programming"      "$ADMIN_TOKEN")
CAT_WEB=$(create_category    "Web Development"  "$ADMIN_TOKEN")
CAT_DATA=$(create_category   "Data Science"     "$ADMIN_TOKEN")
CAT_CLOUD=$(create_category  "Cloud & DevOps"   "$ADMIN_TOKEN")
CAT_MOB=$(create_category    "Mobile"           "$ADMIN_TOKEN")
CAT_AI=$(create_category     "AI / ML"          "$ADMIN_TOKEN")
CAT_SEC=$(create_category    "Cybersecurity"    "$ADMIN_TOKEN")
CAT_DB=$(create_category     "Database"         "$ADMIN_TOKEN")
CAT_QA=$(create_category     "Software Testing" "$ADMIN_TOKEN")
CAT_PRODUCT=$(create_category "Product & Design" "$ADMIN_TOKEN")
ok "Categories created"

# status: 1=Draft, 2=Published, 3=Archived
# contentType: 1=Video, 2=Pdf, 3=Link

# Course rows: catId | title | description | level | mode | duration | status | featured
declare -a COURSES=(
"$CAT_PROG|ASP.NET Core Mastery|Build production grade Web APIs using ASP.NET Core 8 with EF Core, JWT and clean architecture.|Intermediate|Online|10 weeks|2|true"
"$CAT_PROG|Java Spring Boot Fundamentals|Master Spring Boot, Spring Data JPA, REST APIs and Spring Security.|Beginner|Hybrid|8 weeks|2|false"
"$CAT_PROG|Modern C++ Programming|C++17 and C++20 features, RAII, smart pointers and templates.|Advanced|Online|10 weeks|2|false"
"$CAT_PROG|Go for Backend Developers|Build scalable backends with Go, goroutines and channels.|Intermediate|Online|6 weeks|2|false"
"$CAT_PROG|Rust Programming Bootcamp|Systems programming with Rust, ownership, lifetimes and async.|Advanced|Online|8 weeks|2|false"
"$CAT_PROG|Python Programming Mastery|From basics to OOP, decorators, generators and async Python.|Beginner|Online|8 weeks|2|true"
"$CAT_PROG|JavaScript Deep Dive|Closures, prototypes, event loop and modern ES2024 features.|Intermediate|Online|6 weeks|2|false"
"$CAT_PROG|TypeScript Pro|Generics, conditional types, decorators and type-level programming.|Intermediate|Online|5 weeks|2|false"
"$CAT_PROG|Kotlin Essentials|Modern JVM language with coroutines and null safety.|Beginner|Online|5 weeks|2|false"
"$CAT_PROG|Ruby on Rails Foundations|Build web apps quickly with Rails 7 and Hotwire.|Beginner|Hybrid|6 weeks|1|false"

"$CAT_WEB|React from Zero to Hero|Build modern SPAs with React 19, Vite, React Router, hooks and forms.|Beginner|Online|6 weeks|2|true"
"$CAT_WEB|Full-Stack MERN Bootcamp|Build complete apps with MongoDB, Express, React and Node.js. Includes deployment.|Advanced|Hybrid|12 weeks|2|true"
"$CAT_WEB|Vue.js Complete Guide|Composition API, Pinia, Vue Router and Vite tooling.|Intermediate|Online|6 weeks|2|false"
"$CAT_WEB|Angular for Enterprise Apps|Build large Angular apps with RxJS and signals.|Advanced|Hybrid|10 weeks|2|false"
"$CAT_WEB|Next.js Production Apps|App Router, server components and edge runtime.|Intermediate|Online|6 weeks|2|true"
"$CAT_WEB|Tailwind CSS Crash Course|Utility-first CSS, theming and component patterns.|Beginner|Online|3 weeks|2|false"
"$CAT_WEB|GraphQL APIs with Apollo|Schemas, resolvers, subscriptions and federation.|Intermediate|Online|5 weeks|2|false"
"$CAT_WEB|Svelte from Scratch|Reactive UI without a virtual DOM using SvelteKit.|Beginner|Online|4 weeks|2|false"
"$CAT_WEB|REST API Design Best Practices|Versioning, pagination, errors, security and contracts.|Intermediate|Online|4 weeks|2|true"

"$CAT_DATA|Python for Data Science|Numpy, Pandas, Matplotlib, Seaborn and scikit-learn.|Intermediate|Online|10 weeks|2|false"
"$CAT_DATA|R Programming for Statistics|Data analysis and visualization with R and ggplot2.|Beginner|Online|6 weeks|2|false"
"$CAT_DATA|Data Analysis with Pandas|Cleaning, transforming and visualizing data with Pandas.|Intermediate|Online|4 weeks|2|true"
"$CAT_DATA|Big Data with Apache Spark|Distributed data processing with PySpark and Spark SQL.|Advanced|Hybrid|8 weeks|2|false"
"$CAT_DATA|Tableau for Business Analytics|Dashboards, calculated fields and storytelling with data.|Beginner|Online|5 weeks|2|false"
"$CAT_DATA|Power BI End to End|DAX, data modeling and publishing reports.|Intermediate|Online|6 weeks|2|true"
"$CAT_DATA|Time Series Forecasting|ARIMA, Prophet and LSTM models for forecasting.|Advanced|Online|6 weeks|2|false"

"$CAT_CLOUD|AWS Cloud Practitioner|Foundational AWS certification prep — EC2, S3, IAM, VPC, billing.|Beginner|Online|4 weeks|1|false"
"$CAT_CLOUD|Azure Fundamentals|Azure services overview, identity, networking and AZ-900 prep.|Beginner|Online|4 weeks|2|true"
"$CAT_CLOUD|Kubernetes for DevOps|Pods, deployments, services, ingress and Helm.|Advanced|Hybrid|8 weeks|2|true"
"$CAT_CLOUD|Docker and Containers Deep Dive|Images, networking, volumes, Compose and best practices.|Intermediate|Online|4 weeks|2|false"
"$CAT_CLOUD|Google Cloud Platform Essentials|Compute Engine, GKE, Cloud Run and IAM.|Beginner|Online|5 weeks|2|false"
"$CAT_CLOUD|CI/CD with GitHub Actions|Build, test and deploy pipelines for modern apps.|Intermediate|Online|4 weeks|2|true"
"$CAT_CLOUD|Terraform for Infrastructure|Write reusable infrastructure as code with HCL.|Intermediate|Online|5 weeks|2|false"
"$CAT_CLOUD|Ansible Automation|Configuration management with playbooks and roles.|Beginner|Online|4 weeks|1|false"

"$CAT_MOB|Flutter Mobile App Development|Build cross-platform apps with Flutter, Dart and Riverpod.|Intermediate|Online|8 weeks|2|true"
"$CAT_MOB|React Native Crash Course|Build mobile apps reusing your React skills.|Intermediate|Online|6 weeks|2|false"
"$CAT_MOB|iOS Development with Swift|SwiftUI, MVVM and Combine for iOS apps.|Beginner|Hybrid|8 weeks|2|false"
"$CAT_MOB|Android with Jetpack Compose|Modern declarative Android UI with Compose and Hilt.|Intermediate|Online|7 weeks|2|true"
"$CAT_MOB|Mobile App Performance Tuning|Memory, battery, frame rate and network optimization.|Advanced|Online|4 weeks|2|false"

"$CAT_AI|Machine Learning Foundations|Supervised, unsupervised learning and model evaluation.|Intermediate|Online|10 weeks|2|true"
"$CAT_AI|Deep Learning with PyTorch|Neural networks, CNNs, RNNs and transfer learning with PyTorch.|Advanced|Hybrid|12 weeks|2|true"
"$CAT_AI|Natural Language Processing|Transformers, tokenization, embeddings and fine-tuning.|Advanced|Online|8 weeks|2|false"
"$CAT_AI|Computer Vision Essentials|Image classification, detection and segmentation with deep learning.|Intermediate|Online|8 weeks|2|false"
"$CAT_AI|Reinforcement Learning Basics|Markov decision processes, Q-learning and policy gradients.|Advanced|Online|6 weeks|2|false"
"$CAT_AI|LLM Engineering for Developers|Prompting, RAG, agents and evals for production LLMs.|Intermediate|Online|5 weeks|2|true"
"$CAT_AI|MLOps in Practice|Model serving, monitoring, retraining and feature stores.|Advanced|Hybrid|7 weeks|2|false"
"$CAT_AI|Generative AI with Diffusion Models|Image generation, fine-tuning and ControlNet.|Advanced|Online|6 weeks|1|false"

"$CAT_SEC|Ethical Hacking Bootcamp|Recon, scanning, exploitation and reporting.|Intermediate|Hybrid|10 weeks|2|true"
"$CAT_SEC|Network Security Fundamentals|Firewalls, IDS, VPN and secure protocols.|Beginner|Online|6 weeks|2|false"
"$CAT_SEC|Web Application Security|OWASP Top 10, SAST, DAST and secure coding.|Advanced|Online|8 weeks|2|false"
"$CAT_SEC|Cloud Security Essentials|IAM, KMS, network policies and threat detection in the cloud.|Intermediate|Online|6 weeks|2|true"
"$CAT_SEC|DevSecOps Pipeline|Security gates, SBOM and supply chain hardening.|Intermediate|Online|5 weeks|2|false"
"$CAT_SEC|Bug Bounty Hunter Path|Recon, OWASP exploitation and ethical reporting.|Advanced|Online|6 weeks|2|false"

"$CAT_DB|SQL Mastery|Joins, indexes, window functions and query tuning.|Beginner|Online|6 weeks|2|true"
"$CAT_DB|MongoDB for Developers|Documents, aggregation pipeline and indexing.|Intermediate|Online|4 weeks|2|false"
"$CAT_DB|PostgreSQL Deep Dive|Advanced indexing, partitioning, JSONB and performance.|Intermediate|Online|5 weeks|2|false"
"$CAT_DB|Redis for Real-Time Apps|Caching strategies, pub/sub, streams and Lua scripting.|Intermediate|Online|3 weeks|2|true"
"$CAT_DB|Elasticsearch and OpenSearch|Indexing, querying, analyzers and observability stacks.|Advanced|Online|5 weeks|2|false"

"$CAT_QA|Manual Testing Foundations|Test cases, bug reports, test plans and practical QA workflows.|Beginner|Online|4 weeks|2|true"
"$CAT_QA|Selenium Automation with Java|Browser automation, waits, Page Object Model and reporting.|Intermediate|Online|6 weeks|2|true"
"$CAT_QA|Cypress End to End Testing|Modern frontend testing with Cypress, fixtures and CI runs.|Intermediate|Online|5 weeks|2|false"
"$CAT_QA|Playwright Test Automation|Cross-browser automation, traces, screenshots and parallel runs.|Intermediate|Online|5 weeks|2|true"
"$CAT_QA|API Testing with Postman|Collections, environments, monitors and contract validation.|Beginner|Online|4 weeks|2|false"
"$CAT_QA|Performance Testing with JMeter|Load testing, thread groups, assertions and bottleneck analysis.|Intermediate|Hybrid|5 weeks|2|false"
"$CAT_QA|Mobile App Testing|Device testing, emulator strategy, crash reports and release checks.|Beginner|Online|4 weeks|2|false"
"$CAT_QA|QA Lead Practical Program|Test strategy, metrics, stakeholder reporting and release quality gates.|Advanced|Hybrid|8 weeks|2|false"
"$CAT_QA|Security Testing Basics|Threat modeling, common vulnerabilities and security test checklists.|Intermediate|Online|5 weeks|2|false"
"$CAT_QA|Automation Framework Design|Reusable test frameworks, reporting and CI/CD integration.|Advanced|Online|6 weeks|1|false"

"$CAT_PRODUCT|UI UX Design Foundations|User research, wireframes, design systems and usability testing.|Beginner|Online|5 weeks|2|true"
"$CAT_PRODUCT|Figma for Product Designers|Auto layout, components, variants, prototyping and handoff.|Beginner|Online|4 weeks|2|true"
"$CAT_PRODUCT|Product Management Basics|Roadmaps, discovery, prioritization and stakeholder communication.|Beginner|Online|5 weeks|2|false"
"$CAT_PRODUCT|Agile Scrum Master Prep|Scrum ceremonies, estimation, velocity and team facilitation.|Intermediate|Hybrid|4 weeks|2|false"
"$CAT_PRODUCT|Business Analysis Practical|Requirements, user stories, process maps and acceptance criteria.|Beginner|Online|5 weeks|2|false"
"$CAT_PRODUCT|Digital Marketing Analytics|Campaign metrics, funnels, attribution and dashboard reporting.|Intermediate|Online|5 weeks|2|false"
"$CAT_PRODUCT|No-Code MVP Building|Build quick prototypes using no-code tools and automation.|Beginner|Online|3 weeks|2|false"
"$CAT_PRODUCT|Technical Writing for Software|API docs, user guides, release notes and structured documentation.|Beginner|Online|4 weeks|2|false"
"$CAT_PRODUCT|Product Analytics with SQL|Activation, retention, cohorts and product metric analysis.|Intermediate|Online|5 weeks|2|true"
"$CAT_PRODUCT|Design Thinking Workshop|Empathy mapping, ideation, prototyping and validation.|Beginner|Hybrid|3 weeks|2|false"
"$CAT_PRODUCT|Growth Product Management|Experiments, onboarding, pricing and lifecycle growth loops.|Advanced|Online|6 weeks|2|false"
"$CAT_PRODUCT|Customer Success for SaaS|Onboarding, renewals, health scores and support playbooks.|Beginner|Online|4 weeks|1|false"
)

declare -a COURSE_IDS=()
declare -a COURSE_MODULE_LISTS=()
declare -a COURSE_TRAINER_TOKENS=()

# ---------- step 6: courses + pricing + modules + trainer assignments --------

hdr "Step 6: Creating ${#COURSES[@]} courses (pricing + modules + trainers)"

CIDX=0
for row in "${COURSES[@]}"; do
  IFS='|' read -r CAT TITLE DESC LEVEL MODE DURATION STATUS FEAT <<< "$row"

  COURSE_ID=$(create_course "$CAT" "$TITLE" "$DESC" "$LEVEL" "$MODE" "$DURATION" "$STATUS" "$FEAT" "$ADMIN_TOKEN")
  COURSE_IDS+=("$COURSE_ID")

  # Pricing: every course gets a 2026 row.
  # Every 3rd course is free, the rest are paid in the 3000-15000 range.
  # Half of paid courses also get a 2025 historical row (slightly cheaper).
  if (( CIDX % 3 == 0 )); then
    create_pricing "$COURSE_ID" 2026 0 "true" "$ADMIN_TOKEN"
  else
    PRICE=$((((CIDX * 1500) % 12000) + 3000))
    create_pricing "$COURSE_ID" 2026 "$PRICE" "false" "$ADMIN_TOKEN"
    if (( CIDX % 2 == 0 )); then
      OLD_PRICE=$((PRICE - 1000))
      [[ $OLD_PRICE -lt 1500 ]] && OLD_PRICE=2000
      create_pricing "$COURSE_ID" 2025 "$OLD_PRICE" "false" "$ADMIN_TOKEN"
    fi
  fi

  # Demo variance: first 4 trainers thode busy rahenge, baaki normal.
  # Isse Trainer Performance report me clear difference dikhega.
  if (( CIDX % 4 != 0 )); then
    T1=$((CIDX % 4))
  else
    T1=$((4 + RANDOM % (NUM_TRAINERS - 4)))
  fi
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
  if (( CIDX % 10 == 0 )); then
    ok "  Created $CIDX/${#COURSES[@]} courses..."
  fi
done
ok "All ${#COURSES[@]} courses ready"

# ---------- step 7: enrollments ---------------------------------------------

hdr "Step 7: Creating enrollments with hero courses, star learners and idle learners"

YEAR_AGO=$(date -u -v -30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)
TODAY=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TWO_MONTHS=$(date -u -v +60d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '60 days' +%Y-%m-%dT%H:%M:%SZ)

declare -a ALL_ENROLLMENT_IDS=()
declare -a ALL_ENROLLMENT_STUDENT_TOKENS=()
declare -a ALL_ENROLLMENT_STUDENT_IDX=()
declare -a ALL_ENROLLMENT_COURSE_IDX=()

NUM_COURSES=${#COURSE_IDS[@]}
IDLE_STUDENT_COUNT=20
STAR_STUDENT_COUNT=20
HERO_COURSE_INDEXES=(0 5 10 14 25)

for ((s=0; s<NUM_STUDENTS; s++)); do
  STOK="${STUDENT_TOKENS[$s]}"
  if (( s < IDLE_STUDENT_COUNT )); then
    # Idle students: sirf enroll honge, progress nahi karenge.
    # Student Engagement report me ye clearly dikhte hai.
    NUM_ENROLLS=1
  elif (( s < IDLE_STUDENT_COUNT + STAR_STUDENT_COUNT )); then
    # Star learners: zyada courses + high completion.
    NUM_ENROLLS=$(( (RANDOM % 3) + 6 ))
  else
    # Normal learners: 3-5 courses each, enough data for reports.
    NUM_ENROLLS=$(( (RANDOM % 3) + 3 ))
  fi

  # pick distinct course indexes
  declare -a PICKED=()
  while (( ${#PICKED[@]} < NUM_ENROLLS )); do
    if (( RANDOM % 100 < 55 )); then
      # 5 hero courses ko extra traffic dete hai taaki Top Courses report flat na lage.
      IDX="${HERO_COURSE_INDEXES[$((RANDOM % ${#HERO_COURSE_INDEXES[@]}))]}"
      (( IDX >= NUM_COURSES )) && IDX=$((RANDOM % NUM_COURSES))
    else
      IDX=$((RANDOM % NUM_COURSES))
    fi
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
      ALL_ENROLLMENT_STUDENT_IDX+=("$s")
      ALL_ENROLLMENT_COURSE_IDX+=("$IDX")
    fi
  done
  unset PICKED

  if (( (s+1) % 20 == 0 )); then
    ok "  Enrolled $((s+1))/$NUM_STUDENTS students..."
  fi
done
ok "Total enrollments created: ${#ALL_ENROLLMENT_IDS[@]}"

# ---------- step 8: progress + status -------------------------------------

hdr "Step 8: Random module progress + status lifecycle"

NUM_ENROLLMENTS=${#ALL_ENROLLMENT_IDS[@]}
COMPLETED_ENROLLMENT_IDS=()

for ((e=0; e<NUM_ENROLLMENTS; e++)); do
  EID="${ALL_ENROLLMENT_IDS[$e]}"
  STOK="${ALL_ENROLLMENT_STUDENT_TOKENS[$e]}"
  SIDX="${ALL_ENROLLMENT_STUDENT_IDX[$e]}"
  CIDX="${ALL_ENROLLMENT_COURSE_IDX[$e]}"
  MODULES_STR="${COURSE_MODULE_LISTS[$CIDX]}"
  # split modules into array
  read -r -a MODULES <<< "$MODULES_STR"
  MOD_COUNT=${#MODULES[@]}

  IS_HERO=0
  for h in "${HERO_COURSE_INDEXES[@]}"; do
    [[ "$h" == "$CIDX" ]] && IS_HERO=1 && break
  done

  if (( SIDX < IDLE_STUDENT_COUNT )); then
    # Idle cohort: no progress. Backdate script later inko 60+ days old banayega.
    continue
  fi

  ROLL=$((RANDOM % 10))
  if (( SIDX < IDLE_STUDENT_COUNT + STAR_STUDENT_COUNT && ROLL < 7 )); then
    # Star learners: mostly complete all modules.
    for ((m=0; m<MOD_COUNT; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 3 "$ADMIN_TOKEN" || true
    COMPLETED_ENROLLMENT_IDS+=("$EID")
  elif (( IS_HERO == 1 && ROLL < 4 )); then
    # Hero courses: better completion rate, visually stronger reports.
    for ((m=0; m<MOD_COUNT; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 3 "$ADMIN_TOKEN" || true
    COMPLETED_ENROLLMENT_IDS+=("$EID")
  elif (( ROLL < 7 )); then
    # Partial progress: in-progress learners populate average progress columns.
    DONE=$(( (RANDOM % (MOD_COUNT - 1)) + 1 ))
    for ((m=0; m<DONE; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 2 "$ADMIN_TOKEN" || true
  elif (( ROLL < 9 )); then
    # Normal completions: enough certificates/completed rows without overdoing it.
    for ((m=0; m<MOD_COUNT; m++)); do
      mark_module_complete "$EID" "${MODULES[$m]}" "$STOK" || true
    done
    update_enrollment_status "$EID" 3 "$ADMIN_TOKEN" || true
    COMPLETED_ENROLLMENT_IDS+=("$EID")
  fi
  # else remains in initial Pending state with no progress

  if (( (e+1) % 50 == 0 )); then
    ok "  Updated progress for $((e+1))/$NUM_ENROLLMENTS enrollments..."
  fi
done
ok "Progress + lifecycle done. Completed: ${#COMPLETED_ENROLLMENT_IDS[@]}"

# ---------- step 9: certificates -------------------------------------------

hdr "Step 9: Issuing certificates for first $TARGET_CERTIFICATES completed enrollments"
COUNT=0
for EID in "${COMPLETED_ENROLLMENT_IDS[@]}"; do
  [[ $COUNT -ge $TARGET_CERTIFICATES ]] && break
  if issue_certificate "$EID" "$ADMIN_TOKEN"; then
    COUNT=$((COUNT + 1))
  else
    warn "Certificate issue failed for enrollment $EID; continuing"
  fi
done
ok "Certificates issued: $COUNT"

# ---------- summary --------------------------------------------------------

hdr "Seed complete"

echo
color "1;32" "Login credentials:"; echo
echo "  Admin    : $ADMIN_EMAIL  /  $ADMIN_PASS"
echo
echo "  Business : $BUSINESS_EMAIL  /  $BUSINESS_PASS"
echo "             (reports-only dashboard)"
echo
echo "  Trainers : (password = $TRAINER_PASS)"
for e in "${TRAINER_EMAILS[@]}"; do echo "             $e"; done
echo
echo "  Students : (password = $STUDENT_PASS)"
echo "             student001@training.local ... student$(printf "%03d" "$NUM_STUDENTS")@training.local"
echo
echo "  Categories : 10"
echo "  Courses    : ${#COURSE_IDS[@]} (mix of Free, Paid, Published and a few Draft)"
echo "  Enrollments: ${#ALL_ENROLLMENT_IDS[@]}"
echo "  Certificates issued: $COUNT"
echo
echo "Next step:"
echo "  Run scripts/backdate-azure.sh to spread report dates across the last 10 months."
echo
