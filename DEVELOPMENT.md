<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Development Guide for Nextcloud Social

This guide provides instructions for developers working on the Nextcloud Social app.

## Development Setup

### Prerequisites

- Nextcloud development environment (version 28-30)
- Node.js v20.x or higher
- npm v10.x or higher
- PHP 8.1 or higher
- Composer
- Git

### Initial Setup

1. **Clone the repository:**
   ```bash
   cd /path/to/nextcloud/apps
   git clone https://github.com/nextcloud/social.git
   cd social
   ```

2. **Install dependencies:**
   ```bash
   # Install PHP dependencies
   composer install
   
   # Install Node.js dependencies (use npm ci for reproducible builds)
   CYPRESS_INSTALL_BINARY=0 npm ci
   ```
   
   **Note:** We use `npm ci` instead of `npm install` for:
   - Faster, reproducible builds
   - Strict version locking from package-lock.json
   - Better for CI/CD pipelines
   
   The `package-lock.json` file is committed to the repository and should be kept in sync.

3. **Build frontend assets:**
   ```bash
   # Development build (faster, includes source maps)
   npm run dev
   
   # Watch mode for development (auto-rebuilds on changes)
   npm run watch
   
   # Production build (optimized, minified)
   npm run build
   ```

4. **Enable the app:**
   ```bash
   php occ app:enable social
   ```

## Development Workflow

### Frontend Development

The frontend is built with Vue.js 2.7 and uses Webpack for bundling.

**Key directories:**
- `src/` - Vue components and JavaScript source
- `src/components/` - Reusable Vue components
- `src/views/` - Page-level components
- `src/store/` - Vuex state management
- `src/services/` - API and utility services

**Development commands:**
```bash
# Watch mode - automatically rebuilds on file changes
npm run watch

# Lint JavaScript/Vue files
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Lint CSS/SCSS files
npm run stylelint

# Fix CSS linting issues
npm run stylelint:fix
```

### Backend Development

The backend is built with PHP using Nextcloud's App Framework.

**Key directories:**
- `lib/` - PHP source code
- `lib/Controller/` - HTTP controllers
- `lib/Service/` - Business logic services
- `lib/Db/` - Database access layer
- `lib/Model/` - ActivityPub models

**Development commands:**
```bash
# Install/update PHP dependencies
composer install

# Check PHP syntax
find lib -name "*.php" -exec php -l {} \;

# Run PHP linting (if configured)
vendor/bin/php-cs-fixer fix --dry-run

# Fix PHP code style
vendor/bin/php-cs-fixer fix

# Run Psalm static analysis
vendor/bin/psalm

# Run PHPUnit tests
vendor/bin/phpunit
```

### Database Migrations

When adding new database tables or columns:

1. Create a new migration in `lib/Migration/`
2. Follow the naming convention: `VersionXXXXDateYYYYMMDDHHMMSS.php`
3. Use Nextcloud's schema wrapper for database-agnostic SQL
4. Test on MySQL, PostgreSQL, and SQLite

Example:
```php
<?php
namespace OCA\Social\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\DB\Types;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

class Version1000Date20240129000001 extends SimpleMigrationStep {
    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ISchemaWrapper {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();
        
        if (!$schema->hasTable('social_my_table')) {
            $table = $schema->createTable('social_my_table');
            $table->addColumn('id', Types::BIGINT, [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->setPrimaryKey(['id']);
        }
        
        return $schema;
    }
}
```

## Testing

### Manual Testing

1. **Build and enable the app:**
   ```bash
   npm run build
   php occ app:enable social
   ```

2. **Test in browser:**
   - Navigate to https://your-nextcloud.local/index.php/apps/social
   - Check browser console for JavaScript errors (F12)
   - Test following users, creating posts, liking, boosting

3. **Test ActivityPub federation:**
   - Follow a user from another Mastodon/Pleroma instance
   - Post a public message and verify it appears on other instances
   - Test receiving activities from other instances

### Automated Testing

```bash
# Run JavaScript tests (if configured)
npm test

# Run E2E tests with Cypress
npm run cypress:gui

# Run PHP unit tests
vendor/bin/phpunit

# Run integration tests
php occ app:check-code social
```

### Code Quality Checks

Before committing, run:

```bash
# Frontend linting
npm run lint
npm run stylelint

# Backend linting
vendor/bin/php-cs-fixer fix
vendor/bin/psalm

# Check that build is up to date
npm run build
git diff --exit-code js/
```

## Continuous Integration

### GitHub Actions

The repository includes several GitHub Actions workflows for CI/CD:

**Workflows that work independently:**
- `node.yml` - Builds and validates frontend code
- `lint-eslint.yml` - Lints JavaScript/Vue code
- `lint-stylelint.yml` - Lints CSS/SCSS code
- `lint-php.yml` - Validates PHP syntax
- `psalm.yml` - Runs static analysis on PHP code

**Workflows requiring nextcloud organization:**
- `appstore-build-publish.yml` - Builds and publishes releases (requires `nextcloud-releases` organization)
- Several test workflows use `ubuntu-latest-low` runners only available in nextcloud organization

### Setting Up CI for Forks

If you're maintaining a fork outside the nextcloud organization:

1. **Update runner labels:**
   - Replace `ubuntu-latest-low` with `ubuntu-latest` in workflow files
   - This applies to workflows in `.github/workflows/`

2. **Disable organization-specific workflows:**
   - `appstore-build-publish.yml` will automatically skip (checks for `nextcloud-releases` owner)
   
3. **Create your own build workflow:**
   ```yaml
   name: Build Release
   on:
     release:
       types: [published]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - run: composer install --no-dev
         # Add your deployment steps here
   ```

### Security Best Practices for CI/CD

⚠️ **Important:** When setting up automated builds:

1. **Do NOT build in the nextcloud GitHub organization with secrets**
   - Keep builds in your own organization/repository
   - Use separate environments for sensitive operations

2. **Use npm ci instead of npm install**
   - Ensures reproducible builds from package-lock.json
   - Faster and more reliable in CI/CD environments

3. **Separate build and deployment**
   - Build artifacts in one job
   - Deploy in a separate, more restricted job

4. **Use minimal permissions**
   - Set appropriate `permissions:` in workflow files
   - Follow principle of least privilege

5. **Review dependencies regularly**
   - Run `npm audit` to check for vulnerabilities
   - Keep package-lock.json up to date

## Debugging

### Enable Debug Logging

1. **Nextcloud logging:**
   ```php
   // In config/config.php
   'loglevel' => 0, // 0 = Debug, 1 = Info, 2 = Warning, 3 = Error
   ```

2. **Browser console:**
   - The app uses a logger service (src/services/logger.js)
   - Check browser console for frontend errors
   - Source maps are included in development builds

3. **PHP debugging:**
   - Use Xdebug with your IDE
   - Add breakpoints in lib/ files
   - Check Nextcloud logs at data/nextcloud.log

### Common Issues

**"Module not found" errors:**
- Run `npm ci` to reinstall dependencies
- Check that package-lock.json is up to date

**"Undefined variable" or type errors in PHP:**
- Run `composer install` to update dependencies
- Check PHP version (requires 8.1+)
- Run `vendor/bin/psalm` for static analysis

**JavaScript not loading:**
- Rebuild with `npm run build`
- Clear browser cache (Ctrl+Shift+R)
- Check that js/ directory has compiled files

**Federation not working:**
- Check .well-known/webfinger is configured
- Verify HTTPS is working
- Check ActivityPub signatures in logs
- Test with `curl -H "Accept: application/activity+json" https://your-instance/@username`

## Contributing

### Before Submitting a Pull Request

1. **Run all linters:**
   ```bash
   npm run lint
   npm run stylelint
   vendor/bin/php-cs-fixer fix
   ```

2. **Build and test:**
   ```bash
   npm run build
   php occ app:enable social
   # Manual testing in browser
   ```

3. **Write clear commit messages:**
   - Use present tense ("Add feature" not "Added feature")
   - Keep first line under 72 characters
   - Reference issue numbers when applicable

4. **Keep changes focused:**
   - One feature/fix per pull request
   - Avoid mixing refactoring with new features
   - Update documentation if needed

### Code Style

**JavaScript/Vue:**
- Follows Nextcloud ESLint config
- Use tabs for indentation
- Maximum line length: 120 characters
- Use Vue 2.7 Composition API when possible

**PHP:**
- Follows PSR-12 coding standard
- Use tabs for indentation
- Type hints for all parameters and return values
- PHPDoc comments for public methods

**CSS:**
- Use Nextcloud CSS variables for theming
- Follow BEM methodology for class names
- Use SCSS for stylesheets

## Resources

- [Nextcloud App Development Documentation](https://docs.nextcloud.com/server/latest/developer_manual/)
- [ActivityPub Specification](https://www.w3.org/TR/activitypub/)
- [Mastodon API Documentation](https://docs.joinmastodon.org/api/)
- [Vue.js 2 Documentation](https://v2.vuejs.org/)

## Getting Help

- GitHub Issues: https://github.com/nextcloud/social/issues
- Nextcloud Developer Forum: https://help.nextcloud.com/c/dev
- Matrix Chat: #nextcloud-social:matrix.org
