# Guest User Access Fix

## Problem
The save health log button wasn't working for guest users (unauthenticated users) because the app was designed to only work with authenticated users. The issue was in the database Row Level Security (RLS) policies that only allowed authenticated users to create health logs.

## Solution
The database RLS policies need to be updated to allow both authenticated users and guest users (null user_id) to access health logs and hypotheses.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix_guest_access.sql` into the SQL editor
4. Click "Run" to execute the script

### Option 2: Using Supabase CLI

If you have access to the Supabase CLI and can resolve the migration issues:

1. Run the migration: `npx supabase db push`
2. The migration `20250720000000_fix-guest-user-access.sql` will apply the necessary changes

## What the Fix Does

The SQL script:

1. **Drops existing restrictive policies** that only allowed authenticated users
2. **Creates new inclusive policies** that allow both:
   - Authenticated users (`auth.uid() = user_id`)
   - Guest users (`user_id IS NULL`)
3. **Ensures user_id columns allow NULL values** for guest users

## Verification

After applying the fix:

1. Open the app in an incognito/private browser window
2. Navigate to the dashboard (should work without authentication)
3. Try to save a health log - it should work successfully
4. The log should be saved with `user_id = NULL` in the database

## Technical Details

- **Frontend**: The app already supports guest users through the `useHealthData` hook and `AuthContext`
- **Database**: The issue was in RLS policies that were too restrictive
- **Guest Mode**: Guest users are identified by `user_id = NULL` in the database

## Files Modified

- `fix_guest_access.sql` - SQL script to fix the database policies
- `supabase/migrations/20250720000000_fix-guest-user-access.sql` - Migration file (if using CLI)
- `GUEST_USER_FIX.md` - This documentation file 