# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (Features coming in next release)

### Changed
- (Behavior changes coming)

### Fixed
- (Bug fixes coming)

### Deprecated
- (Features to be removed)

### Removed
- (Features removed)

### Security
- (Security updates)

---

## [0.1.0] - 2024-01-24

### Added
- Initial release of Cyber Kit
- Command Assist tool for command generation and documentation
- Compliance Bot for security compliance checking (PCI-DSS, HIPAA, CIS, SOC2)
- Intelligence Bot for OSINT gathering and threat intelligence
- Phishing Bot for phishing detection and email analysis
- Triage Bot for incident triage and classification
- Web Tools for DNS, port scanning, and SSL analysis
- WiFi Analysis for network discovery and security assessment
- Cross-platform support (Windows, macOS, Linux)
- Automated CI/CD with GitHub Actions for multi-platform builds
- Comprehensive documentation and contributing guidelines
- MIT License for open-source distribution

### Platform Support Added
- Windows 10/11 (x86_64) with .msi installer
- macOS 10.13+ (Intel x86_64 and Apple Silicon aarch64) with .dmg installer
- Linux (Ubuntu 20.04+) with .AppImage and .deb packages

### Infrastructure
- Tauri desktop framework integration
- Rust backend with WebView
- Node.js/Express API server
- Python utilities for network operations
- Icon assets for all platforms (Windows .ico, macOS .icns, Linux .png)
- Automated icon bundle generation
- Issue and Pull Request templates
- Code of Conduct (Contributor Covenant)
- Contributing guidelines

---

## Format Guide

### Version Sections
Each version should have sections for:
- **Added** - new features
- **Changed** - existing feature changes
- **Fixed** - bug fixes
- **Deprecated** - features being removed
- **Removed** - removed features
- **Security** - security improvements

### Commit Types That Generate Changelog Items
- `feat:` → Added
- `fix:` → Fixed
- `refactor:` → Changed
- `perf:` → Changed (performance improvement)
- `docs:` → Skip unless significant change
- `style:` → Skip (no functional change)
- `test:` → Skip
- `chore:` → Skip

### Examples

#### Adding a Feature
```
### Added
- New export functionality for reports (Closes #123)
- Support for dark theme preference
- REST API documentation endpoint
```

#### Fixing a Bug
```
### Fixed
- Command Assist formatting for multi-line commands
- Window not resizing properly on macOS
- Memory leak in WiFi scanner
```

#### Breaking Change
```
### Changed
- **BREAKING**: Updated API response format (requires client update)
- Tool configuration file format (auto-migration provided)
```

---

## Release Process

1. **Create version branch**
   ```bash
   git checkout -b release/v0.2.0
   ```

2. **Update version numbers**
   - `package.json`: `"version": "0.2.0"`
   - `src-tauri/tauri.conf.json`: `"version": "0.2.0"`
   - `CHANGELOG.md`: Move `[Unreleased]` section to new `[0.2.0] - YYYY-MM-DD`

3. **Update dependencies**
   ```bash
   npm update
   cd src-tauri && cargo update
   ```

4. **Test the build**
   ```bash
   npm run build:tauri
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "chore: Prepare v0.2.0 release"
   git push origin release/v0.2.0
   ```

6. **Create Pull Request** for final review

7. **Merge to main**
   ```bash
   git checkout main
   git pull origin release/v0.2.0
   ```

8. **Create tag** (triggers CI/CD)
   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0: Major features and improvements"
   git push origin v0.2.0
   ```

9. **GitHub Actions automatically**
   - Builds for all platforms
   - Creates GitHub Release
   - Uploads installers

10. **Verify release**
    - Check GitHub Release page
    - Download and test installers
    - Verify all platforms present

---

## Versioning Scheme

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Incompatible API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Examples
- `0.1.0` → Initial release
- `0.1.1` → Bug fix
- `0.2.0` → New features
- `1.0.0` → Production ready
- `1.1.0` → More features
- `2.0.0` → Major breaking changes

### Pre-release Versions (if used)
- `0.1.0-alpha.1` - Alpha release
- `0.1.0-beta.1` - Beta release
- `0.1.0-rc.1` - Release candidate

---

## Related Links

- **All Releases**: https://github.com/shubodaya/cyber-kit/releases
- **Issue Tracker**: https://github.com/shubodaya/cyber-kit/issues
- **Discussions**: https://github.com/shubodaya/cyber-kit/discussions
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Last Updated**: 2024-01-24  
**Maintainer**: See GitHub profile
