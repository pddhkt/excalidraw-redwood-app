# Save Drawing API Tests
# Tests for saveDrawingContent() server function with R2 storage

# Setup: Create a test session and drawing
POST http://localhost:5173/test/fake-login
HTTP 200
[Captures]
session_cookie: cookie "session_id"

# Create a drawing to save content to
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "Test Drawing for Save API"
}
HTTP 200
[Captures]
drawing_id: jsonpath "$.drawing.id"

# Test 1: Save drawing with content only (minimal)
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {
      "viewBackgroundColor": "#ffffff"
    }
  }
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.contentUrl" exists
jsonpath "$.contentUrl" matches "^drawing-content/.+\\.json$"
jsonpath "$.drawing.contentUrl" exists
jsonpath "$.drawing.updatedAt" exists
jsonpath "$.drawing.title" == "Test Drawing for Save API"

# Test 2: Save drawing with content + thumbnail
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [
      {
        "type": "rectangle",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100
      }
    ],
    "appState": {}
  },
  "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.contentUrl" exists
jsonpath "$.thumbnailUrl" exists
jsonpath "$.thumbnailUrl" matches "^drawing-thumbnails/.+\\.png$"
jsonpath "$.drawing.thumbnailUrl" exists

# Test 3: Save drawing with content + metadata updates
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {}
  },
  "title": "Updated Title via Save",
  "description": "Updated description via Save"
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.drawing.title" == "Updated Title via Save"
jsonpath "$.drawing.description" == "Updated description via Save"

# Test 4: Save drawing with all fields (content, thumbnail, title, description)
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "source": "https://excalidraw.com",
    "elements": [
      {
        "type": "rectangle",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100
      }
    ],
    "appState": {
      "gridSize": null,
      "viewBackgroundColor": "#ffffff"
    },
    "files": {}
  },
  "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "title": "Complete Save Test",
  "description": "This has everything"
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.contentUrl" exists
jsonpath "$.thumbnailUrl" exists
jsonpath "$.drawing.title" == "Complete Save Test"
jsonpath "$.drawing.description" == "This has everything"
jsonpath "$.drawing.contentUrl" exists
jsonpath "$.drawing.thumbnailUrl" exists

# Test 5: Unauthorized save (no session)
POST http://localhost:5173/test/clear-session
HTTP 200

POST http://localhost:5173/test/drawing/save
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {}
  }
}
HTTP 401
[Asserts]
jsonpath "$.error" == "Failed to save drawing"
jsonpath "$.message" contains "Unauthorized"

# Restore session for remaining tests
POST http://localhost:5173/test/fake-login
HTTP 200
[Captures]
session_cookie: cookie "session_id"

# Test 6: Save non-existent drawing
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "00000000-0000-0000-0000-000000000000",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {}
  }
}
HTTP 404
[Asserts]
jsonpath "$.error" == "Failed to save drawing"
jsonpath "$.message" contains "not found"

# Test 7: Save drawing owned by different user
# First create a different user's session
POST http://localhost:5173/test/clear-session
HTTP 200

# Create second user session with different username
POST http://localhost:5173/test/fake-login-as
Content-Type: application/json
{
  "username": "test-user-2"
}
HTTP 200
[Captures]
session_cookie_2: cookie "session_id"

# Create drawing as user 2
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie_2}}
Content-Type: application/json
{
  "title": "User 2 Drawing"
}
HTTP 200
[Captures]
drawing_id_user2: jsonpath "$.drawing.id"

# Switch back to user 1
POST http://localhost:5173/test/clear-session
HTTP 200

POST http://localhost:5173/test/fake-login
HTTP 200
[Captures]
session_cookie: cookie "session_id"

# Try to save user 2's drawing as user 1
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id_user2}}",
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {}
  }
}
HTTP 403
[Asserts]
jsonpath "$.error" == "Failed to save drawing"
jsonpath "$.message" contains "Forbidden"

# Test 8: Invalid content (missing required fields)
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}",
  "content": {
    "type": "excalidraw"
  }
}
HTTP 400
[Asserts]
jsonpath "$.error" == "Failed to save drawing"

# Test 9: Missing drawingId
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [],
    "appState": {}
  }
}
HTTP 400
[Asserts]
jsonpath "$.error" == "Failed to save drawing"

# Test 10: Missing content
POST http://localhost:5173/test/drawing/save
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "drawingId": "{{drawing_id}}"
}
HTTP 400
[Asserts]
jsonpath "$.error" == "Failed to save drawing"

# Cleanup: Clear the test session
POST http://localhost:5173/test/clear-session
HTTP 200
[Asserts]
jsonpath "$.success" == true
