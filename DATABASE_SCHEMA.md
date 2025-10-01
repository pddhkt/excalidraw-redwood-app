# Database Schema Documentation

## Overview

This document describes the database schema for the Excalidraw RedwoodSDK application. The database uses Cloudflare D1 (SQLite) via Prisma ORM.

**Database Type**: SQLite (Cloudflare D1)
**ORM**: Prisma
**Schema Location**: `prisma/schema.prisma`

## Schema Diagram

```
┌─────────────────────────────┐
│          User               │
├─────────────────────────────┤
│ id          String (PK)     │
│ username    String (unique) │
│ tier        UserTier        │
│ createdAt   DateTime        │
│ lastLoginAt DateTime?       │
│ lastActivity DateTime       │
└─────────────────────────────┘
              │
              │ 1:N
              │
              ▼
┌─────────────────────────────┐
│       Credential            │
├─────────────────────────────┤
│ id            String (PK)   │
│ userId        String (FK)   │
│ createdAt     DateTime      │
│ credentialId  String (unique)│
│ publicKey     Bytes         │
│ counter       Int           │
└─────────────────────────────┘
  Indexes: credentialId, userId
```

## Models

### User

Represents an authenticated user in the system.

| Field        | Type       | Constraints         | Description                              |
|--------------|------------|---------------------|------------------------------------------|
| id           | String     | PK, UUID            | Unique user identifier (auto-generated)  |
| username     | String     | UNIQUE, NOT NULL    | User's unique username                   |
| tier         | UserTier   | DEFAULT: REGISTERED | User's permission tier                   |
| createdAt    | DateTime   | DEFAULT: now()      | Account creation timestamp               |
| lastLoginAt  | DateTime?  | NULLABLE            | Most recent login timestamp              |
| lastActivity | DateTime   | DEFAULT: now()      | Last activity timestamp                  |

**Relationships**:
- `credentials`: One-to-many with Credential model

### Credential

Stores WebAuthn/Passkey credentials for passwordless authentication.

| Field        | Type     | Constraints         | Description                                    |
|--------------|----------|---------------------|------------------------------------------------|
| id           | String   | PK, UUID            | Internal database identifier (auto-generated)  |
| userId       | String   | FK, UNIQUE          | References User.id (one credential per user)   |
| createdAt    | DateTime | DEFAULT: now()      | Credential creation timestamp                  |
| credentialId | String   | UNIQUE, NOT NULL    | WebAuthn credential identifier                 |
| publicKey    | Bytes    | NOT NULL            | Public key for credential verification         |
| counter      | Int      | DEFAULT: 0          | Signature counter for replay attack prevention |

**Relationships**:
- `user`: Many-to-one with User model (via `userId` → `User.id`)

**Indexes**:
- `credentialId`: For fast credential lookups during authentication
- `userId`: For efficient user-credential queries

### UserTier (Enum)

Defines user permission levels.

| Value        | Description                                    |
|--------------|------------------------------------------------|
| GUEST        | Unauthenticated or temporary guest user        |
| REGISTERED   | Standard authenticated user (default)          |
| TEAM_MEMBER  | User with team/organization permissions        |

## Relationships

### User ↔ Credential (One-to-Many)

- **Cardinality**: One User can have many Credentials (1:N)
- **Current Constraint**: `userId` is marked as `@unique` in Credential model, effectively making this a 1:1 relationship
- **Foreign Key**: `Credential.userId` → `User.id`
- **Cascade Behavior**: Not explicitly defined (defaults to Prisma's default behavior)

## Key Constraints

1. **Username Uniqueness**: Each username must be unique across all users
2. **Credential Uniqueness**: Each `credentialId` must be unique (WebAuthn requirement)
3. **User-Credential Link**: Currently enforced as 1:1 via `@unique` on `userId`

## Migration Commands

### Local Development
```bash
npm run migrate:dev      # Apply migrations to local D1 database
npm run migrate:new      # Create a new migration after schema changes
npm run generate         # Regenerate Prisma client
```

### Production
```bash
npm run migrate:prd      # Apply migrations to production D1 database
```

## Schema Evolution Guidelines

When modifying the schema:

1. **Edit** `prisma/schema.prisma`
2. **Create migration**: `npm run migrate:new`
3. **Apply locally**: `npm run migrate:dev`
4. **Test** changes thoroughly
5. **Apply to production**: `npm run migrate:prd` (when deploying)

## Notes

- **UUID Generation**: User and Credential IDs use `@default(uuid())` for distributed ID generation
- **SQLite Limitations**: D1 is SQLite-based, so some advanced PostgreSQL features are unavailable
- **Prisma Adapter**: Uses D1 driver adapter with workerd runtime for Cloudflare Workers compatibility
- **Generated Files**: Prisma client is generated to `generated/prisma/` (not `node_modules`)

## Future Considerations

Potential schema extensions based on application needs:

- **Drawing** model for storing user drawings
- **Session** model if moving away from Durable Objects
- **Team/Organization** models for collaboration features
- **AuditLog** model for security/compliance tracking
- Expanding Credential to allow multiple credentials per user (remove `@unique` from `userId`)
