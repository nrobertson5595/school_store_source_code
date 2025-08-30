# Database Setup Options for Vercel Deployment

## Quick Setup Options

### Option 1: Vercel Postgres (Easiest)
1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: "school-store-source-code"
3. Go to the "Storage" tab
4. Click "Create Database" → "Postgres"
5. Follow the setup wizard
6. The DATABASE_URL will be automatically added to your project

### Option 2: Supabase (Free Tier)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection string" not "Connection pooling")
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option 3: Neon (Free Tier)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Format will be like: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Option 4: Use SQLite for Testing
If you just want to test the deployment without a real database:
- Use this as DATABASE_URL: `sqlite:///tmp/app.db`
- Note: This will create a temporary database that resets on each deployment

## For Your Current Terminal

When prompted for DATABASE_URL, enter one of:
- Your PostgreSQL connection string from above
- `sqlite:///tmp/app.db` for testing

## Example Values

For testing (SQLite):
```
sqlite:///tmp/app.db
```

For production (PostgreSQL):
```
postgresql://username:password@host:5432/database_name
```

## Next Steps

1. Select all three environments (Production, Preview, Development) with space
2. Press enter
3. Paste your DATABASE_URL
4. Repeat for SECRET_KEY with any random string like: `your-super-secret-key-here-change-this`