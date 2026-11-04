Trebell Code is a desktop coding workspace with Trebell Native, provider integrations, persistent conversations, file editing, Git, terminals, and a browser for checking the work.

### Downloads

| System | Package |
| --- | --- |
| Windows x64 | `Trebell-Code-Setup.exe` |
| Linux x64 | `Trebell-Code-linux-x64.AppImage` or `Trebell-Code-linux-x64.deb` |
| macOS Apple Silicon | `Trebell-Code-mac-arm64.dmg` or `.zip` |
| macOS Intel | `Trebell-Code-mac-x64.dmg` or `.zip` |

The application, release title, and download names do not display a product release number. `SHA256SUMS` contains the checksums of the downloadable packages.

### Included fixes

- Fresh desktop installations and source runs default to light mode from startup. Saved appearance choices continue to apply.
- The README includes both ZIP-download and Git-clone setup instructions.
- Windows runtime launchers work when their paths contain spaces.
- Context usage displays the latest prompt input rather than cumulative billed usage.
- Markdown file previews render tables with safe inline formatting.
- Closing the workspace closes its Agent Browser and completes shutdown.
- Commits in repositories without a remote succeed without a misleading pull-request warning.
- Delayed workspace-context saves no longer bring archived threads back into the sidebar.

### Checks and limitations

Every uploaded package is built on its target operating system. The actual packaged application is checked for ASAR startup, UI rendering, a real native terminal command, lazy-loaded Settings, and renderer errors before publication.

The source verification covered 1,534 passing Playwright cases across batches and repaired regressions, with three live OpenAI cases skipped. A real Meta-driven UI session created and exercised a complete project. Other provider accounts and remote hosts were exercised with fixtures rather than their live credentials.

Installers are unsigned. Windows may show SmartScreen, and macOS may require approval in Privacy & Security for an unidentified developer. macOS packages are not notarized. Windows computer-use capabilities are currently Windows-only. Provider API keys or each external harness's own sign-in are required; accounts and credentials are not bundled.
