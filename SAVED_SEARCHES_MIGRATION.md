# Saved Searches Migration

## Overview
Saved searches have been migrated from browser localStorage to the database, enabling cross-device access for logged-in users.

## What Changed

### Backend Changes
1. **Database Schema** (`apps/api/prisma/schema.prisma`)
   - Added new `SavedSearch` model with fields: `id`, `name`, `query`, `userId`, `createdAt`, `updatedAt`
   - Added relation to `User` model with cascade delete

2. **API Endpoints** (New files)
   - `apps/api/src/controllers/savedSearchController.ts` - CRUD operations for saved searches
   - `apps/api/src/routes/savedSearchRoutes.ts` - Route definitions
   - Endpoints:
     - `GET /saved-searches` - Get all saved searches for the logged-in user
     - `POST /saved-searches` - Create a new saved search
     - `POST /saved-searches/bulk` - Bulk create (used for migration)
     - `DELETE /saved-searches/:id` - Delete a saved search

3. **API Server** (`apps/api/src/index.ts`)
   - Registered `/saved-searches` routes

### Frontend Changes
1. **SearchModal Component** (`apps/client/src/components/SearchModal.tsx`)
   - Replaced localStorage operations with API calls
   - Added automatic migration logic that runs on first load:
     - Checks if user has saved searches in localStorage
     - If found and no searches exist in the database, bulk uploads them
     - Clears localStorage after successful migration
   - Updated `handleSaveSearch` to use `POST /saved-searches`
   - Updated `handleDeleteSearch` to use `DELETE /saved-searches/:id`

## Automatic Migration
When a user opens the search modal for the first time after this update:
1. The app fetches saved searches from the API
2. If the API returns no searches, it checks localStorage
3. If localStorage has saved searches, they are bulk uploaded to the API
4. After successful upload, localStorage is cleared
5. The user now sees their migrated searches

This migration happens automatically and transparently - users don't need to do anything.

## Benefits
- ✅ **Cross-device sync**: Saved searches are now accessible from any device
- ✅ **Account-based**: Searches are tied to user accounts, not browsers
- ✅ **Persistent**: Won't be lost if browser data is cleared
- ✅ **Automatic migration**: Existing localStorage data is automatically migrated

## Database Migration
Two database migrations were created and applied:
1. **`20251223054708_add_saved_searches`** - Creates the `SavedSearch` table with proper indexes and foreign keys
2. **`20251223055758_add_page_labels_icons`** - Adds the `pageLabels` and `pageIcons` columns to the `Binder` table (these were in the schema but missing from migrations)

## Testing
To test the migration:
1. Start the development environment: `docker-compose -f docker-compose.dev.yml up`
2. The migrations will be applied automatically on startup
3. Navigate to `http://localhost:5173` in your browser
4. Log in or create an account
5. Open the search modal (search for cards)
6. Your existing saved searches should appear (if you had any in localStorage)
7. Create, use, and delete saved searches
8. Log in from a different browser/device - your searches should sync

## Rollback
If needed, the migrations can be rolled back, but saved searches in the database would be lost. Users would revert to localStorage-based searches.
