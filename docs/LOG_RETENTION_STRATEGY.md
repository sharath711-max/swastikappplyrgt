# Log Retention Strategy

This project now has a built-in retention and rotation policy for the
application-managed logs written under `backend/logs/`.

## Scope

The following logs are covered automatically:

- `backend/logs/YYYY-MM-DD.log`
- `backend/logs/YYYY-MM-DD.<segment>.log`
- `backend/logs/audit-YYYY-MM-DD.ndjson`
- `backend/logs/audit-YYYY-MM-DD.<segment>.ndjson`

These files are created by the backend logger and audit writer.

## Default Policy

Application logs:

- Rotate by day
- Split into a new segment after `5 MB`
- Gzip old segments after `1 day`
- Retain for `14 days`

Audit logs:

- Rotate by day
- Split into a new segment after `10 MB`
- Gzip old segments after `1 day`
- Retain for `30 days`

## Environment Overrides

App log settings:

- `APP_LOG_MAX_BYTES`
- `APP_LOG_RETENTION_DAYS`
- `APP_LOG_COMPRESS_AFTER_DAYS`
- `APP_LOG_MAINTENANCE_INTERVAL_MS`

Audit log settings:

- `AUDIT_LOG_MAX_BYTES`
- `AUDIT_LOG_RETENTION_DAYS`
- `AUDIT_LOG_COMPRESS_AFTER_DAYS`
- `AUDIT_LOG_MAINTENANCE_INTERVAL_MS`

## Maintenance

Maintenance is triggered automatically during normal log writes, and it can be
run manually with:

```bash
npm run logs:maintain
```

This command compresses eligible older files and removes files beyond the
configured retention window.

## PM2 Note

PM2 stdout and stderr files in the root `logs/` folder are separate from the
backend-managed rolling files. They are still useful for live process
inspection, but they do not use the same built-in retention utility.

Recommended production approach for PM2 logs:

- Keep `backend/logs/` as the durable app and audit history
- Treat root `logs/` as operational console output
- Add host-level rotation for PM2 logs such as `pm2-logrotate` or OS logrotate
- Schedule `npm run logs:maintain` at least daily
