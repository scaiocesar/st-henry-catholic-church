# Contributing to St. Henry Catholic Church website

Thank you for your interest in contributing. This document outlines how to contribute to this project.

## Ways to contribute

- Reporting bugs
- Suggesting new features or enhancements
- Improving documentation
- Submitting pull requests (bug fixes, new features, tests)
- Translations and localization

## Getting started

1. Fork the repository
2. Clone your fork locally
3. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

## Development setup

```bash
# Install dependencies
npm install

# Configure environment (see README)
cp .env.example .env

# Database (see README for Docker or external PostgreSQL)
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

## Code standards

- **Stack:** Next.js (App Router), React, TypeScript, Prisma, Tailwind CSS
- Follow existing code style and ESLint rules (`npm run lint`)
- Write meaningful commit messages
- Add comments when necessary for complex logic

## Submitting changes

1. Push your changes to your fork
2. Open a pull request against the `main` branch
3. Fill out the PR template
4. Respond to review feedback in a timely manner

## Pull request process

- Pull requests require review before merging
- Ensure the app builds (`npm run build`) and lints cleanly
- Update documentation if your changes affect setup, APIs, or behavior
- Keep pull requests focused and reasonably sized

## Commit messages

Use clear, descriptive messages, for example:

- `fix: resolve login redirect issue`
- `feat: add bulletin upload validation`
- `docs: update database setup instructions`

## Reporting bugs

Check existing issues first. Include:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment (browser, OS, Node version if relevant)
