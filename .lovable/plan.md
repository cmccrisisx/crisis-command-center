

# Fix Authentication — Redirect After Login

## Problem
The Auth page has no redirect after successful sign-in. The `onAuthStateChange` listener in `AuthProvider` updates state correctly (network logs confirm logins succeed with 200), but the Auth page never navigates away from `/auth`. The user stays stuck on the login screen.

## Fix

### 1. Auth.tsx — Add redirect when user is authenticated
- Import `useAuth` and `useNavigate`
- If `user` is already set (session exists), redirect to `/` immediately
- This handles both: returning logged-in users hitting `/auth`, and the state update after successful sign-in

### 2. Add success message for sign-up
- After sign-up, show a success message (since auto-confirm is on, the `onAuthStateChange` will fire and redirect automatically)

### 3. Verify all test accounts work
- After implementing, test each account via the edge function or browser to confirm login + redirect works

## Files Changed
- `src/pages/Auth.tsx` — add `useAuth` + `useNavigate`, redirect when `user` is truthy

