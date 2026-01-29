<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Security & Compatibility Status

This document tracks the security status and Nextcloud compatibility of the Social app.

## Nextcloud Compatibility

**Current Supported Versions:** Nextcloud 28, 29, 30, 31

The Social app is regularly tested and maintained for compatibility with:
- Nextcloud 28 (Minimum supported version)
- Nextcloud 29
- Nextcloud 30
- Nextcloud 31 (Latest tested version)

### Testing Compatibility

When testing with a new Nextcloud version:
1. Check database migrations work correctly
2. Test ActivityPub federation features
3. Verify WebFinger discovery
4. Test following/unfollowing users
5. Test posting, liking, and boosting
6. Verify no PHP errors in logs

## Security Status

### Dependency Security

**Last Audit:** 2026-01-29
**Status:** ✅ Secure (17 low severity vulnerabilities remaining)

We regularly run `npm audit` to check for security vulnerabilities in JavaScript dependencies.

**Recent Updates:**
- 2026-01-29: Fixed 8 vulnerabilities including critical issues
  - Updated @babel/runtime to 7.28.6
  - Updated axios to 1.13.4
  - Updated @nextcloud/vue-select to 3.26.0
  - Reduced from 25 vulnerabilities (5 critical, 3 high) to 17 low severity

**Remaining Vulnerabilities:**
- 17 low severity issues related to Vue 2 (EOL) and elliptic cryptography
- These require breaking changes to address (migration to Vue 3)
- No critical or high severity vulnerabilities remain

### Running Security Audits

To check for vulnerabilities:
```bash
# Check production dependencies only
npm audit --production

# Attempt to fix automatically
npm audit fix --production

# For breaking changes (use with caution)
npm audit fix --force
```

### Known Security Considerations

1. **Vue 2 EOL:** The app uses Vue 2.7.16 which has reached end-of-life. Migration to Vue 3 is planned but requires significant refactoring.

2. **Cryptography:** The elliptic package has known issues but is a transitive dependency. These are being addressed in upstream packages.

3. **SQL Injection:** All database queries use prepared statements via Nextcloud's query builder. No raw SQL is executed.

4. **XSS Prevention:** All user input is sanitized. Content is rendered through Vue's template system with automatic escaping.

5. **CSRF Protection:** All forms use Nextcloud's CSRF token system.

6. **ActivityPub Signatures:** All federation requests verify HTTP signatures and LinkedDataSignatures.

## Fediverse Features Status

### Core Features ✅

- [x] **Following/Unfollowing** - Users can follow remote ActivityPub actors
- [x] **Posts** - Create and share posts to the Fediverse
- [x] **Likes** - Like posts from remote instances
- [x] **Boosts (Reblogs)** - Share posts from other users
- [x] **Comments** - Reply to posts
- [x] **ActivityPub Protocol** - Full implementation of ActivityPub specification
- [x] **WebFinger Discovery** - Discover users via @username@domain
- [x] **HTTP Signatures** - Verify authenticity of federation requests
- [x] **LinkedData Signatures** - Cryptographic verification of activities

### Federation Tested With

- ✅ Mastodon
- ✅ Pleroma
- ⚠️ Friendica (partial compatibility)
- ⚠️ PeerTube (basic interoperability)
- ⚠️ Pixelfed (basic interoperability)

### Known Limitations

1. **No Group Support:** ActivityPub groups are not yet implemented
2. **No Direct Messages:** Private messages are not yet supported
3. **Limited Media Types:** Only images are fully supported, video support is basic
4. **No Polls:** Poll creation and voting not implemented
5. **No Emoji Reactions:** Only traditional likes are supported

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: security@nextcloud.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Update Policy

### Security Updates

- Critical security issues: Fixed within 24-48 hours
- High severity: Fixed within 1 week
- Medium/Low severity: Fixed in next regular release

### Compatibility Updates

- New Nextcloud major versions: Tested and updated within 1 month of release
- Dependency updates: Reviewed monthly
- Breaking changes: Only in major version updates

## Changelog

### 2026-01-29: Security & Compatibility Update
- Updated Nextcloud compatibility to version 31
- Fixed 8 npm security vulnerabilities
- Updated axios to 1.13.4 (fixes SSRF and DoS vulnerabilities)
- Updated @babel/runtime to 7.28.6
- Reduced critical/high vulnerabilities to zero
- Remaining: 17 low severity (related to Vue 2 EOL)

### Previous Updates
- See [CHANGELOG.md](CHANGELOG.md) for full history

## Best Practices for Administrators

### Security Hardening

1. **Keep Nextcloud Updated:** Always run the latest stable Nextcloud version
2. **HTTPS Only:** Ensure Social is only accessible via HTTPS
3. **Regular Backups:** Back up your database regularly
4. **Monitor Logs:** Check Nextcloud logs for suspicious activity
5. **Firewall Rules:** Consider IP whitelisting for admin access
6. **Rate Limiting:** Configure rate limiting for API endpoints

### Performance & Stability

1. **Use Cron:** Configure background jobs to use system cron (not AJAX)
2. **Enable Caching:** Use Redis or Memcached for better performance
3. **Database Optimization:** Ensure database indices are created properly
4. **Resource Limits:** Allocate sufficient PHP memory (512MB recommended)
5. **Queue Processing:** Monitor the queue for stuck jobs

### Federation Best Practices

1. **WebFinger Setup:** Ensure `.well-known/webfinger` is properly configured
2. **HTTP Signatures:** Verify signatures are being checked (see logs)
3. **Instance Blocks:** Consider maintaining a blocklist for known bad actors
4. **Resource Limits:** Set reasonable limits on following/followers
5. **Content Moderation:** Have clear policies and moderation tools ready

## Resources

- [Nextcloud Security Advisories](https://nextcloud.com/security/advisories/)
- [ActivityPub Specification](https://www.w3.org/TR/activitypub/)
- [OWASP Security Guidelines](https://owasp.org/)
- [Social App Documentation](DEVELOPMENT.md)

## Version Information

- **App Version:** 0.8.0
- **Nextcloud Min Version:** 28
- **Nextcloud Max Version:** 31
- **PHP Min Version:** 8.1
- **Node.js Version:** 20.x
- **Last Security Audit:** 2026-01-29
