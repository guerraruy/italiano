# Quick Guide - Administration System

## 🎯 What has been implemented?

✅ `admin` field in User model (Prisma)
✅ APIs for user management (admin only)
✅ Complete Admin Panel interface
✅ JWT Authentication
✅ Admin Panel link in Navbar (visible only to admins)

## 🚀 How to get started?

### 1. Create the first admin

**Option 1 - Via Prisma Studio:**
```bash
npx prisma studio
```
Open Prisma Studio, select the User table, find your user and mark `admin` as `true`.

**Option 2 - Via direct SQL:**
```sql
UPDATE "User" SET admin = true WHERE email = 'your_email@example.com';
```

### 2. Log in

Log in normally with the user you made admin.

### 3. Access the Admin Panel

After logging in, you will see the "Admin Panel" button in the navbar. Click on it or access `/admin`.

## 🛠️ Admin Panel Features

### View all users
- Username
- Email
- Full name
- Admin status
- Number of completed lessons
- Registration date

### Manage permissions
- **Make admin**: Click on the shield icon (blue)
- **Remove admin**: Click on the person removed icon (orange)

### Delete users
- Click on the trash icon (red)
- Confirm deletion in the dialog

### Protections
- ❌ You cannot delete your own account
- ❌ You cannot remove your own admin permission
- ✅ All deleted user data is removed (cascade)

## 📁 Created/Modified Files

### Created:
- `app/api/admin/users/route.ts` - API to list users
- `app/api/admin/users/[id]/route.ts` - API to delete/modify user
- `app/components/AdminPanel.tsx` - Admin panel interface
- `app/admin/page.tsx` - Admin page
- `ADMIN_FEATURES.md` - Complete technical documentation

### Modified:
- `prisma/schema.prisma` - Added `admin` field
- `app/contexts/AuthContext.tsx` - Support for admin field and JWT token
- `app/components/Navbar.tsx` - Admin Panel link
- `app/api/auth/login/route.ts` - Returns JWT token
- `app/api/auth/register/route.ts` - Returns JWT token

## 🔐 Security

- All admin routes verify authentication via JWT
- Only users with `admin = true` can access
- JWT tokens with 7-day expiration
- Validation of all inputs
- Protection against self-modification

## ⚙️ Production Configuration

Add to `.env` file:
```env
JWT_SECRET=a_very_secure_and_random_key_here_with_at_least_32_characters
```

**⚠️ IMPORTANT**: Never use the default key in production!

## 🐛 Troubleshooting

**Problem**: I don't see the "Admin Panel" link
- **Solution**: Make sure the user's `admin` field is set to `true` and log out/log in again

**Problem**: 403 "Unauthorized" error
- **Solution**: Check if the JWT token is being sent and if the user is admin

**Problem**: Error when deleting user
- **Solution**: Check if you are not trying to delete your own account

## 📚 More Information

See the `ADMIN_FEATURES.md` file for complete technical documentation, including:
- API structure
- Request/response examples
- Security details
- Database schema

