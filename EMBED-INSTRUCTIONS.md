# Guestbook Embed Instructions

## How to Use the Script Embed

The guestbook can now be embedded on **any Webflow page** using a custom code embed.

All configuration (Collection ID, Base URL) is automatically read from your `.env` file at build time!

### Files Generated:
- `/guestbook-embed.iife.js` - The JavaScript bundle
- `/guestbook-embed.css` - The styles

---

## Step 1: Add to Your Webflow Page

In your Webflow page, add a **Custom Code Embed** with this HTML:

```html
<!-- Container for the button -->
<div id="guestbook-button-container"></div>

<!-- Load the styles -->
<link rel="stylesheet" href="https://patricia-lanning.webflow.io/guestbook-form/guestbook-embed.css">

<!-- Load the script -->
<script src="https://patricia-lanning.webflow.io/guestbook-form/guestbook-embed.iife.js"></script>

<!-- Initialize the button -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('guestbook-button-container');
    
    // Mount with default config from .env
    window.GuestbookEmbed.mountGuestbookButton(container);
  });
</script>
```

That's it! No need to specify `collectionId` or `baseUrl` - they're baked into the bundle from your `.env` file.

---

## Step 2: Replace the URL

Make sure to replace:
- `https://patricia-lanning.webflow.io/guestbook-form` with your actual deployed app URL

---

## Optional: Custom Options

If you want to override defaults or add callbacks:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.GuestbookEmbed.mountGuestbookButton(
      document.getElementById('guestbook-button-container'),
      {
        buttonText: 'Sign Our Guestbook',  // Custom button text
        onSuccess: function(data) {
          console.log('Entry created:', data);
          // Custom success handling
        },
        onError: function(error) {
          console.error('Error:', error);
          // Custom error handling
        }
      }
    );
  });
</script>
```

### Available Options:

```javascript
{
  buttonText: 'Sign Our Guestbook',      // Button label (optional)
  collectionId: 'override-id',           // Override env var (optional)
  localeId: 'optional-locale-id',        // Optional locale
  itemId: 'optional-item-id',            // Optional (for editing)
  baseUrl: 'https://override-url',       // Override env var (optional)
  onSuccess: function(data) { },         // Success callback (optional)
  onError: function(error) { }           // Error callback (optional)
}
```

---

## Environment Variables Used

The bundle reads these from your `.env` file at **build time**:

- `GUESTBOOK_COLLECTION_ID` - Your CMS collection ID
- `BASE_URL` - Your app's base path (automatically set by Astro)

These are baked into the bundle, so you don't need to pass them when embedding.

---

## Rebuilding the Bundle

After making changes to:
- The embed code (`embed/guestbook-embed.tsx`)
- Environment variables (`.env`)
- Components or styles

Rebuild the bundle with:

```bash
npm run build:embed
```

Then redeploy your app to Webflow Cloud to update the files.

---

## Debugging

To check what values are baked into your bundle, open the browser console after loading the script:

```javascript
console.log(window.GuestbookEmbed.DEFAULT_COLLECTION_ID);
console.log(window.GuestbookEmbed.DEFAULT_BASE_URL);
```

---

## Testing Locally

To test the embed locally before deploying:

1. Build the embed: `npm run build:embed`
2. Run the dev server: `npm run dev`
3. The files will be at:
   - `http://localhost:4321/guestbook-embed.iife.js`
   - `http://localhost:4321/guestbook-embed.css`

Update the URLs in your test HTML to point to localhost.

---

## Full Example with Everything

```html
<!-- Container -->
<div id="guestbook-button-container"></div>

<!-- Styles -->
<link rel="stylesheet" href="https://patricia-lanning.webflow.io/guestbook-form/guestbook-embed.css">

<!-- Script -->
<script src="https://patricia-lanning.webflow.io/guestbook-form/guestbook-embed.iife.js"></script>

<!-- Initialize -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.GuestbookEmbed.mountGuestbookButton(
      document.getElementById('guestbook-button-container'),
      {
        buttonText: '✍️ Sign Our Guestbook',
        onSuccess: function(data) {
          alert('Thank you for signing our guestbook!');
        }
      }
    );
  });
</script>
```
