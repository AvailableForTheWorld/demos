# Demos Monorepo

A pnpm workspace monorepo containing various demo projects and examples.

## Structure

```
demos/
├── packages/     # Standalone packages and libraries
├── apps/         # Full application demos
├── examples/     # Simple code examples and snippets
└── package.json  # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

## Available Scripts

```bash
# Run dev servers for all demos
pnpm dev

# Build all demos
pnpm build

# Run tests across all demos
pnpm test

# Lint all demos
pnpm lint

# Format code
pnpm format

# Clean all build artifacts and dependencies
pnpm clean
```

## Working with Individual Demos

```bash
# Run a specific demo
pnpm --filter <demo-name> dev

# Build a specific demo
pnpm --filter <demo-name> build

# Add a dependency to a specific demo
pnpm --filter <demo-name> add <package-name>
```

## Adding New Demos

### 1. Choose the appropriate directory:
- **`packages/`** - For reusable packages, libraries, or utilities
- **`apps/`** - For complete applications (web apps, CLIs, etc.)
- **`examples/`** - For simple code examples and learning materials

### 2. Create a new demo:

```bash
# Navigate to the appropriate directory
cd packages  # or apps, or examples

# Create your demo directory
mkdir my-demo
cd my-demo

# Initialize package.json
pnpm init
```

### 3. Ensure your demo has a `package.json` with a unique name:

```json
{
  "name": "@demos/my-demo",
  "version": "1.0.0",
  "private": true
}
```

## Migration Guide

### For Pure Projects (No Git)
Simply copy the project into the appropriate workspace folder and ensure it has a `package.json`.

### For GitHub Repository Demos

**Option A: Git Subtree (Preserves History)**
```bash
git subtree add --prefix=packages/demo-name https://github.com/username/repo.git main --squash
```

**Option B: Fresh Copy (Simpler)**
```bash
# Clone the repo elsewhere
git clone https://github.com/username/repo.git temp-demo
cd temp-demo
rm -rf .git
cp -r . ../demos/packages/demo-name/
```

## Catalog of Demos

<!-- Add your demos here as you migrate them -->

### Packages
- (To be added)

### Apps
- (To be added)

### Examples
- (To be added)

## License

Individual demos may have their own licenses. Check each demo's directory for details.
