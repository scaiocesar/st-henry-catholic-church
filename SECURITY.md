# Security Policy

## Supported versions

The following versions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Report it privately so there is time to fix it before disclosure.

### How to report

1. **Do not** create a public GitHub issue
2. Email the project maintainer with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)
3. Allow reasonable time for a response before following up

## What to expect

- **Acknowledgment:** Within 48 hours when possible
- **Timeline:** We aim to provide a fix or mitigation within 7 days when feasible
- **Disclosure:** Details may be published after a fix is available

## Security best practices for contributors

- Never commit secrets, API keys, or production credentials
- Use environment variables for sensitive configuration
- Validate and sanitize user input (including rich text and uploads)
- Follow secure coding practices for Next.js, React, and your database layer

## Scope

**In scope:** This repository, official releases, and project documentation.

**Out of scope:** Third-party services you connect (hosting, database, storage) unless the issue is in our integration code; user-generated content hosted outside this repo.
