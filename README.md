# ComptaFreelance

Multilingual static website for German accounting and cross-border tax services.

## Repository structure

HTML pages are at the repository root; page-specific styles and scripts are under assets/.

## Local development

The site has no build step. Open index.html directly or serve the repository with a local static server:

    python -m http.server 8000

## Repository hygiene

- Do not commit credentials, local environment files, virtual environments, generated caches, or build output.
- Keep project documentation factual and update it alongside behavioral or deployment changes.
- Preserve database and project-data files unless their removal has been reviewed separately.
