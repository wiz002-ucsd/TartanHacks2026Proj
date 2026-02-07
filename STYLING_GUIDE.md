# Styling Guide

This guide shows you how to customize the look and feel of the Academic Assistant app.

## Quick Reference: Where to Edit Styles

### Navigation Bar
**File:** [frontend/src/App.tsx](frontend/src/App.tsx)
- **Lines 13-100**: Navigation bar
  - Line 15: `backgroundColor: '#343a40'` - Nav background
  - Line 36: `fontSize: '24px'` - Title size
  - Line 49: `backgroundColor: '#007bff'` - Active button color

### Home Page
**File:** [frontend/src/components/Home.tsx](frontend/src/components/Home.tsx)
- **Lines 95-121**: Header section
- **Lines 147-175**: Empty state
- **Lines 180-270**: Course cards
  - Line 189: Card background and border
  - Line 203: Course code badge colors
  - Line 252: Deadline badge colors (uses urgency function)

### Upload Page
**File:** [frontend/src/components/SyllabusUpload.tsx](frontend/src/components/SyllabusUpload.tsx)
- **Lines 107-126**: Toggle buttons
- **Lines 194-198**: Submit button
- **Lines 203-221**: Error display

### Summary Display
**File:** [frontend/src/components/SyllabusSummary.tsx](frontend/src/components/SyllabusSummary.tsx)
- **Lines 47-63**: Success banner
- **Lines 66-96**: Course info card
- **Lines 99-195**: Grading bars
- **Lines 203-244**: Events table
- **Lines 248-290**: Policies section

---

## Common Style Changes

### 1. Change Primary Color (Blue → Purple)

**Option A: Quick Find & Replace**
1. Open all component files
2. Find: `#007bff`
3. Replace with: `#6f42c1` (purple)

**Option B: Use Theme File**
1. Open [frontend/src/theme.ts](frontend/src/theme.ts)
2. Change line 7:
```typescript
primary: '#6f42c1',  // Changed to purple
```

### 2. Change Fonts

#### Using Theme File:
Edit [frontend/src/theme.ts](frontend/src/theme.ts):
```typescript
fontFamily: {
  primary: '"Inter", "Helvetica Neue", Arial, sans-serif',
  monospace: 'Consolas, Monaco, monospace',
},
```

Then add to [frontend/index.html](frontend/index.html) in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
```

#### Apply globally in index.html:
```html
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>
```

### 3. Change Card Hover Effects

In [Home.tsx](frontend/src/components/Home.tsx), lines 197-210:
```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-8px)';  // Increase lift
  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';  // Bigger shadow
}}
```

### 4. Change Urgency Colors

In [Home.tsx](frontend/src/components/Home.tsx), lines 72-78:
```typescript
const getUrgencyColor = (dueDate: string) => {
  const date = new Date(dueDate);
  const today = new Date();
  const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 1) return '#ff0000';  // Bright red
  if (daysUntil <= 3) return '#ff9900';  // Orange
  if (daysUntil <= 7) return '#3399ff';  // Sky blue
  return '#00cc66';  // Mint green
};
```

### 5. Change Button Styles

#### Navigation buttons (App.tsx):
```typescript
style={{
  padding: '10px 24px',               // Bigger padding
  backgroundColor: '#6f42c1',         // Purple
  borderRadius: '20px',               // Pill shape
  fontWeight: '600',                  // Semi-bold
  textTransform: 'uppercase',         // ALL CAPS
  letterSpacing: '0.5px',            // Spaced letters
}}
```

#### Submit button (SyllabusUpload.tsx):
```typescript
style={{
  padding: '14px 32px',               // Larger
  backgroundColor: '#6f42c1',         // Purple
  borderRadius: '12px',               // Rounded corners
  fontSize: '18px',                   // Bigger text
  boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)',  // Purple glow
}}
```

---

## Using the Theme File

### Step 1: Import the theme
At the top of any component:
```typescript
import { theme } from '../theme';
```

### Step 2: Use theme values
Instead of hardcoded colors:
```typescript
// Before:
style={{ backgroundColor: '#007bff' }}

// After:
style={{ backgroundColor: theme.colors.primary }}
```

### Example: Update Home.tsx to use theme

```typescript
import { theme } from '../theme';

// Then in the component:
<button
  style={{
    backgroundColor: theme.colors.primary,
    color: 'white',
    fontSize: theme.typography.fontSize.base,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  }}
>
  Add New Course
</button>
```

---

## Color Schemes

### Current Colors:
- **Primary**: `#007bff` (Blue)
- **Success**: `#28a745` (Green)
- **Danger**: `#dc3545` (Red)
- **Warning**: `#ffc107` (Yellow)
- **Dark**: `#343a40` (Charcoal)
- **Light**: `#f8f9fa` (Off-white)

### Alternative Palettes:

#### Purple Theme:
```typescript
primary: '#6f42c1',    // Purple
success: '#10b981',    // Emerald
danger: '#ef4444',     // Red
warning: '#f59e0b',    // Amber
dark: '#1f2937',       // Slate
```

#### Green Theme:
```typescript
primary: '#10b981',    // Emerald
success: '#059669',    // Green
danger: '#dc2626',     // Red
warning: '#f59e0b',    // Amber
dark: '#064e3b',       // Forest
```

#### Dark Mode:
```typescript
primary: '#60a5fa',    // Light blue
dark: '#111827',       // Almost black
light: '#1f2937',      // Dark gray
text: {
  primary: '#f9fafb',  // Almost white
  secondary: '#d1d5db', // Light gray
}
```

---

## Advanced: Create a CSS File

If you prefer traditional CSS over inline styles:

### 1. Create [frontend/src/styles.css](frontend/src/styles.css):
```css
:root {
  --primary: #007bff;
  --success: #28a745;
  --danger: #dc3545;
  --dark: #343a40;
  --light: #f8f9fa;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--light);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

### 2. Import in [frontend/src/main.tsx](frontend/src/main.tsx):
```typescript
import './styles.css';
```

### 3. Use classes instead of inline styles:
```typescript
<button className="btn-primary">
  Add New Course
</button>

<div className="card">
  {/* Course content */}
</div>
```

---

## Typography

### Google Fonts Integration

1. Add to [frontend/index.html](frontend/index.html) in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

2. Update theme or inline styles:
```typescript
fontFamily: 'Inter, sans-serif',        // For UI text
fontFamily: 'JetBrains Mono, monospace', // For code/data
```

### Font Size Scale:
- **xs**: 12px - Small labels
- **sm**: 14px - Secondary text
- **base**: 16px - Body text
- **lg**: 18px - Emphasized text
- **xl**: 24px - Headings
- **xxl**: 32px - Page titles

---

## Quick Wins

### 1. Soften Corners (More Modern)
Find: `borderRadius: '4px'`
Replace: `borderRadius: '12px'`

### 2. Add Shadows (More Depth)
Add to cards:
```typescript
boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
```

### 3. Increase Spacing (More Breathing Room)
Find: `padding: '20px'`
Replace: `padding: '30px'`

### 4. Bolder Text (More Impact)
Find: `fontWeight: 'bold'`
Replace: `fontWeight: '700'`

---

## Next Steps

1. **Edit [theme.ts](frontend/src/theme.ts)** to change colors globally
2. **Test changes** - Components will update automatically
3. **Consider CSS-in-JS libraries** like styled-components or emotion for more features
4. **Add Tailwind CSS** for utility-first styling (requires setup)

Happy styling! 🎨
