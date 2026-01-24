# Contributing to Cyber Kit

Thank you for your interest in contributing to Cyber Kit! We welcome contributions from the community. This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **Rust** (install from https://rustup.rs/)
- **Git** (check with `git --version`)
- **npm** or **yarn** for package management

### Development Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/cyber-kit.git
   cd cyber-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for desktop (optional)**
   ```bash
   npm run build:tauri
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-topic` - Documentation updates
- `test/test-description` - Tests and test improvements
- `chore/task-description` - Maintenance and tooling

Examples:
```bash
git checkout -b feature/add-new-tool
git checkout -b fix/command-assist-formatting
git checkout -b docs/update-readme
```

### Commit Messages

Write clear, concise commit messages:

```
type(scope): description

Details about the change (optional, but encouraged for non-trivial changes)

Fixes #123 (if applicable)
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (no logic change)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance
- `perf:` - Performance improvement

Examples:
```
feat(tools): add new security scanner tool

Implements a new tool for scanning applications for security vulnerabilities.
Includes unit tests and documentation.

Fixes #456
```

```
fix(ui): correct option button styling on non-Command Assist tools

Updates CSS to ensure white text color on option buttons for better contrast.
```

### Code Style

#### JavaScript/TypeScript
- Use 2-space indentation
- Use `const` by default, `let` when needed
- Use meaningful variable names
- Add JSDoc comments for functions

```javascript
/**
 * Creates a formatted code block for display
 * @param {string} title - The block title
 * @param {string} content - The code content
 * @param {boolean} formatAsCommand - Whether to format as command
 * @returns {HTMLElement} The formatted code block element
 */
function createCodeBlock(title, content, formatAsCommand = false) {
  // Implementation
}
```

#### Rust
- Follow Rust naming conventions
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Add doc comments for public APIs

```rust
/// Generates a new security report
/// 
/// # Arguments
/// * `scan_path` - Path to scan for security issues
/// 
/// # Returns
/// A Report containing all discovered issues
pub fn generate_report(scan_path: &str) -> Result<Report, Error> {
    // Implementation
}
```

### Testing

#### Adding Tests

1. **JavaScript tests** - Place in `tests/` directory
2. **Rust tests** - Inline with `#[cfg(test)]` modules in `src-tauri/`

Example JavaScript test:
```javascript
describe('createCodeBlock', () => {
  it('should create a code block element', () => {
    const block = createCodeBlock('Title', 'code here', false);
    expect(block).toBeDefined();
    expect(block.querySelector('code')).toBeTruthy();
  });
});
```

#### Running Tests

```bash
# Run JavaScript tests
npm test

# Run Rust tests (from src-tauri directory)
cd src-tauri
cargo test
```

### Linting

```bash
# Check JavaScript code style
npm run lint

# Fix JavaScript issues
npm run lint:fix

# Check Rust code
cd src-tauri
cargo clippy
cargo fmt
```

## Submitting Changes

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Use the PR template (auto-filled)
   - Link related issues: `Fixes #123`
   - Describe the changes clearly
   - Include any relevant screenshots/GIFs

4. **Respond to review feedback**
   - Address all comments
   - Push additional commits
   - Request re-review when ready

### PR Title Format

```
[Type] Brief description of change

Examples:
[Feature] Add new phishing detection tool
[Fix] Correct command assist formatting bug
[Docs] Update installation instructions
[Test] Add unit tests for utils
```

### PR Description Template

```markdown
## Description
Brief description of the change.

## Motivation
Why is this change needed? What problem does it solve?

## Changes Made
- Bullet list of changes
- One item per change

## Testing
How was this tested?
- [ ] Manual testing
- [ ] Unit tests added
- [ ] Integration tests added

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
```

## Reporting Issues

### Bug Reports

Use the bug report template at `.github/ISSUE_TEMPLATE/bug_report.md`

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- System info (OS, version, browser/environment)
- Error logs

### Feature Requests

Use the feature request template at `.github/ISSUE_TEMPLATE/feature_request.md`

Include:
- Clear description of the feature
- Use case and motivation
- Suggested implementation (if any)
- Related issues/discussions

## Documentation

### README.md
Update if you add new features or change setup procedures.

### Code Comments
- Write clear comments explaining WHY, not WHAT
- Update comments if you modify code
- Remove outdated comments

### Changelog
Major changes should be documented in `CHANGELOG.md`:
```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature descriptions

### Changed
- Behavior changes

### Fixed
- Bug fixes

### Removed
- Deprecated features
```

## Release Process

Only maintainers can cut releases. The process:

1. Update version in:
   - `package.json`
   - `src-tauri/tauri.conf.json`

2. Update `CHANGELOG.md`

3. Commit:
   ```bash
   git commit -m "chore: Prepare v0.2.0 release"
   ```

4. Create tag:
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   ```

5. Push:
   ```bash
   git push origin main
   git push origin v0.2.0
   ```

GitHub Actions automatically builds and publishes to releases.

## Questions?

- Check [existing issues](https://github.com/shubodaya/cyber-kit/issues)
- Review [discussions](https://github.com/shubodaya/cyber-kit/discussions)
- Create a [discussion](https://github.com/shubodaya/cyber-kit/discussions/new) for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Cyber Kit! 🚀**
