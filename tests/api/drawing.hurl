# Drawing API Tests
# These tests verify the Create Drawing API functionality

# Setup: Create a test session first
POST http://localhost:5173/test/fake-login
HTTP 200
[Captures]
session_cookie: cookie "session_id"

# Test 1: Create drawing with minimal data (title only)
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "Test Drawing"
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.drawing.title" == "Test Drawing"
jsonpath "$.drawing.status" == "DRAFT"
jsonpath "$.drawing.isPublic" == false
jsonpath "$.drawing.contentUrl" == null
jsonpath "$.drawing.thumbnailUrl" == null
jsonpath "$.drawing.id" exists
jsonpath "$.drawing.userId" exists
jsonpath "$.drawing.createdAt" exists
jsonpath "$.drawing.updatedAt" exists

# Test 2: Create drawing with full metadata
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "My Diagram",
  "description": "A detailed architectural diagram",
  "isPublic": false,
  "tags": ["architecture", "diagram", "backend"]
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.drawing.title" == "My Diagram"
jsonpath "$.drawing.description" == "A detailed architectural diagram"
jsonpath "$.drawing.isPublic" == false
jsonpath "$.drawing.tags[0]" == "architecture"
jsonpath "$.drawing.tags[1]" == "diagram"
jsonpath "$.drawing.tags[2]" == "backend"
jsonpath "$.drawing.status" == "DRAFT"

# Test 3: Create public drawing
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "Public Sketch",
  "isPublic": true
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.drawing.isPublic" == true

# Test 4: Unauthorized request (no session)
# First clear the session to ensure no authentication
POST http://localhost:5173/test/clear-session
HTTP 200

POST http://localhost:5173/test/drawing/create
Content-Type: application/json
{
  "title": "Unauthorized Drawing"
}
HTTP 401
[Asserts]
jsonpath "$.error" == "Failed to create drawing"
jsonpath "$.message" contains "Unauthorized"

# Restore session for remaining tests
POST http://localhost:5173/test/fake-login
HTTP 200
[Captures]
session_cookie: cookie "session_id"

# Test 5: Missing title (validation error)
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "description": "No title provided"
}
HTTP 500
[Asserts]
jsonpath "$.error" == "Failed to create drawing"
jsonpath "$.message" contains "required"

# Test 6: Empty title (validation error)
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": ""
}
HTTP 500
[Asserts]
jsonpath "$.error" == "Failed to create drawing"
jsonpath "$.message" contains "required"

# Test 7: Title too long (validation error)
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "This is a very long title that exceeds the maximum allowed length of 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
}
HTTP 500
[Asserts]
jsonpath "$.error" == "Failed to create drawing"
jsonpath "$.message" contains "200 characters"

# Test 8: Create drawing with empty tags array
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
{
  "title": "Drawing with Empty Tags",
  "tags": []
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.drawing.tags" not exists

# Test 9: Invalid JSON
POST http://localhost:5173/test/drawing/create
Cookie: session_id={{session_cookie}}
Content-Type: application/json
```
{invalid json here}
```
HTTP 400
[Asserts]
jsonpath "$.error" == "Invalid JSON"

# Cleanup: Clear the test session
POST http://localhost:5173/test/clear-session
HTTP 200
[Asserts]
jsonpath "$.success" == true
