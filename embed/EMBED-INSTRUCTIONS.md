# Guestbook Embed Instructions

## Overview

This embed allows you to add the Guestbook button to any external webpage (including Webflow hosted pages). When clicked, it opens a modal with the full guestbook form.

## Files

- `guestbook-embed.tsx` - The React component that renders the button and modal
- `vite.embed.config.ts` - Build configuration for the standalone bundle
- `../public/guestbook-embed.iife.js` - The compiled JavaScript bundle (auto-generated)

## Important: CSS Handling

**DO NOT import CSS in the embed component!**

The Devlink components (`GuestbookFormButton`, `GuestbookModal`, etc.) already include their own CSS through `src/site-components/global.css`. Importing CSS again in the embed causes:
- Style duplication
- Rendering issues
- Form layout problems

The embed component should **only** import React components, not any CSS files.

## Building the Embed

```bash
npm run build:embed
```

This generates `public/guestbook-embed.iife.js` which can be embedded on any page.

## Usage on External Pages

### 1. Add the Script Tag

Add this to your HTML page (before the closing `</body>` tag):

```html
<script src="https://your-domain.com/guestbook-form/guestbook-embed.iife.js"></script>
```

### 2. Add a Container Element

Add a div where you want the button to appear:

```html
<div id="guestbook-button"></div>
```

### 3. Initialize the Component

The script will automatically render into any element with `id="guestbook-button"`.

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Welcome to my page</h1>
  
  <!-- Guestbook button container -->
  <div id="guestbook-button"></div>
  
  <!-- Guestbook embed script -->
  <script src="https://your-domain.com/guestbook-form/guestbook-embed.iife.js"></script>
</body>
</html>
```

## Using on Webflow Pages

### Option 1: Custom Code Embed

1. Add an **Embed** element to your Webflow page
2. Paste this code:

```html
<div id="guestbook-button"></div>
<script src="https://your-domain.com/guestbook-form/guestbook-embed.iife.js"></script>
```

### Option 2: Page Settings

Add to your page's **Before `</body>` tag** custom code:

```html
<div id="guestbook-button"></div>
<script src="https://your-domain.com/guestbook-form/guestbook-embed.iife.js"></script>
```

## Configuration

The embed automatically uses:
- **Collection ID**: From `GUESTBOOK_COLLECTION_ID` environment variable (baked into the build)
- **Base URL**: Determined by the script's location

No additional configuration needed!

## Troubleshooting

### Button doesn't appear
- Check browser console for JavaScript errors
- Verify the script URL is correct and accessible
- Make sure the container div exists: `<div id="guestbook-button"></div>`

### Modal doesn't open or renders incorrectly
- This is usually caused by CSS conflicts
- **Solution**: Make sure NO CSS is imported in `guestbook-embed.tsx`
- The Devlink components include their own styles automatically

### Styles look wrong
- Check if parent page has CSS that conflicts with the modal
- The modal uses Radix UI Dialog with Portal (renders directly into `document.body`)
- Ensure no global CSS is overriding `.Dialog` or `[data-radix-*]` attributes

### Form doesn't submit
- Check browser console for API errors
- Verify your `WEBFLOW_CMS_SITE_API_TOKEN` is set correctly
- Check Network tab for failed API requests to `/api/cms/...`

## Development

When developing the embed:

1. Make changes to `embed/guestbook-embed.tsx`
2. Rebuild: `npm run build:embed`
3. Test by refreshing the page with the embed script
4. Check console for any errors

**Remember**: Never import CSS files in the embed component!

## Security Notes

- The API token stays server-side (never exposed in the bundle)
- The collection ID is baked into the build (public but not sensitive)
- All CMS operations go through your app's API routes
- The embed only renders UI - all data operations are server-side

---

**Key Takeaway**: The embed brings **only JavaScript logic**, not CSS. The Devlink components handle their own styling.
