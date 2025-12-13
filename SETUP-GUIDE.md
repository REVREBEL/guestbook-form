# 🚀 Guestbook CMS Setup Guide

Complete step-by-step guide to get your Guestbook CMS integration up and running.

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ A Webflow site with a CMS collection for Guestbooks
- ✅ Webflow Cloud app environment set up
- ✅ Devlink components generated (GuestbookForm, GuestbookFormButton)
- ✅ Node.js and npm installed

## 🔧 Step 1: Environment Setup

### 1.1 Get Your Webflow CMS API Token

1. Log into your Webflow account
2. Navigate to your site
3. Go to **Site Settings** → **Apps & Integrations** → **API Access**
4. Click **Generate API Token**
5. Give it a name (e.g., "Guestbook App")
6. Select the following permissions:
   - ✅ CMS Items: Read
   - ✅ CMS Items: Write
7. Copy the generated token (⚠️ You won't see it again!)

### 1.2 Add Environment Variables

Create or update your `.env` file in the project root:

```env
# Required: Your Webflow CMS API token
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here

# Optional: Custom API host (usually not needed)
# WEBFLOW_API_HOST=https://api.webflow.com
```

⚠️ **Important:** 
- Never commit your `.env` file to version control
- Keep your API token secret
- Make sure `.env` is in your `.gitignore`

### 1.3 Verify Collection ID

The default collection ID in the code is: `69383a09bbf502930bf620a3`

To verify or change it:
1. Check your Webflow CMS collection
2. Or use the Webflow API to list collections
3. Update the default in `src/components/GuestbookButton.tsx` if needed

## 🛠️ Step 2: Install Dependencies

All required dependencies should already be installed. Verify with:

```bash
npm install
```

Key dependencies:
- `webflow-api` - Official Webflow SDK
- `react` & `react-dom` - For React components
- `@radix-ui/*` - For Dialog/Modal UI
- `astro` - Framework

## 🧪 Step 3: Test Locally

### 3.1 Start Development Server

```bash
npm run dev
```

This will start the Astro dev server, typically at `http://localhost:3000`

### 3.2 Test the Guestbook Page

1. Open your browser to `http://localhost:3000/guestbook`
2. Click the "Sign Guestbook" button
3. Fill out the form with test data:
   - **Name**: Test User
   - **Full Name**: Test User Full
   - **Email**: test@example.com
   - **Location**: Test City
   - **Relationship**: Friend
   - **Message**: This is a test entry
4. Click "Submit Entry"
5. You should see a success message with:
   - Item ID
   - Slug
   - Created timestamp
   - Updated timestamp

### 3.3 Verify in Webflow CMS

1. Go to your Webflow site
2. Open the CMS panel
3. Navigate to the Guestbooks collection
4. You should see your test entry!

## 🎨 Step 4: Customize and Integrate

### 4.1 Add to Homepage

Edit `src/pages/index.astro`:

```astro
---
import { GuestbookButton } from '../components/GuestbookButton';
---

<GuestbookButton 
  client:only="react"
  buttonText="Sign Our Guestbook"
/>
```

### 4.2 Customize Button Text

```astro
<GuestbookButton 
  client:only="react"
  buttonText="Leave a Message"
  collectionId="69383a09bbf502930bf620a3"
/>
```

### 4.3 Add Success/Error Callbacks

```astro
<GuestbookButton 
  client:only="react"
  buttonText="Sign Guestbook"
  onSuccess={(data) => {
    console.log('Entry created:', data);
    // Custom success logic
  }}
  onError={(error) => {
    console.error('Error:', error);
    // Custom error handling
  }}
/>
```

### 4.4 Edit Existing Entry

To allow editing an existing entry, pass the `itemId`:

```astro
<GuestbookButton 
  client:only="react"
  itemId="123abc456def789"
  buttonText="Edit Entry"
/>
```

## 🌍 Step 5: External Embed (Optional)

If you want to embed the guestbook on pages outside your Webflow Cloud app:

### 5.1 Build the Embed Bundle

You'll need to set up a build process for the embed file. Here's a basic Vite config:

**vite.config.embed.js:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'embed/guestbook-embed.tsx'),
      name: 'GuestbookEmbed',
      fileName: 'guestbook-embed',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {}
      }
    }
  }
});
```

Build it:
```bash
npx vite build --config vite.config.embed.js
```

### 5.2 Host the Bundle

Upload `dist/guestbook-embed.iife.js` to:
- Your CDN
- A static hosting service
- Your own server

### 5.3 Use on External Pages

See `embed/example-external-page.html` for a complete example.

Basic usage:

```html
<div id="guestbook-button"></div>
<script src="https://your-cdn.com/guestbook-embed.js"></script>
<script>
  mountGuestbookButton(document.getElementById('guestbook-button'), {
    buttonText: 'Sign Guestbook',
    collectionId: '69383a09bbf502930bf620a3',
    baseUrl: 'https://your-site.webflow.io/app', // Your deployed app URL
    onSuccess: (data) => alert('Thank you!'),
    onError: (error) => alert('Error: ' + error.message)
  });
</script>
```

## 🚢 Step 6: Deploy to Production

### 6.1 Set Production Environment Variables

In your Webflow Cloud deployment settings, add:
- `WEBFLOW_CMS_SITE_API_TOKEN` (same token or a production-specific one)

### 6.2 Deploy

Follow Webflow Cloud deployment instructions:
1. Push your changes to your repository
2. Deploy via Webflow Cloud dashboard
3. Verify environment variables are set

### 6.3 Test in Production

1. Visit your deployed app URL
2. Test the guestbook form
3. Verify entries appear in Webflow CMS

## 🔍 Troubleshooting

### Issue: "Missing WEBFLOW_CMS_SITE_API_TOKEN"

**Solution:**
- Check that the variable is in your `.env` file
- Restart your dev server: `npm run dev`
- For production, verify in deployment settings

### Issue: Form submission does nothing

**Solutions:**
- Check browser console for errors
- Verify form field `name` attributes match expected values
- Check that collection ID is correct
- Ensure API token has write permissions

### Issue: Validation errors

**Common causes:**
- Missing required fields (name, full_name, email)
- Invalid email format
- Collection ID not set

### Issue: CORS errors in external embed

**Solutions:**
- Verify `baseUrl` is set correctly
- Check CORS settings on your Webflow Cloud app
- Ensure the embed bundle includes all dependencies

### Issue: API returns 401 Unauthorized

**Solutions:**
- Token is invalid or expired
- Token doesn't have correct permissions
- Generate a new token with CMS write permissions

### Issue: API returns 404 Not Found

**Solutions:**
- Collection ID is incorrect
- Item ID doesn't exist (for updates)
- Verify IDs in Webflow CMS

## 📊 Monitoring and Maintenance

### View API Logs

Check your Webflow Cloud logs for API errors:
1. Go to your deployment dashboard
2. View application logs
3. Filter for "CMS" or "API" errors

### Test Regularly

Set up a test routine:
1. Weekly: Submit a test entry
2. Verify it appears in CMS
3. Test update functionality with `itemId`

### Update API Token

If your token expires or is compromised:
1. Generate a new token in Webflow
2. Update `.env` and production environment
3. Restart/redeploy app

## 📚 Additional Resources

- [Webflow CMS API Documentation](https://developers.webflow.com/data/reference/collections)
- [Webflow Cloud Documentation](https://developers.webflow.com/webflow-cloud/intro)
- [Devlink Documentation](https://webflow.com/devlink)
- [README-GUESTBOOK.md](./README-GUESTBOOK.md) - Detailed feature documentation

## 🎉 Success Checklist

Before going live, ensure:
- [ ] API token is set and valid
- [ ] Form submits successfully
- [ ] Entries appear in Webflow CMS
- [ ] Validation errors display properly
- [ ] Success messages show correct data
- [ ] Modal opens and closes smoothly
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Production environment variables set
- [ ] External embed (if used) works correctly

## 🆘 Need Help?

If you're stuck:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Webflow Cloud logs
4. Verify all files are in place (see README-GUESTBOOK.md)
5. Ensure all dependencies are installed

---

**Ready to go?** Start with Step 1 and work your way through! 🚀
