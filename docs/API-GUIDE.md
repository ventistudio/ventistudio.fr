# VentiStudio API Guide - v6

## Overview

The VentiStudio API provides programmatic access to platform resources and functionality.

## Base URL

```
https://api.ventistudio.fr/v1
```

## Authentication

Use Bearer token authentication:

```bash
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Projects

#### List Projects
```
GET /projects
```

Query Parameters:
- `limit`: Number of projects (default: 10, max: 100)
- `offset`: Pagination offset (default: 0)
- `sort`: Sort by field (default: -created_at)

Response:
```json
{
  "data": [
    {
      "id": "proj_123",
      "title": "Project Name",
      "description": "Description",
      "created_at": "2025-12-19T00:00:00Z",
      "updated_at": "2025-12-19T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Project
```
GET /projects/{id}
```

#### Create Project
```
POST /projects
```

Request Body:
```json
{
  "title": "Project Name",
  "description": "Project description",
  "content": "Project content"
}
```

### Services

#### List Services
```
GET /services
```

Response:
```json
{
  "data": [
    {
      "id": "svc_123",
      "name": "Service Name",
      "description": "Description",
      "features": ["Feature 1", "Feature 2"]
    }
  ]
}
```

### Team

#### List Team Members
```
GET /team
```

Response:
```json
{
  "data": [
    {
      "id": "tm_123",
      "name": "John Doe",
      "role": "Developer",
      "bio": "Bio",
      "avatar": "https://..."
    }
  ]
}
```

## Error Handling

Errors follow standard HTTP status codes:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "status": 404
  }
}
```

## Rate Limiting

- 100 requests per minute
- 1000 requests per hour
- 10000 requests per day

## Status Codes

| Code | Meaning |
|------|----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

## Examples

### List Projects (cURL)
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.ventistudio.fr/v1/projects
```

### List Projects (JavaScript)
```javascript
const response = await fetch('https://api.ventistudio.fr/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_KEY'
  }
});
const data = await response.json();
console.log(data);
```

### List Projects (Python)
```python
import requests

headers = {'Authorization': 'Bearer YOUR_KEY'}
response = requests.get('https://api.ventistudio.fr/v1/projects', headers=headers)
data = response.json()
print(data)
```

## Support

For API support:
- Email: api-support@ventistudio.fr
- Discord: https://discord.gg/ventistudio
- Docs: https://ventistudio.fr/wiki/api
