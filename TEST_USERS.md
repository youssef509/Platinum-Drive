# Test Users

## Seeded Users

The database has been seeded with the following test users:

### 1. Admin User (Your Account)
- **Email:** `youssef201.dev@gmail.com`
- **Password:** `005100`
- **Name:** Youssef
- **Role:** admin

### 2. Test User 1
- **Email:** `john.doe@example.com`
- **Password:** `Test1234`
- **Name:** John Doe
- **Role:** user

### 3. Test User 2
- **Email:** `jane.smith@example.com`
- **Password:** `Test1234`
- **Name:** Jane Smith
- **Role:** user

## Testing Authentication

### Sign In (Browser)
Visit: `http://localhost:3000/api/auth/signin`

Or visit your sign-in page: `http://localhost:3000/sign-in`

### Sign In (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youssef201.dev@gmail.com",
    "password": "005100"
  }'
```

### Check Session
```bash
curl http://localhost:3000/api/auth/session
```

### Get User Profile
```bash
curl http://localhost:3000/api/auth/me
```

## Re-seeding

To re-run the seed script (it will skip existing users):
```bash
npm run db:seed
```

To completely reset the database and re-seed:
```bash
npx prisma migrate reset
npm run db:seed
```

## Roles & Permissions

- **admin** - Full access to all resources
- **user** - Standard user permissions
- **guest** - Read-only access

You can manage roles via the User-Role junction table in the database.
