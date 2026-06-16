# Blueprint: Cape Cod Dial (Anemometer Weather Webapp)

## Project Overview
Cape Cod Dial is a modern Angular-based web application that simulates a classic Cape Cod wind dial (anemometer) weather instrument. It retrieves live wind speed data from Firebase Realtime Database and dynamically updates the needle and coil rotation on the gauge interface in real time.

## Style, Design, and Features
- **Visual Dial Interface:** A realistic representation of an anemometer dial using custom CSS styling, rotation transforms, and depth shadows.
- **Real-Time Integration:** Gets data from Firebase Realtime Database at path `sensors/wind_speed`.
- **Dynamic CSS Animations:** Custom transitions for needle movement.
- **Responsive Layout:** Flex-centered viewport.
- **Modern Angular Tech Stack:** Angular v20+ and Tailwind CSS.
- **Google Sign-In Authentication:** Restricts application access to authorized Google accounts.
- **Antique Nautical & Brass Design Theme:** Mahogany wood gradient background, brass-bordered panels, and gold glowing indicators (only shown to authorized users).
- **Secret Dynamic Database Whitelist:** Queries database to check presence of the user's email username prefix in `/allowed_users`.
  - **Email Username Prefix:** Only the prefix before the `@` symbol (e.g. `czcollier` from `czcollier@gmail.com`) is checked.
  - **Array-Based Storage:** Allowed prefixes are stored as a standard JSON array (e.g. `["czcollier", "czc"]`) under the `/allowed_users` node.
- **Database Security Rules**: Configured via local `database.rules.json` to allow authenticated users full read access and write permissions strictly on the `/sensors` and `/config` nodes, preventing unauthorised database changes.
- **Unified Authentication & Access Restriction Portal:**
  - **Single Access Card:** Instead of separate "Secure Portal" and "Access Restricted" screens, the app uses a single unified **"Access Restricted"** card for all unauthenticated or unauthorized users.
  - **Context-Aware Description:**
    - If logged out: **"Authentication required. Please sign in to verify your access."**
    - If logged in but unauthorized: **"You do not have access to this app"**
  - **Context-Aware Action Button:**
    - If logged out: Displays a Google-branded **"Sign In with Google"** button.
    - If logged in but unauthorized: Displays a Google-branded **"Switch Google Account"** button.
  - **Visual Aesthetics:**
    - Solid dark background (`#0e1118`) for the main layout.
    - Clean white card with light gray borders (`#d1d5db`), dark gray text, and 24px rounded corners.
    - Official Google SVG logo branding on the interactive buttons.
    - Clean modern typography (Outfit and Inter) loaded from Google Fonts.
    - Interactive elements include unique, descriptive HTML `id` attributes (`logout-btn`, `google-switch-btn`, `google-signin-btn`) for automated testing.
- **Dynamic Browser Tab Customization:**
  - **Aesthetic Favicon:** A circular brass-colored wind dial image with an aged sepia patina and transparent background edges (`favicon.png`), optimized to `64x64` pixels.
  - **Reactive Page Title:** Subscribes to the client authorization state via an Angular signal effect. It dynamically transitions the browser tab title:
    - `"Access Restricted"` (when logged out or unauthorized)
    - `"Cape Cod Dial - Wind Dashboard"` (when logged in and authorized)
- **Engraved Brass Plaque Text Panel (NEW):**
  - **Aesthetics:** Styled as a metallic brass plate with an aged sepia patina, double borders, and four corner mounting screws (rivets).
  - **Engraved Typography:** The labels and values are styled in deep bronze/dark brown colors with an upward white letterpress shadow, simulating an engraved/embossed effect.
  - **Details Display:** Dynamically shows three engraved columns side-by-side: Database Connection Status, Active ZIP Code (retrieved from Firebase `/config/zip_code`), and Data Source (`"Hardware Sensor (Primary)"` or `"Weather API (Fallback)"`).
- **Fallback Weather API Data Sync:**
  - **Option A: Scheduled Cloud Function:** Runs every 1 minute using Firebase Cloud Scheduler. Fetches live wind data from WeatherAPI and writes to database. Requires upgrading the Firebase project to the Blaze plan.
  - **Option B: Local Background Daemon Script:** A Node.js daemon script (`scripts/fallback-daemon.js`) that runs locally or on a server, syncing the database every 60 seconds (or 30 seconds) using a Firebase service account. Works fully for free on the Spark plan.
  - **Clobber Prevention Rules:**
    - Both options read `/config/fallback_mode` (values: `"always"`, `"never"`, `"auto"`).
    - If `"auto"`, checks the time elapsed since the last database update (`sensors/timestamp`). If the last update was more than 5 minutes ago, it assumes the hardware is down and writes the WeatherAPI data as a fallback.

## Plan for Current Change
1. **Fetch Parent Node**: Modify `anemometer.ts` to listen to `/sensors` parent object, update wind speed, and check `source` value.
2. **Add Plaque Layout**: Update `anemometer.html` to add mounting screws and display the connection status and source.
3. **Engraved Styling**: Define plaque styles in `anemometer.css` rather than `app.css` to comply with Angular's style encapsulation. Adjust the `anyComponentStyle` limits in `angular.json` to allow for the premium styles.
4. **Compile & Build**: Run `npm run build` to verify the codebase compiles successfully.
5. **Deploy**: Deploy the optimized production bundle to Firebase Hosting.
