# Administration Features

## Summary of Changes

An administrator permission system has been added to the Italiano application. Administrators can now manage all users on the platform.

## Database Changes

### Admin Field Added to User Model

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  name      String?
  admin     Boolean  @default(false)  // ← NEW FIELD
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lessons   UserLesson[]
}
```

**Note**: By default, all new users have `admin = false`.

## New APIs

### 1. List All Users (Admin Only)

- **Endpoint**: `GET /api/admin/users`
- **Authentication**: Bearer Token (JWT)
- **Permission**: Administrators only
- **Response**:
  ```json
  {
    "users": [
      {
        "id": "user_id",
        "username": "username",
        "email": "email@example.com",
        "name": "Name",
        "admin": false,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "_count": {
          "lessons": 5
        }
      }
    ]
  }
  ```

### 2. Delete User (Admin Only)

- **Endpoint**: `DELETE /api/admin/users/:id`
- **Authentication**: Bearer Token (JWT)
- **Permission**: Administrators only
- **Restriction**: Cannot delete own account
- **Response**: `{ "message": "User deleted successfully" }`

### 3. Toggle Admin Status (Admin Only)

- **Endpoint**: `PATCH /api/admin/users/:id`
- **Authentication**: Bearer Token (JWT)
- **Permission**: Administrators only
- **Restriction**: Cannot modify own admin status
- **Body**:
  ```json
  {
    "admin": true // or false
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "name": "Name",
      "admin": true
    }
  }
  ```

## Administration Interface

### Admin Panel

- **Route**: `/admin`
- **Access**: Only users with `admin = true`
- **Features**:
  - View list of all users
  - View information: username, email, name, admin status, number of lessons
  - Promote user to admin (shield icon)
  - Remove admin permission (person removed icon)
  - Delete user (trash icon)
  - Protections: cannot delete or modify own account

### Link in Navbar

The "Admin Panel" link appears automatically in the navbar for administrator users, in both desktop and mobile versions.

## Updated Authentication

The login and registration APIs now return:

- **user**: object with user data (including `admin` field)
- **token**: JWT token for authentication in protected routes

The token is automatically saved in `localStorage` as `italiano_token`.

## How to Make the First User Admin

Execute this SQL command directly in the database:

```sql
UPDATE "User" SET admin = true WHERE email = 'your_email@example.com';
```

Or use Prisma Studio:

```bash
npx prisma studio
```

And manually edit the `admin` field of the desired user.

## Security

### Implemented Protections

1. **Admin Verification**: All admin routes verify that the user has `admin = true`
2. **Self-protection**: Admins cannot delete or modify their own permissions
3. **JWT Authentication**: All admin routes require a valid token
4. **Input Validation**: All data is validated before processing
5. **Cascade Delete**: When a user is deleted, their lessons are also removed

### Recommendations

- Set `JWT_SECRET` in production environment variables
- Use HTTPS in production
- Keep the number of admins to the minimum necessary
- Backup the database before bulk admin operations

## Testing

To test the features:

1. Create a user or make an existing one admin
2. Log in with that user
3. Access `/admin` in the browser
4. Test listing, promoting, and removing admin operations
5. Try deleting a user (not yourself)

## Environment Variables

Add to `.env`:

```env
JWT_SECRET=your_very_secure_secret_key_here
```

**IMPORTANT**: In production, use a long and random key!
