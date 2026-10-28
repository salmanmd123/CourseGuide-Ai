# CourseGuide AI — AI-Powered Learning Platform

**Discover courses. Learn smarter. Practice with AI.**

CourseGuide AI is an AI-powered learning platform designed to help students learn Computer Science and Engineering (CSE) concepts through curated free YouTube courses, AI-generated study notes, interactive quizzes, personalized learning progress, and AI-powered interview preparation.

The platform brings learning resources and practice tools together in one place, helping students discover relevant courses, understand difficult concepts, evaluate their knowledge, and prepare for technical interviews.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Application Pages](#application-pages)
- [API Routes](#api-routes)
- [How It Works](#how-it-works)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Students often need to visit multiple platforms to find quality courses, prepare notes, practice questions, track their learning progress, and prepare for interviews.

CourseGuide AI aims to simplify this process by providing a unified learning environment powered by AI and integrated with free educational resources.

### Project Objectives

- Help students discover relevant free online courses.
- Make learning easier through AI-generated notes and quizzes.
- Provide an AI tutor to assist with doubts and concepts.
- Track course progress and completed lessons.
- Help students prepare for technical interviews through AI-assisted practice.
- Provide a centralized dashboard for managing learning activities.

**Target Audience:** CSE students, beginners in programming, self-learners, and students preparing for technical interviews.

---

## Key Features

### 1. AI-Powered Course Discovery

- Discover educational courses using course-related search queries.
- Integrate YouTube educational videos into the learning experience.
- Organize courses by categories and learning levels.
- Display course information, thumbnails, video duration, and available engagement statistics.
- Support language preferences, including English and Hindi, according to the configured course discovery logic.
- Provide course details and lesson navigation.

### 2. AI-Generated Study Notes

- Generate concise study notes to support lesson revision.
- Present learning material in a structured, readable format.
- Help students review important concepts without repeatedly revisiting the entire lesson.
- Provide a dedicated notes interface within the learning experience.

*Note: Note generation depends on the configured AI provider and the lesson information available to the application.*

### 3. AI Tutor

- Provide an AI-powered interface for asking learning-related questions.
- Help students understand programming concepts and difficult topics.
- Support interactive question-and-answer learning.
- Connect tutoring functionality to the application's AI backend.

### 4. Interactive Quiz System

- Generate quizzes to help students test their understanding.
- Present quiz questions through a dedicated interface.
- Submit quiz answers and process results.
- Maintain quiz history where supported by the configured database.
- Help learners identify concepts that need further practice.

### 5. Learning Progress Tracking

- Track lesson progress through the progress API.
- Save learning progress for later continuation.
- Support course and lesson progress information.
- Provide progress-related information to the dashboard and learning pages.
- Help students monitor their learning activities.

### 6. AI Interview Preparation

- Provide an interview preparation interface for practicing technical questions.
- Generate interview questions using the configured AI service.
- Include aptitude and technical interview preparation capabilities where implemented.
- Handle AI generation requests through a dedicated API route.
- Use timeout and retry handling to improve reliability during AI question generation.

### 7. Student Dashboard

- Access learning-related information from a centralized dashboard.
- Navigate to courses, quizzes, interviews, and personal learning pages.
- Continue learning through the platform's course navigation.
- Review learning activities and progress information supported by the application.

### 8. Authentication

- Provide registration and login interfaces.
- Support authentication-related API endpoints.
- Include session or authentication handling through the application's authentication utilities.
- Protect applicable pages and API routes according to the implemented authorization logic.

### 9. Admin Dashboard

- Provide an administrative interface.
- Manage course information through admin course routes.
- Access user-related administration functionality.
- Support administrative course and user management according to the implemented permissions.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web application framework |
| React | Interactive user interfaces |
| TypeScript | Type-safe application development |
| Tailwind CSS | UI styling |
| PostgreSQL | Relational database |
| Drizzle ORM | Database queries and schema management |
| Drizzle Kit | Database migration tooling |
| YouTube Data API | Course and video discovery, where configured |
| NVIDIA AI service | AI question generation, where configured |
| Node.js | JavaScript runtime |
| npm | Dependency management |
| Python | Language detection service, where applicable |

The exact AI models, external API integrations, and database hosting provider depend on the project's environment configuration.

---

## Project Architecture

CourseGuide AI uses a full-stack architecture in which the Next.js application provides the user interface and server-side API endpoints.

```text
                   STUDENT / ADMIN
                          |
                          v
                 Next.js Application
                          |
             +------------+------------+
             |            |            |
             v            v            v
          Courses       Quizzes     Interviews
             |            |            |
             v            v            v
       YouTube API     AI Services   AI Services
             |
             v
       Course Discovery

                 Next.js API Routes
                          |
             +------------+------------+
             |                         |
             v                         v
       Drizzle ORM                 AI Providers
             |
             v
         PostgreSQL
             |
             v
     Users, Courses, Progress,
     Quizzes and Interview Data
```

This diagram represents the intended high-level architecture. Individual features may use different data flows depending on their implementation.

---

## Project Structure

The following structure highlights the main source files and directories.

```text
courseguide_ai/
├── drizzle/
│   ├── meta/
│   ├── relations.ts
│   ├── schema.ts
│   └── *.sql
│
├── language-detector/
│
├── public/
│   ├── logo.png
│   ├── logo1.png
│   └── logo2.png
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── courses/
│   │   │   ├── users/
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── ai-notes/
│   │   │   ├── ai-tutor/
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── interviews/
│   │   │   ├── progress/
│   │   │   └── quizzes/
│   │   │
│   │   ├── courses/
│   │   ├── dashboard/
│   │   ├── interviews/
│   │   ├── learn/
│   │   ├── login/
│   │   ├── my-learning/
│   │   ├── profile/
│   │   ├── quizzes/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── admin-navbar.tsx
│   │   ├── ai-notes.tsx
│   │   ├── ai-tutor.tsx
│   │   ├── learning-client.tsx
│   │   ├── lesson-content-tabs.tsx
│   │   ├── lesson-description.tsx
│   │   ├── lesson-video.tsx
│   │   ├── LogoLoader.tsx
│   │   ├── mark-complete-button.tsx
│   │   ├── my-notes.tsx
│   │   ├── navbar.tsx
│   │   ├── progress-auto-refresh.tsx
│   │   ├── theme-provider.tsx
│   │   └── youtube-player.tsx
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── seed.ts
│   │
│   ├── lib/
│   │   ├── admin-youtube.ts
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── my-notes-db.ts
│   │   ├── quiz-storage.ts
│   │   ├── quiz-token.ts
│   │   └── youtube.ts
│   │
│   └── proxy.ts
│
├── .env.example
├── .gitignore
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

Generated directories such as `node_modules/` and `.next/`, and local secret files such as `.env` and `.env.local`, are intentionally excluded from version control.

---

## Getting Started

Follow these steps to run CourseGuide AI locally.

### Prerequisites

Install the following software and obtain the required service credentials:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's Next.js dependencies.
- npm — included with Node.js.
- [PostgreSQL](https://www.postgresql.org/) or a compatible hosted PostgreSQL database.
- A YouTube Data API key if YouTube API functionality is enabled.
- Credentials for the configured AI provider if AI-powered features are enabled.
- Python and the appropriate dependencies if the language detection service requires them.

### 1. Clone the Repository

```bash
git clone https://github.com/salmanmd123/CourseGuide-Ai.git
```

Navigate into the project:

```bash
cd CourseGuide-Ai
```

### 2. Install Dependencies

```bash
npm install
```

This installs the dependencies defined in `package.json` and `package-lock.json`.

### 3. Configure Environment Variables

Create your local environment file using the example:

**Windows Command Prompt**

```cmd
copy .env.example .env.local
```

**PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and configure the variables required by your actual application.

Refer to the [Environment Configuration](#environment-configuration) section below.

### 4. Configure the Database

Make sure your PostgreSQL database is running and that your database connection string points to the correct database.

Run the project's Drizzle migration command after verifying the scripts in `package.json`:

```bash
npm run db:migrate
```

If this script is not defined, use the equivalent Drizzle Kit command configured for the project, or add the appropriate script before running it.

### 5. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

**http://localhost:3000**

---

## Environment Configuration

CourseGuide AI uses environment variables to configure database access and external services.

Your `.env.example` should document the variables actually referenced by the application. Depending on your implementation, these may include:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `YOUTUBE_API_KEY` | YouTube Data API access, if configured |
| AI provider API key | Authentication for the configured AI service |
| AI model or endpoint settings | Model and service configuration, if required |
| Authentication secrets | Session signing or token validation, if required |

The variable names for AI services and authentication must match the names used in your source code. Check your existing `.env`, `.env.local`, and API route implementations to determine the exact names before configuring the application.

**Important security rules:**

- Never commit `.env` or `.env.local`.
- Never put private API keys in client-side code.
- Do not expose server-side credentials through `NEXT_PUBLIC_` variables.
- Keep `.env.example` limited to placeholder values.
- If a secret is accidentally pushed to GitHub, revoke or rotate it.

---

## Database Setup

CourseGuide AI uses Drizzle ORM with PostgreSQL.

### Database Files

- `src/db/schema.ts` — application database schema.
- `src/db/index.ts` — database connection and access.
- `src/db/seed.ts` — seed script, if configured.
- `drizzle.config.ts` — Drizzle Kit configuration.
- `drizzle/*.sql` — SQL migration history.
- `drizzle/meta/` — migration metadata and snapshots.

### Database Commands

The commands available depend on the scripts defined in `package.json`. Common Drizzle commands include:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npx drizzle-kit push
```

- **Generate:** Creates migration files from schema changes.
- **Migrate:** Applies pending migrations to the configured database.
- **Push:** Synchronizes schema changes directly with the database, depending on the Drizzle configuration.

Prefer the migration workflow for tracked schema changes. Avoid generating unnecessary migrations or using schema push against production without reviewing the impact.

Before applying migrations, confirm that `DATABASE_URL` points to the intended database.

---

## Running the Application

### Development

```bash
npm run dev
```

Starts the local development server.

### Production Build

```bash
npm run build
```

Builds the application for production.

### Production Server

```bash
npm run start
```

Starts the production server after a successful build.

### Code Linting

```bash
npm run lint
```

Runs the configured linting script, if available.

Check `package.json` for the actual scripts and use the names defined by your project.

---

## Application Pages

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Landing page and platform introduction |
| Login | `/login` | User authentication |
| Register | `/register` | Account registration |
| Dashboard | `/dashboard` | Learning overview |
| Courses | `/courses` | Course discovery |
| Course Details | `/courses/[slug]` | Course information |
| Learning Page | `/learn/[slug]` | Video lessons and learning tools |
| My Learning | `/my-learning` | Personal learning activities |
| Quizzes | `/quizzes` | Quiz access |
| Quiz Details | `/quizzes/[id]` | Individual quiz interface |
| Quiz History | `/quizzes/history` | Quiz history |
| Interview Preparation | `/interviews` | AI interview practice |
| Profile | `/profile` | User profile |
| Admin Dashboard | `/admin` | Administrative overview |
| Admin Courses | `/admin/courses` | Course administration |
| Admin Users | `/admin/users` | User administration |

Actual access permissions depend on the authentication and authorization checks implemented in the application.

---

## API Routes

The following routes are present in the project structure.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register a user |
| `/api/auth/login` | POST | Authenticate a user |
| `/api/auth/logout` | POST | End an authenticated session |
| `/api/auth/me` | GET | Retrieve the current user's authentication information |
| `/api/courses` | GET | Retrieve course information |
| `/api/courses/search` | GET | Search for courses |
| `/api/ai-notes` | GET / POST | AI notes operations, according to the implementation |
| `/api/ai-tutor` | POST | Submit a tutoring question |
| `/api/progress` | GET / POST | Retrieve or update learning progress |
| `/api/quizzes` | GET | Retrieve quizzes |
| `/api/quizzes/generate` | POST | Generate a quiz |
| `/api/quizzes/[id]` | GET | Retrieve a specific quiz |
| `/api/quizzes/[id]/submit` | POST | Submit quiz answers |
| `/api/quizzes/history` | GET | Retrieve quiz history |
| `/api/interviews` | GET / POST | Interview-related operations, according to the implementation |
| `/api/admin/courses` | GET / POST | Administrative course operations |
| `/api/admin/users` | GET | Administrative user operations |

The table summarizes the routes based on the project structure. Verify the supported HTTP methods, request bodies, authentication requirements, and response formats in each route handler before using this table as formal API documentation.

---

## How It Works

### Course Discovery

1. A learner searches for a topic or course.
2. The application processes the search through its course discovery logic.
3. Course information is retrieved from the configured data sources.
4. Matching courses are presented for the learner to explore.
5. The learner opens a course and proceeds to its learning page.

### AI-Assisted Learning

1. The learner opens a lesson.
2. The learning interface presents the lesson video and associated tools.
3. The learner requests study notes, asks the AI Tutor a question, or generates a quiz.
4. The corresponding API route processes the request.
5. The application displays the result and stores relevant information where persistence is implemented.

### Learning Progress

1. The learner watches a lesson.
2. The player and learning components track progress according to the implemented logic.
3. Progress information is sent to the progress API.
4. The server processes the update and stores supported progress data.
5. Learning pages and the dashboard can retrieve the saved information.

### AI Interview Preparation

1. The learner opens the interview preparation page.
2. The application sends a request to the interview API.
3. The server prepares the appropriate prompt and calls the configured AI provider.
4. The generated interview questions are returned to the client.
5. The learner uses the questions for interview practice.

---

## Security Considerations

Security is important because CourseGuide AI handles user accounts, learning data, database connections, and external API credentials.

Recommended practices include:

- Keep secrets in environment variables.
- Validate incoming API request bodies.
- Apply authentication and authorization checks to protected endpoints.
- Restrict administrative operations to authorized administrators.
- Use parameterized database queries through the ORM.
- Apply appropriate rate limits to expensive AI endpoints.
- Handle AI provider timeouts and failures gracefully.
- Avoid logging API keys, passwords, authentication tokens, or sensitive user data.
- Review dependency vulnerabilities regularly.
- Protect user-specific notes, quiz attempts, and learning progress from unauthorized access.

These are recommended safeguards; verify that each one is implemented and tested in the application.

---

## Troubleshooting

### Database Connection Errors

- Confirm that PostgreSQL is running.
- Verify `DATABASE_URL` in `.env.local`.
- Confirm that the database exists and the credentials are valid.
- Check that pending migrations have been applied.

### AI Requests Failing or Timing Out

- Verify the configured AI provider credentials.
- Check the provider's API limits and service status.
- Review the terminal logs for request errors.
- Confirm that timeout and retry settings are appropriate.

### YouTube Course Search Not Working

- Verify the YouTube API key if the feature uses the YouTube Data API.
- Check API quota limits and request parameters.
- Confirm that the search API route returns the expected response.
- Check the browser console and server logs for errors.

### Courses or Lessons Not Found

- Verify that the course exists in the configured data source.
- Check the course slug and route parameters.
- Confirm that database queries return the expected records.
- Review the relationship between courses and lessons.

### Learning Progress Not Updating

- Check the browser network tab for requests to `/api/progress`.
- Verify that the API response indicates success.
- Confirm that the database update is actually persisted.
- Check whether the learning page retrieves the latest saved progress.

### Development Server Problems

Try reinstalling dependencies only if the installation is damaged:

```bash
npm install
```

Then restart the development server:

```bash
npm run dev
```

Review the terminal output for the underlying error before changing configuration or deleting project files.

---

## Future Enhancements

Potential enhancements for CourseGuide AI include:

- More advanced personalized course recommendations.
- Improved multilingual learning support.
- Better AI-generated summaries and revision material.
- Adaptive quizzes based on learner performance.
- Detailed learning analytics and skill tracking.
- Interview feedback and performance analysis.
- Expanded course categorization and filtering.
- Improved accessibility and mobile learning experience.
- Automated testing and deployment workflows.

These items represent potential future work and are not necessarily implemented in the current version.

---

## Contributing

Contributions, suggestions, and bug reports are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test your changes locally.
5. Commit your work with a clear message.
6. Open a pull request describing the changes.

Please avoid committing secrets, generated build files, or installed dependencies.

---

## License

No license is specified here. Before distributing or permitting reuse of this project, add a `LICENSE` file that reflects your intended terms.

---

## Author

**MD. Salman**

Project: CourseGuide AI

GitHub Repository: [salmanmd123/CourseGuide-Ai](https://github.com/salmanmd123/CourseGuide-Ai)

---

*CourseGuide AI — Learn better. Practice smarter. Grow faster.*
