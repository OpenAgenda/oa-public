# Event Conversations API

## Create Conversation

Creates a new conversation for a specific event within an agenda.

### Endpoint

```
POST /agendas/{agendaUid}/events/{eventUid}/conversations
```

### Authentication

Requires a valid access token with administrator or moderator permissions.

### Headers

- `access-token`: Your API access token
- `content-type`: application/json

### Path Parameters

- `agendaUid` (string): The unique identifier of the agenda
- `eventUid` (string): The unique identifier of the event

### Request Body

```json
{
  "message": "Your conversation message here"
}
```

### Response

```json
{
  "success": true,
  "conversation": {
    // conversation object details
  }
}
```

### Example cURL Request

```bash
curl -X POST \
  'http://localhost:4000/agendas/1001/events/1/conversations' \
  -H 'access-token: YOUR_ACCESS_TOKEN_HERE' \
  -H 'content-type: application/json' \
  -d '{
    "message": "This is a test conversation message"
  }'
```

### Example Response (Success)

```json
{
  "success": true,
  "conversation": {
    "id": 123,
    "message": "This is a test conversation message",
    "userUid": 2,
    "createdAt": "2023-12-08T15:38:51.000Z"
  }
}
```

### Error Responses

#### 403 Forbidden

Returned when the user doesn't have sufficient permissions (must be administrator or moderator).

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

#### 401 Unauthorized

Returned when no valid access token is provided.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Getting an Access Token

Before using the conversations endpoint, you need to obtain an access token:

```bash
curl -X POST \
  'http://localhost:4000/requestAccessToken' \
  -H 'content-type: application/json' \
  -d '{
    "code": "YOUR_ACCESS_CODE_HERE"
  }'
```

Response:

```json
{
  "access_token": "your_access_token_here"
}
```

### Notes

- Only users with administrator or moderator roles can create conversations
- The `message` field is required in the request body
- The API will automatically associate the conversation with the authenticated user
- Make sure to replace `YOUR_ACCESS_TOKEN_HERE` with your actual access token
- Replace `1001` and `1` with actual agenda and event UIDs
