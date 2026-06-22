<!-- Copyright (c) 2026 Anshul Negi | https://github.com/NegiCoder -->

# ExcelGens — Training Institute Management Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://training-institute-frontend-alpha.vercel.app)
[![Documentation](https://img.shields.io/badge/Docs-Notion-black?style=for-the-badge&logo=notion)](https://app.notion.com/p/ExcelGens-Training-Institute-a7d330d04f66491e9b0af3de9748cdaf)
[![GitHub stars](https://img.shields.io/github/stars/NegiCoder/training-institute-fullstack?style=social)](https://github.com/NegiCoder/training-institute-fullstack/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/NegiCoder/training-institute-fullstack)](https://github.com/NegiCoder/training-institute-fullstack/commits/main)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET%20API-10-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![Azure](https://img.shields.io/badge/Backend-Azure%20Container%20Apps-0078D4?style=flat-square&logo=microsoftazure)](https://azure.microsoft.com/)

**Full-stack LMS for training institutes** — course catalog, enrollments, role-based dashboards (Admin, Trainer, Student, Business), progress tracking, PDF certificates with QR verification, email notifications, and analytics reports.

> **Keywords:** training institute LMS · course management system · .NET React full stack · certificate verification · Azure SQL · JWT auth

---

## What it does

| Role | Capabilities |
|------|--------------|
| **Admin** | Manage courses, categories, pricing, users, certificates, reports |
| **Trainer** | View assigned courses, modules, enrolled students |
| **Student** | Browse catalog, enroll, track module progress, earn certificates |
| **Business** | Read-only reports dashboard (enrollment trends, course performance) |

**Public features:** course catalog, certificate verification page (`/verify`), demo accounts on the home page for instant exploration.

---

## Try it live

| | Link |
|---|------|
| **App** | https://training-institute-frontend-alpha.vercel.app |
| **Full docs (Notion)** | https://app.notion.com/p/ExcelGens-Training-Institute-a7d330d04f66491e9b0af3de9748cdaf |

### Demo accounts (copy from home page)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@training.local` | `Admin@12345` |
| Trainer | `trainer.aman.sharma@training.local` | `Trainer@123` |
| Student | `student001@training.local` | `Student@123` |
| Business | `business@training.local` | `Business@123` |

---

## Install & run locally

### Backend (.NET API)

**Requirements:** .NET 10 SDK, SQL Server (or Azure SQL connection string)

```bash
git clone https://github.com/NegiCoder/training-institute-fullstack.git
cd training-institute-fullstack/backend/TrainingInstitute.Api
dotnet restore
dotnet ef database update
dotnet run
```

API (Swagger): http://localhost:5000/swagger

### Frontend (React + Vite)

**Requirements:** Node.js 20+

```bash
cd training-institute-fullstack/frontend
npm ci
cp .env.example .env    # set VITE_API_URL
npm run dev
```

App: http://localhost:5173

### Seed Azure SQL (optional)

See **[scripts/SEED_BOOTSTRAP.md](scripts/SEED_BOOTSTRAP.md)** for bulk seeding a fresh Azure SQL database.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | ASP.NET Core 10, EF Core, JWT, Swagger |
| Database | Azure SQL Server |
| Storage | Azure Blob (certificates) |
| PDF | QuestPDF + QRCoder |
| Email | MailKit |
| Deploy | Vercel (frontend) + Azure Container Apps (backend) |

---

## Project structure

```
training-institute-fullstack/
├── backend/TrainingInstitute.Api/   # REST API, services, EF migrations
├── frontend/                        # React SPA
├── scripts/                         # Azure SQL seed scripts
└── .github/workflows/               # CI/CD to Azure
```

---

## Contributing

1. Fork the repository and create a feature branch.
2. Backend changes: run `dotnet build` and ensure migrations are included if schema changes.
3. Frontend changes: run `npm run build` before opening a PR.
4. One feature per PR — keep API and UI changes together when they're coupled.
5. Do not commit secrets, connection strings, or `.env` files.

Bug reports and UI/UX improvements are welcome.

---

## Author

**[Anshul Negi](https://github.com/NegiCoder)** — full-stack portfolio project.

## License

Educational / portfolio use.

---

## Support

If **ExcelGens** helped you learn full-stack architecture, RBAC, or LMS domain modeling, please give the repo a **⭐** on GitHub.

[![Star on GitHub](https://img.shields.io/github/stars/NegiCoder/training-institute-fullstack?style=social&label=Star%20ExcelGens)](https://github.com/NegiCoder/training-institute-fullstack/stargazers)
