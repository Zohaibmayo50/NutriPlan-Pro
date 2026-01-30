# Phase 3: Branding Onboarding Wizard - Reference

## Overview
Phase 3 implements a comprehensive 6-step onboarding wizard that allows dietitians to configure their business branding defaults. These settings are saved to Firebase and used when generating meal plan PDFs.

## Architecture

### Services Layer

#### Storage Service (`src/services/storageService.js`)
Handles file uploads to Firebase Storage:
- `uploadLogo(file, userId)` - Validates and uploads logos (PNG/JPG/SVG, max 2MB)
- `deleteLogo(logoUrl)` - Removes old logos from storage
- `uploadFile(file, path)` - Generic file upload function

#### Branding Service (`src/services/brandingService.js`)
Manages branding settings in Firestore:
- `saveBrandingSettings(userId, brandingData)` - Initial save to subcollection
- `getBrandingSettings(userId)` - Retrieves branding settings
- `updateBrandingSettings(userId, updates)` - Partial updates
- `getDefaultBrandingSettings()` - Returns default structure

**Firestore Structure:**
```
users/{userId}/branding/settings
```

### Components

#### Wizard Container (`src/components/onboarding/BrandingWizard.jsx`)
Main wizard component that:
- Manages multi-step flow with progress bar
- Handles form data state
- Validates each step before proceeding
- Provides back/next navigation
- Calls `onComplete` callback with final data

#### Step Components (`src/components/onboarding/steps/`)

1. **BusinessIdentityStep.jsx**
   - Business name (required)
   - Tagline (optional)
   - Live preview of header text

2. **LogoUploadStep.jsx**
   - Drag-and-drop file upload
   - File type validation (PNG, JPG, SVG)
   - Size limit (2MB)
   - Uploads to Firebase Storage
   - Shows preview after upload

3. **BrandColorsStep.jsx**
   - Primary color picker with hex input
   - Secondary color picker with hex input
   - Live color preview with buttons

4. **FontSelectionStep.jsx**
   - Curated list of 8 professional fonts
   - Font preview with sample text
   - Shows selected font in action

5. **HeaderFooterStep.jsx**
   - Toggle business name in header
   - Toggle logo in header
   - Logo alignment (left/center/right)
   - Contact information field
   - Disclaimer text area
   - Live preview of header/footer

6. **PreviewStep.jsx**
   - Full-page preview of meal plan
   - Shows all branding applied
   - Sample content with actual fonts/colors

### Page Integration

#### OnboardingPage (`src/pages/onboarding/OnboardingPage.jsx`)
- Defines wizard steps array with validation
- Handles completion:
  1. Saves branding to Firestore via `saveBrandingSettings()`
  2. Marks onboarding complete via `completeOnboarding()`
  3. Navigates to dashboard

## Data Structure

### Form Data State
```javascript
{
  businessName: string,
  tagline: string,
  logoUrl: string,
  logoFile: File | null,  // Only for UI preview, not saved
  primaryColor: string,   // Hex color
  secondaryColor: string, // Hex color
  fontFamily: string,     // Google Font name
  headerSettings: {
    showBusinessName: boolean,
    showLogo: boolean,
    logoAlignment: 'left' | 'center' | 'right'
  },
  footerSettings: {
    showContact: boolean,
    contactInfo: string,
    showDisclaimer: boolean,
    disclaimerText: string
  }
}
```

### Firestore Document
```javascript
{
  businessName: "Smith Nutrition Services",
  tagline: "Personalized Nutrition for Better Health",
  logoUrl: "https://firebasestorage.googleapis.com/...",
  primaryColor: "#22c55e",
  secondaryColor: "#16a34a",
  fontFamily: "Inter",
  headerSettings: {
    showBusinessName: true,
    showLogo: true,
    logoAlignment: "left"
  },
  footerSettings: {
    showContact: true,
    contactInfo: "Email: contact@example.com | Phone: (555) 123-4567",
    showDisclaimer: true,
    disclaimerText: "This meal plan is for informational purposes only..."
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Flow

### First-Time Login
1. User signs in with Google or Email/Password
2. `AuthContext` checks `onboardingComplete` status
3. If `false`, redirects to `/onboarding`
4. User completes 6-step wizard
5. Branding saved to Firestore
6. `onboardingComplete` set to `true`
7. Redirect to `/dashboard`

### Subsequent Logins
- User automatically directed to dashboard
- Can edit branding later from settings (future feature)

## Key Features

### Validation
- Business name is required (Step 1)
- Logo is optional but recommended
- All other fields have sensible defaults
- Next button disabled if validation fails

### File Upload
- Drag-and-drop support
- Visual feedback during upload
- Error handling for invalid files
- Automatic cleanup of old logos

### Live Preview
- Real-time updates as user types
- Color preview on selection
- Font preview with actual typeface
- Full page preview before saving

### User Experience
- Progress bar shows completion
- Clear step titles and descriptions
- Back button for corrections
- Disabled state for validation
- Loading state during upload
- Success/error messages

## Usage for Dietitians

Dietitians will use these settings when:
1. Generating meal plan PDFs (future feature)
2. Printing meal plans
3. Sending plans to clients
4. Exporting to other formats

The branding ensures consistency across all client-facing materials and maintains professional presentation.

## Testing Checklist

- [ ] Complete wizard with all fields
- [ ] Complete wizard with minimal fields
- [ ] Upload different image formats (PNG, JPG, SVG)
- [ ] Test file size validation (>2MB)
- [ ] Test invalid file types
- [ ] Try to proceed without business name
- [ ] Change colors and verify preview
- [ ] Change fonts and verify preview
- [ ] Toggle header/footer options
- [ ] Verify Firestore save
- [ ] Verify redirect to dashboard
- [ ] Test back button navigation
- [ ] Verify logo upload to Storage
- [ ] Check mobile responsiveness

## Future Enhancements

1. **Settings Page**
   - Allow editing branding after onboarding
   - Preview changes before saving
   - Reset to defaults option

2. **Additional Options**
   - Multiple logo sizes
   - Watermark settings
   - Page numbering format
   - Table styling

3. **Templates**
   - Pre-designed branding themes
   - Industry-specific color schemes
   - Quick setup options

4. **PDF Export**
   - Apply branding to generated PDFs
   - Custom page layouts
   - Print optimization

## Troubleshooting

### Logo Won't Upload
- Check file size (<2MB)
- Verify file type (PNG, JPG, SVG only)
- Check Firebase Storage rules
- Verify user authentication

### Branding Not Saving
- Check Firestore security rules
- Verify user ID is correct
- Check browser console for errors
- Ensure all required fields are filled

### Preview Not Updating
- Check React state updates
- Verify formData is passed correctly
- Check for JavaScript errors
- Clear cache and reload

## Related Files

- **Services**: `firebase.js`, `storageService.js`, `brandingService.js`
- **Components**: `BrandingWizard.jsx`, all step components
- **Pages**: `OnboardingPage.jsx`
- **Context**: `AuthContext.jsx` (onboarding status)
- **Rules**: `firestore.rules` (branding subcollection access)
