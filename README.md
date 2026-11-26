# Omnira

> A modular, scalable Node.js application framework for building production-ready REST APIs and backend services.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

**Omnira** is a clean, opinionated Node.js backend framework designed for speed and maintainability. It provides a structured project layout, pre-configured tooling (ESLint, Prettier, Jest), and an Express-based HTTP server out of the box — so you can focus on writing business logic rather than setup.

The name *Omnira* derives from the concept of an all-encompassing, omnidirectional flow — representing a backend that seamlessly handles requests from every direction.

---

## Features

- **Express.js** HTTP server with JSON middleware
- **Modular architecture** — easy to extend with routes, controllers, and services
- **Environment variable management** via `dotenv`
- **Developer experience** — hot-reload with `nodemon`, linting with ESLint, formatting with Prettier
- **Testing** — Jest with coverage reporting
- **Production-ready defaults** — proper `.gitignore`, `.env.example`, and engine constraints

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Framework | Express.js 4.x |
| Testing | Jest 29.x |
| Linting | ESLint 9.x |
| Formatting | Prettier 3.x |
| Dev Server | Nodemon 3.x |
| Config | dotenv 16.x |

---

## Project Structure

```
omnira/
├── src/
│   └── index.js          # Application entry point
├── tests/                # Unit and integration tests
├── .env.example          # Template for environment variables
├── .gitignore            # Files excluded from version control
├── package.json          # Project manifest and scripts
└── README.md             # Project documentation
```

As the project grows, the recommended structure is:

```
omnira/
├── src/
│   ├── config/           # Configuration loaders (db, app settings)
│   ├── controllers/      # Route handler logic
│   ├── middleware/        # Custom Express middleware
│   ├── models/           # Database schemas / models
│   ├── routes/           # Express router definitions
│   ├── services/         # Business logic layer
│   ├── utils/            # Shared utility functions
│   └── index.js          # App bootstrap
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) >= 9.0.0 (bundled with Node.js)
- [Git](https://git-scm.com/)

Verify your versions:

```bash
node --version
npm --version
git --version
```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/girishlade111/omnira.git
   cd omnira
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:

   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=mongodb://localhost:27017/omnira
   JWT_SECRET=your_super_secret_key_here
   ```

   > **Never commit your `.env` file.** It is listed in `.gitignore` to prevent accidental exposure of secrets.

### Running the App

**Development mode** (with hot-reload via nodemon):

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server starts at `http://localhost:3000` by default.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message and version info |
| GET | `/health` | Server health check with uptime |

**Example responses:**

```bash
# GET /
curl http://localhost:3000/
# {"message":"Welcome to Omnira","version":"1.0.0","status":"running"}

# GET /health
curl http://localhost:3000/health
# {"status":"ok","uptime":42.153}
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start with hot-reload (nodemon) |
| `npm test` | Run all tests with Jest |
| `npm run lint` | Lint source files with ESLint |
| `npm run format` | Auto-format source files with Prettier |

---

## Testing

Omnira uses [Jest](https://jestjs.io/) for testing.

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory (excluded from git).

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the HTTP server listens on |
| `NODE_ENV` | `development` | Application environment (`development`, `test`, `production`) |
| `DATABASE_URL` | — | MongoDB (or other DB) connection string |
| `JWT_SECRET` | — | Secret key for JWT signing |

Always use `.env.example` as the reference template and never commit actual secrets.

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Contact

**girishlade111** — [@girishlade111](https://github.com/girishlade111)

Project link: [https://github.com/girishlade111/omnira](https://github.com/girishlade111/omnira)
