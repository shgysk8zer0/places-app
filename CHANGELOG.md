<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add limited support for select `"Organization"` types
- Add fields for select social networks
- Support images via URL
- Implement `share_target` for PWA, prefilling name, url, and description
- Support alternate formatting (`"location"`) for`"Organization"` types
- Add support for optional `"alternateType"`
- Image uploads via Imgur API
- Prepare for launch on Play Store by adding `<app-stores>`
- Google Play Store app metadata

### Changed
- Update page with more content and FAQ
- Load `<leaflet-map>` script dynamically, after page load and idle

### Fixed
- Reset inputs with values set by JavaScript
- Revert to initial `open` state of `<details>` in the form

### Removed
- Do not allow uploading/bas64 encoding images

## [v2.0.0] - 2021-02-14

### Changed
  - Complete rewrite for compatibility with places data requirements
  - Add `<leaflet-map>` to show coordinates, and update coordinates on map pan
  - Update for better consistency with other apps
  - Update icons

<!-- markdownlint-restore -->
