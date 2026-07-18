# API Reference

Base URL: `https://your-app.vercel.app`

All responses follow this format:
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "req_...",
    "version": "0.1.0"
  }
}
```

## Authentication

All API routes require a valid Supabase JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Inventory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory?branch=jaen` | All | List inventory items |
| POST | `/api/inventory` | Admin | Create new item |
| PUT | `/api/inventory/:id` | Admin | Update item |
| DELETE | `/api/inventory/:id` | Admin | Delete item + logs |

**POST /api/inventory**
```json
{
  "branch_id": "jaen",
  "item_name": "Matcha Powder",
  "category": "powder",
  "unit": "packs",
  "starting_stock": 10
}
```

**PUT /api/inventory/:id**
```json
{
  "item_name": "New Name",
  "category": "liquid",
  "starting_stock": 15,
  "actual_physical_count": 12
}
```

### Daily Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/logs?branch=jaen&offset=0&limit=25` | All | List logs |
| POST | `/api/logs` | Staff/Admin | Submit log entry |

**POST /api/logs**
```json
{
  "branch_id": "jaen",
  "item_id": 1,
  "log_type": "deduction",
  "quantity_opened": 2
}
```

### Transfers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transfers` | All | List transfers |
| POST | `/api/transfers` | Admin | Create transfer |

**POST /api/transfers**
```json
{
  "source_branch": "jaen",
  "destination_branch": "mallorca",
  "item_id": 1,
  "quantity": 5
}
```

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List staff users |
| POST | `/api/users` | Admin | Invite staff |
| PUT | `/api/users/:id` | Admin | Update staff branch |
| DELETE | `/api/users/:id` | Admin | Remove staff |

### Audit & Activity

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audit?offset=0&limit=25` | Admin | Audit log entries |
| GET | `/api/activity?offset=0&limit=25` | Admin | User activity logs |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | System health check |

**GET /api/health**
```json
{
  "status": "healthy",
  "database": { "status": "connected", "latencyMs": 12 },
  "stats": { "inventoryItems": 21, "totalLogs": 150, "activityRecords": 300 },
  "version": "0.1.0",
  "uptime": 86400,
  "environment": "production"
}
```

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 req | 15 min |
| Admin API | 10 req | 5 min |

Rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Server error |
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized |
