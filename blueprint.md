# Blueprint: Cape Cod Dial (Anemometer Weather Webapp)

## Project Overview
Cape Cod Dial is a modern Angular-based web application that simulates a classic Cape Cod wind dial (anemometer) weather instrument. It retrieves live wind speed data from Firebase Realtime Database and dynamically updates the needle and coil rotation on the gauge interface in real time.

## Style, Design, and Features
- **Visual Dial Interface:** A realistic representation of an anemometer dial using custom CSS styling, rotation transforms, and depth shadows.
- **Real-Time Integration:** Leverages Firebase Realtime Database (`https://pound-weather-default-rtdb.firebaseio.com/` at path `sensors/wind_speed`) to listen to and display wind speed changes live.
- **Dynamic CSS Animations:** Custom cubic-bezier transitions for needle movement to make it look organic and fluid.
- **Responsive Layout:** Adapts dynamically to screen size via a flex-centered viewport.
- **Modern Angular Tech Stack:** Developed with Angular v20+ and Tailwind CSS.
- **Secure Google Sign-In Authentication:** Restricts application access to authorized Google accounts.
- **Antique Nautical & Brass Design Theme:**
  - **Background:** Rich mahogany wood gradient (`radial-gradient(circle, #2e1710 0%, #150a07 100%)`).
  - **Cards & Badges:** Brass/gold-trimmed containers with deep charcoal-brown glassmorphism (`rgba(45, 30, 24, 0.85)` background, `#ffd54f` border, `#efebb8` parchment-cream text).
  - **Buttons:** Polished brass gold buttons with linear gradients, dark wood text, and soft glowing amber shadows.
  - **Info Panels:** Styled to match antique instruments, replacing modern white/blue details with aged sepia and brass aesthetics.
  - **Soft Access Restrictions:** Softer "Access Restricted" title, direct "Switch Accounts" action, and clear instructions.
  - **Optimized Dial Sizing (FIXED):**
    - Configured `:host` custom element display properties to force `display: block` and `width: 100%`.
    - Added `w-full` to the outer component layout in `anemometer.html` to prevent layout collapse in nested flex contexts, resolving the "flash and shrink" bug.

## Phase 3.2 Plan: Fix Dial Shrinking Regression
Resolving the layout width propagation issues to make sure the weather dial stays at a premium size (`max-w-2xl` / 672px) without shrinking after initialization.

### Step-by-Step Implementation Steps
1. **Update `anemometer.html`:**
   - Add the `w-full` class to the outermost wrapping `div` to ensure it spans the full width of the parent component.
2. **Update `anemometer.css`:**
   - Define a `:host` style block setting `display: block; width: 100%;` to force the Angular custom element wrapper to behave as a block container and propagate width.
3. **Compile and Verify:** Run `npm run build` and check for any warnings/errors.
4. **Deploy and Review:** Deploy to Firebase Hosting and verify that the dial remains large and centered on page load.
