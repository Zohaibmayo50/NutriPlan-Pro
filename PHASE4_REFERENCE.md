# Phase 4: Create New Plan - Reference

## Overview
Phase 4 implements a comprehensive plan creation system where dietitians can create diet plans for their clients. Plans include metadata, client information, and raw diet plan text that can be pasted or uploaded.

## Key Features
- ✅ Multi-section form for plan creation
- ✅ Client-specific information (stored per-plan, not in user accounts)
- ✅ Raw text input via paste or file upload (.txt, .docx)
- ✅ Save plans as drafts to Firestore
- ✅ View and edit existing plans
- ✅ Delete plans
- ❌ NO parsing logic (Phase 5)
- ❌ NO PDF export (Phase 6)
- ❌ NO templates (Future)

## Architecture

### Services Layer

#### Plan Service (`src/services/planService.js`)
Manages diet plans in Firestore under `users/{userId}/plans/{planId}`:

**Functions:**
- `createPlan(userId, planData)` - Creates new plan, returns planId
- `getPlan(userId, planId)` - Fetches single plan
- `getUserPlans(userId)` - Fetches all plans for a user (ordered by updatedAt)
- `updatePlan(userId, planId, updates)` - Updates existing plan
- `deletePlan(userId, planId)` - Deletes a plan

**Firestore Structure:**
```javascript
users/{userId}/plans/{planId}
{
  planTitle: string,
  duration: string, // "7", "14", "28", "custom"
  notes: string, // Internal dietitian notes
  client: {
    name: string,
    age: string,
    gender: string, // "male", "female", "other", "prefer-not-to-say"
    goals: string,
    allergies: string,
    targetCalories: string,
    targetProtein: string,
    targetCarbs: string,
    targetFats: string
  },
  rawText: string, // Raw diet plan content
  status: "draft", // Always "draft" in Phase 4
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### File Utilities (`src/utils/fileUtils.js`)
Handles file uploads and text extraction:

**Functions:**
- `extractTextFromFile(file)` - Extracts text from .txt or .docx files
- `validatePlanFile(file)` - Validates file type and size (max 5MB)

**Supported Formats:**
- `.txt` - Full text extraction (implemented)
- `.docx` - Placeholder message (requires mammoth.js library)

### Pages

#### NewPlanPage (`src/pages/plans/NewPlanPage.jsx`)
Create new diet plans with 4 sections:

**Section 1: Plan Metadata**
- Plan Title (required) - e.g., "30-Day Weight Loss Plan"
- Duration (optional) - 7, 14, 28 days, or custom
- Internal Notes (optional) - Dietitian's private notes

**Section 2: Client Information** (Per-Plan Only)
- Client Name (optional)
- Age (optional)
- Gender (optional)
- Goals (optional textarea)
- Allergies/Restrictions (optional textarea)
- Target Macros (optional):
  - Calories
  - Protein (g)
  - Carbs (g)
  - Fats (g)

**Helper Text:**
> "This information applies only to this plan and is not part of your account."

**Section 3: Raw Diet Plan Input**
Two input methods:
1. **File Upload**
   - Drag-and-drop or click to upload
   - Accepts .txt and .docx
   - Max 5MB file size
   - Validates file type
   - Extracts text and populates textarea

2. **Paste Text**
   - Large textarea (15 rows, monospace font)
   - Placeholder with example format
   - No formatting required

**Section 4: Save Actions**
- Cancel button - Returns to dashboard
- Save Draft button - Validates, saves to Firestore, redirects to plan detail

**Validation:**
- Plan Title is required
- All other fields are optional
- Save button disabled if title is empty

**Flow:**
1. User fills form sections
2. Clicks "Save Draft"
3. Plan saved to Firestore with status "draft"
4. Redirects to `/plans/{planId}`

#### PlanDetailPage (`src/pages/plans/PlanDetailPage.jsx`)
View and edit existing plans:

**Modes:**
1. **View Mode** (Default)
   - Displays all plan data read-only
   - Shows creation and update timestamps
   - Edit and Delete buttons in header

2. **Edit Mode**
   - All fields become editable
   - Can upload new file to replace content
   - Save Changes and Cancel buttons
   - Reloads data after save

**Features:**
- Back button to dashboard
- Status badge (Draft)
- Formatted timestamps
- Delete confirmation dialog
- Error handling for load/save/delete
- Loading spinner on initial load

**Layout:**
- Metadata section (title, duration, notes)
- Client information section (name, age, gender, goals, allergies, macros)
- Diet plan content section (raw text display/edit)

### Routes

Updated `src/routes/AppRoutes.jsx`:
- `/plans/new` - Create new plan (NewPlanPage)
- `/plans/:planId` - View/edit plan (PlanDetailPage)

Both routes:
- Require authentication
- Require onboarding completion
- Protected by ProtectedRoute component

## Data Flow

### Creating a Plan
```
User → NewPlanPage
  → Fills form (4 sections)
  → Optionally uploads file
  → Clicks "Save Draft"
  → planService.createPlan()
  → Firestore: users/{uid}/plans/{autoId}
  → Navigate to /plans/{planId}
  → PlanDetailPage loads
```

### Editing a Plan
```
User → PlanDetailPage (view mode)
  → Clicks "Edit Plan"
  → Fields become editable
  → Makes changes
  → Clicks "Save Changes"
  → planService.updatePlan()
  → Firestore updated with timestamps
  → Reload plan data
  → Switch back to view mode
```

### Deleting a Plan
```
User → PlanDetailPage
  → Clicks "Delete"
  → Confirmation dialog
  → Confirms deletion
  → planService.deletePlan()
  → Firestore document deleted
  → Navigate to /dashboard
```

## Important Concepts

### Client Data is Plan-Scoped
⚠️ **Critical:** Client information is stored WITHIN each plan, not as separate user accounts:
- Clients are NOT app users
- No authentication for clients
- Client data is duplicated per plan (intentional)
- Same client in multiple plans = separate data copies
- Dietitian can have multiple plans for same client

### Raw Text Input
- No parsing or structuring in Phase 4
- Stored exactly as entered/uploaded
- Future phases will add parsing and formatting
- Dietitians can paste from any source
- File upload simplifies bulk entry

### Draft Status
- All plans created in Phase 4 are "draft"
- Status field exists for future phases
- Future: "active", "completed", "archived"
- No status changes in Phase 4

## User Experience

### Form Design
- Clear section separation with cards
- Professional dietitian-focused language
- Helper text explains purpose
- Optional fields clearly marked
- Required field has red asterisk

### File Upload
- Visual upload area with icon
- Shows uploading state
- Error messages for invalid files
- Text extracted into textarea for review/edit
- Supports both drag-and-drop and click

### Error Handling
- Validation messages in red banners
- File errors shown near upload area
- Firestore errors caught and displayed
- Loading states prevent double-submission

### Navigation
- Cancel returns to dashboard without saving
- After save, auto-navigate to detail page
- Detail page has back button
- Delete redirects to dashboard

## Testing Checklist

### Create Plan
- [ ] Create plan with only title (minimal)
- [ ] Create plan with all fields filled
- [ ] Upload .txt file and verify text appears
- [ ] Try uploading .docx (should show placeholder)
- [ ] Try uploading invalid file type (should error)
- [ ] Try uploading >5MB file (should error)
- [ ] Paste long text content
- [ ] Verify plan saves to Firestore
- [ ] Verify redirect to detail page works

### View Plan
- [ ] Load existing plan
- [ ] Verify all data displays correctly
- [ ] Check timestamp formatting
- [ ] Verify status badge shows "Draft"

### Edit Plan
- [ ] Click Edit button
- [ ] Modify all fields
- [ ] Upload new file
- [ ] Save changes
- [ ] Verify Firestore updated
- [ ] Verify timestamps updated
- [ ] Cancel edit (should reload original data)

### Delete Plan
- [ ] Click Delete button
- [ ] Verify confirmation dialog
- [ ] Cancel deletion
- [ ] Delete plan
- [ ] Verify removed from Firestore
- [ ] Verify redirect to dashboard

### Edge Cases
- [ ] Try to access non-existent planId
- [ ] Try to access another user's plan (should fail)
- [ ] Network error during save
- [ ] Empty textarea (should save empty string)
- [ ] Very long text content (>10,000 characters)

## Security Notes

### Firestore Rules Required
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/plans/{planId} {
      // Users can only access their own plans
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Access Control
- All plan operations require authentication
- UserId from auth context ensures users can't access others' plans
- No plan sharing in Phase 4 (future feature)

## Future Enhancements (Not in Phase 4)

### Phase 5 - Parsing & Templates
- Parse raw text into structured meals
- Day/meal/food breakdown
- Nutritional calculations
- Meal templates

### Phase 6 - PDF Export
- Generate branded PDFs
- Apply branding from Phase 3
- Include client information
- Professional layout

### Future Features
- Plan status workflow (draft → active → completed)
- Copy/duplicate plans
- Plan templates library
- Client sharing/delivery
- Plan versioning
- Search and filter plans
- Bulk operations

## Troubleshooting

### Plan Not Saving
- Check browser console for Firestore errors
- Verify authentication is active
- Check Firestore rules allow write
- Verify planTitle is not empty

### File Upload Not Working
- Check file size (<5MB)
- Verify file extension (.txt or .docx)
- Check browser console for errors
- DOCX requires mammoth.js library (Phase 4 shows placeholder)

### Plan Not Loading
- Verify planId exists in URL
- Check Firestore for document
- Verify user has permission
- Check browser console for errors

### Delete Not Working
- Verify Firestore rules allow delete
- Check network connection
- Ensure planId is correct

## Related Files

**Services:**
- [src/services/planService.js](src/services/planService.js) - Firestore CRUD
- [src/services/firebase.js](src/services/firebase.js) - Firebase config
- [src/utils/fileUtils.js](src/utils/fileUtils.js) - File handling

**Pages:**
- [src/pages/plans/NewPlanPage.jsx](src/pages/plans/NewPlanPage.jsx) - Create plans
- [src/pages/plans/PlanDetailPage.jsx](src/pages/plans/PlanDetailPage.jsx) - View/edit plans

**Routes:**
- [src/routes/AppRoutes.jsx](src/routes/AppRoutes.jsx) - Route configuration

**Components:**
- [src/components/layout/AppLayout.jsx](src/components/layout/AppLayout.jsx) - Page layout
- [src/components/ui/Button.jsx](src/components/ui/Button.jsx) - Button component

## Dependencies

- React 18.2.0 - UI framework
- React Router 6.21.1 - Navigation
- Firebase 10.7.1 - Backend (Firestore)
- Tailwind CSS 3.4.0 - Styling

**Optional (for DOCX):**
- mammoth.js - DOCX text extraction (not yet implemented)

## Summary

Phase 4 provides a complete plan creation and management system. Dietitians can now:
1. ✅ Create diet plans with metadata and client info
2. ✅ Input plans via paste or file upload
3. ✅ Save plans as drafts to Firestore
4. ✅ View, edit, and delete plans
5. ✅ Organize plans per-user in Firestore

**Next Steps:** Phase 5 will add parsing logic to structure the raw text into meals, and Phase 6 will add PDF export with branding.
