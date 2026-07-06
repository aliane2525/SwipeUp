# TODO - SwipeUp frontend re-org

## Step 1: Inspect current references (already partly done)
- Identify all logo/logo imports in React components.
- Identify all icon/manifest/favicon references in `frontend/public`.

## Step 2: Create target folder structure
- Ensure `frontend/public/assets` exists.
- Ensure `frontend/src/assets/assets` structure exists:
  - `frontend/src/assets/icons/`

## Step 3: Move assets into required folders
- Move `frontend/logo.png` → `frontend/src/assets/logo.png`.
- Move splash.png → `frontend/src/assets/splash.png`.

## Step 4: Convert icons from .webp to .png
- Convert `icons/icon-*.webp` → `frontend/src/assets/icons/icon-*.png`.

## Step 5: Place PNG icons into `frontend/public/assets`
- Copy (or generate) all `icon-*.png` into `frontend/public/assets/`.

## Step 6: Update public manifest.json
- Update icon `src`, `sizes`, `type` for all icon sizes.

## Step 7: Update public/index.html favicon paths if needed
- Ensure `frontend/public/assets/icon.png` is referenced.

## Step 8: Update React import paths
- Update all imports of `../assets/logo.png` if logo moved.

## Step 9: Update Login UI
- Replace any 🔥 emoji in Login page with logo.png (if present).
- Make logo responsive + centered.

## Step 10: Remove duplicates/unused assets safely
- Remove old/duplicate images only after verifying they’re not referenced.

## Step 11: Run and verify
- Run `npm start` inside `frontend/`.
- Verify no resolve errors for logo assets.
- Verify manifest icons are valid.

## Step 12: Report modified files
- Provide a list of every modified file.

