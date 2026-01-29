# Milestone API Documentation

## Overview
Complete API documentation for Milestone management endpoints with full request/response examples.

---

## 1. CREATE MILESTONE
**Endpoint:** `POST /api/milestones`

**Authentication:** ✅ Required (Any authenticated user)

**Permission:** ✅ Any authenticated user can create milestones

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Request Body
```json
{
  "projectId": "67a8c9f1a1b2c3d4e5f6g7h8",
  "title": "Design Phase",
  "description": "Complete architectural design and planning",
  "subtasks": [
    {
      "title": "Structural Design",
      "description": "Create structural drawings",
      "startDate": "2026-02-01",
      "endDate": "2026-02-15",
      "assignedTo": "67a8c9f1a1b2c3d4e5f6g7h9",
      "isCompleted": false,
      "attachments": []
    },
    {
      "title": "MEP Design",
      "description": "Mechanical, Electrical, Plumbing design",
      "startDate": "2026-02-10",
      "endDate": "2026-02-25",
      "assignedTo": "67a8c9f1a1b2c3d4e5f6g7ha",
      "isCompleted": false,
      "attachments": []
    }
  ]
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Milestone created successfully",
  "data": {
    "_id": "67a8c9f1a1b2c3d4e5f6g7hb",
    "projectId": "67a8c9f1a1b2c3d4e5f6g7h8",
    "title": "Design Phase",
    "description": "Complete architectural design and planning",
    "subtasks": [
      {
        "_id": "67a8c9f1a1b2c3d4e5f6g7hc",
        "title": "Structural Design",
        "description": "Create structural drawings",
        "startDate": "2026-02-01",
        "endDate": "2026-02-15",
        "assignedTo": "67a8c9f1a1b2c3d4e5f6g7h9",
        "isCompleted": false,
        "attachments": []
      }
    ],
    "progress": 0,
    "status": "pending",
    "createdby": "67a8c9f1a1b2c3d4e5f6g7h7",
    "createdAt": "2026-01-29T10:30:00.000Z",
    "updatedAt": "2026-01-29T10:30:00.000Z"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "projectId and title are required"
}
```

### Response (Error - 403)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 2. GET MILESTONES
**Endpoint:** `GET /api/milestones`

**Authentication:** ✅ Required (Any authenticated user)

**Permission:** ✅ Any authenticated user can view milestones

### Query Parameters (Optional)
| Parameter | Type | Description |
|-----------|------|-------------|
| `milestoneId` | string | Get single milestone by ID |
| `projectId` | string | Get all milestones for specific project |

### Example Requests

#### Get All Milestones
```
GET /api/milestones
```

#### Get Milestones by Project ID
```
GET /api/milestones?projectId=67a8c9f1a1b2c3d4e5f6g7h8
```

#### Get Single Milestone by ID
```
GET /api/milestones?milestoneId=67a8c9f1a1b2c3d4e5f6g7hb
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "67a8c9f1a1b2c3d4e5f6g7hb",
      "projectId": {
        "_id": "67a8c9f1a1b2c3d4e5f6g7h8",
        "name": "Residential Building A"
      },
      "title": "Design Phase",
      "description": "Complete architectural design and planning",
      "subtasks": [
        {
          "_id": "67a8c9f1a1b2c3d4e5f6g7hc",
          "title": "Structural Design",
          "description": "Create structural drawings",
          "startDate": "2026-02-01",
          "endDate": "2026-02-15",
          "assignedTo": {
            "_id": "67a8c9f1a1b2c3d4e5f6g7h9",
            "name": "John Engineer"
          },
          "isCompleted": false,
          "attachments": []
        }
      ],
      "progress": 25,
      "status": "in-progress",
      "createdby": "67a8c9f1a1b2c3d4e5f6g7h7",
      "createdAt": "2026-01-29T10:30:00.000Z"
    }
  ]
}
```

### Response (Error - 403)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 3. UPDATE MILESTONE
**Endpoint:** `PUT /api/milestones/[milestoneId]`

**Authentication:** ✅ Required (Any authenticated user)

**Permission:** ✅ Any authenticated user can update milestones

### Request Body
```json
{
  "title": "Design Phase - Updated",
  "description": "Updated description",
  "subtasks": [
    {
      "_id": "67a8c9f1a1b2c3d4e5f6g7hc",
      "title": "Structural Design - Updated",
      "description": "Create structural drawings with revisions",
      "startDate": "2026-02-01",
      "endDate": "2026-02-20",
      "assignedTo": "67a8c9f1a1b2c3d4e5f6g7h9",
      "isCompleted": false,
      "attachments": ["url1", "url2"]
    }
  ]
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Milestone updated successfully",
  "data": {
    "_id": "67a8c9f1a1b2c3d4e5f6g7hb",
    "projectId": "67a8c9f1a1b2c3d4e5f6g7h8",
    "title": "Design Phase - Updated",
    "description": "Updated description",
    "subtasks": [
      {
        "_id": "67a8c9f1a1b2c3d4e5f6g7hc",
        "title": "Structural Design - Updated",
        "description": "Create structural drawings with revisions",
        "startDate": "2026-02-01",
        "endDate": "2026-02-20",
        "assignedTo": "67a8c9f1a1b2c3d4e5f6g7h9",
        "isCompleted": false,
        "attachments": ["url1", "url2"]
      }
    ],
    "progress": 25,
    "status": "in-progress",
    "createdAt": "2026-01-29T10:30:00.000Z",
    "updatedAt": "2026-01-29T11:45:00.000Z"
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Milestone not found"
}
```

---

## 4. DELETE MILESTONE ⭐ (NEW - ADMIN ONLY)
**Endpoint:** `DELETE /api/milestones/[milestoneId]`

**Authentication:** ✅ Required

**Permission:** 🔐 **ADMIN ONLY** - Only admin users can delete milestones

### Request
```
DELETE /api/milestones/67a8c9f1a1b2c3d4e5f6g7hb
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```

### Response (Error - 403 - Not Admin)
```json
{
  "success": false,
  "message": "Only admin can delete milestones"
}
```

### Response (Error - 403 - Not Authenticated)
```json
{
  "success": false,
  "message": "Only admin can delete milestones"
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Milestone not found"
}
```

---

## Role-Based Access Matrix

| Operation | Endpoint | GET | POST | PUT | DELETE |
|-----------|----------|-----|------|-----|--------|
| **Admin** | All Milestones | ✅ | ✅ | ✅ | ✅ |
| **Manager** | All Milestones | ✅ | ✅ | ✅ | ❌ |
| **Engineer** | All Milestones | ✅ | ✅ | ✅ | ❌ |
| **Client** | All Milestones | ✅ | ✅ | ✅ | ❌ |

---

## Required Field Details

### Milestone Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | ObjectId | Yes | Reference to Project document |
| `title` | String | Yes | Milestone name/title |
| `description` | String | No | Detailed description |
| `subtasks` | Array | No | Array of subtasks |
| `progress` | Number | No | Auto-calculated (0-100) |
| `status` | String | No | Auto-calculated (pending/in-progress/completed) |

### Subtask Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Subtask name |
| `description` | String | No | Detailed description |
| `startDate` | Date | No | Start date (YYYY-MM-DD) |
| `endDate` | Date | No | End date (YYYY-MM-DD) |
| `assignedTo` | ObjectId | No | User ID assigned to subtask |
| `isCompleted` | Boolean | No | Completion status |
| `attachments` | Array | No | Array of attachment URLs |

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 201 | Milestone created successfully | POST successful |
| 200 | Success | GET/PUT/DELETE successful |
| 400 | projectId and title are required | Missing required fields in POST |
| 403 | Unauthorized | No session token |
| 403 | Only admin can delete milestones | DELETE by non-admin user |
| 404 | Milestone not found | Invalid milestone ID |
| 500 | Failed to create/fetch/update/delete milestone | Server error |

---

## Example cURL Commands

### Create Milestone
```bash
curl -X POST http://localhost:3000/api/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "67a8c9f1a1b2c3d4e5f6g7h8",
    "title": "Design Phase",
    "description": "Complete architectural design"
  }'
```

### Get All Milestones
```bash
curl -X GET http://localhost:3000/api/milestones
```

### Get Milestone by Project
```bash
curl -X GET "http://localhost:3000/api/milestones?projectId=67a8c9f1a1b2c3d4e5f6g7h8"
```

### Get Single Milestone
```bash
curl -X GET "http://localhost:3000/api/milestones?milestoneId=67a8c9f1a1b2c3d4e5f6g7hb"
```

### Update Milestone
```bash
curl -X PUT http://localhost:3000/api/milestones/67a8c9f1a1b2c3d4e5f6g7hb \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Phase - Updated",
    "description": "Updated description"
  }'
```

### Delete Milestone (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/milestones/67a8c9f1a1b2c3d4e5f6g7hb \
  -H "Authorization: Bearer <admin-jwt-token>"
```

---

## Notes

- ✅ All endpoints require authentication (valid JWT session)
- 🔐 DELETE endpoint requires admin role
- Progress and status are automatically calculated based on subtask completion
- Subtask updates use merge logic - only provided fields are updated
- All timestamps are in UTC format
- Pagination not implemented - returns all records matching query

---

**Last Updated:** January 29, 2026
**API Version:** v1
