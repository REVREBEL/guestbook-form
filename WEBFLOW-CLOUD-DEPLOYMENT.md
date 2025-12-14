# Webflow Cloud Deployment Guide

## Overview

This application runs on **Webflow Cloud** using **Cloudflare Workers** runtime. There is no localhost development - all work happens in the Webflow Cloud environment.

---

## Understanding Webflow Cloud

### Architecture

```
User Browser
    ↓
Webflow Cloud (your-site.webflow.io)
    ↓
Your App (/guestbook-form)
    ↓
Cloudflare Workers Runtime
    ↓
Webflow CMS API
```

### Key Points

- ✅ Your app runs on Cloudflare's edge network
- ✅ No traditional server or localhost
- ✅ Environment variables stored in Webflow Cloud
- ✅ API routes execute on Cloudflare Workers
- ✅ Automatic SSL/TLS and DDoS protection

---

## URL Structure

### Your App Mount Path

When you deploy an app to Webflow Cloud, it gets a mount path:

```
https://your-site.webflow.io/guestbook-form
```

The `/guestbook-form` part is your **base path** or **mount path**.

### API Endpoints

All API routes are relative to your mount path:

```
https://your-site.webflow.io/guestbook-form/api/guestbook
```

**Breakdown:**
- `https://your-site.webflow.io` - Your Webflow site domain
- `/guestbook-form` - Your app's mount path (base path)
- `/api/guestbook` - Your API route

---

## Base Path Configuration

### Astro Config

The `astro.config.mjs` automatically handles the base path:

```javascript
export default defineConfig({
  // Uses BASE_URL environment variable from Webflow Cloud
  base: import.meta.env.BASE_URL || '',
  
  build: {
    assetsPrefix: import.meta.env.BASE_URL || undefined,
  },
  
  // ... rest of config
});
```

### How It Works

1. **Webflow Cloud sets `BASE_URL`** to your mount path (e.g., `/guestbook-form`)
2. **Astro automatically prefixes** all routes with this base path
3. **Your code uses relative paths** and Astro handles the rest

### In Your Code

Always use relative paths:

```typescript
// ✅ CORRECT - Relative path
fetch('/api/guestbook', { ... })

// ✅ CORRECT - Using baseUrl helper
import { baseUrl } from './lib/base-url';
fetch(`${baseUrl}/api/guestbook`, { ... })

// ❌ WRONG - Hardcoded base path
fetch('/guestbook-form/api/guestbook', { ... })

// ❌ WRONG - Localhost reference
fetch('http://localhost:3000/api/guestbook', { ... })
```

---

## Environment Variables

### Setting Environment Variables

1. **Go to Webflow Dashboard**
2. **Navigate to:** Site Settings → Apps & Integrations
3. **Find your app** in the list
4. **Click "Settings"** or "Environment Variables"
5. **Add variables:**

```bash
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here
```

### Accessing Environment Variables

In API routes (server-side):

```typescript
export const POST: APIRoute = async ({ locals }) => {
  // Cloudflare Workers environment
  const token = locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN 
    || import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
  
  // Use the token...
};
```

### Why Two Checks?

```typescript
locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN  // Cloudflare Workers (production)
import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN        // Astro build-time (fallback)
```

---

## Deployment Workflow

### 1. Make Changes

Edit your code in the Webflow Cloud code editor or sync from a Git repository.

### 2. Webflow Builds Your App

- Runs `npm run build` (or equivalent)
- Compiles Astro code
- Bundles assets
- Deploys to Cloudflare Workers

### 3. App is Live

Your app is immediately available at:
```
https://your-site.webflow.io/guestbook-form
```

### 4. Testing

- **No localhost** - Test directly on the deployed URL
- Use browser DevTools to debug
- Check Network tab for API calls
- View Console for errors

---

## Form Submission in Webflow Cloud

### Webflow Designer Form

```html
<form action="/guestbook-form/api/guestbook" method="POST">
  <!-- OR use relative path -->
  <form action="api/guestbook" method="POST">
  
  <!-- form fields -->
</form>
```

### What Happens

1. **User submits form** in browser
2. **Browser POSTs to** `/guestbook-form/api/guestbook`
3. **Cloudflare Workers receives** the request
4. **Your API route executes** at `src/pages/api/guestbook.ts`
5. **API calls Webflow CMS**
6. **Response returns** to browser

---

## Debugging in Webflow Cloud

### Browser DevTools

1. **Open your deployed app** in browser
2. **Open DevTools** (F12 or Cmd+Opt+I)
3. **Network Tab:**
   - See all requests
   - Check API responses
   - View status codes
4. **Console Tab:**
   - See client-side errors
   - View console.log output (client only)

### Server-Side Logging

In your API routes:

```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('Request received:', request.url);
  
  try {
    // ... your code
  } catch (error) {
    console.error('Error:', error);
    // Error will appear in Cloudflare Workers logs
  }
};
```

### Cloudflare Workers Logs

Webflow Cloud may provide access to Cloudflare Workers logs. Check:
- Webflow Dashboard → App Settings → Logs
- Or use Cloudflare dashboard if you have access

---

## Common Issues

### Issue: Form submits but nothing happens

**Check:**
1. Form `action` attribute is correct
2. Form `method` is `POST`
3. Environment variable `WEBFLOW_CMS_SITE_API_TOKEN` is set
4. Collection ID is correct

**Debug:**
- Open DevTools → Network tab
- Submit form
- Look for the POST request
- Check response status and body

### Issue: 404 Not Found on API route

**Possible causes:**
- Wrong base path in form action
- API route file not deployed
- Typo in URL

**Fix:**
- Use relative path: `action="api/guestbook"`
- Or absolute with base: `action="/guestbook-form/api/guestbook"`

### Issue: 500 Internal Server Error

**Possible causes:**
- Missing or invalid API token
- Wrong collection ID
- Network error to Webflow CMS API

**Debug:**
- Check environment variables are set
- Verify API token has correct permissions
- Check Cloudflare Workers logs

### Issue: CORS errors

**This shouldn't happen** because:
- Form submits to same origin
- No cross-origin requests

If you see CORS errors:
- Make sure form `action` is relative or same-origin
- Don't include `http://` or external domains

---

## Security in Webflow Cloud

### Automatic Protections

✅ **SSL/TLS** - All traffic encrypted  
✅ **DDoS Protection** - Cloudflare's network  
✅ **Edge Security** - Request filtering  
✅ **Environment Isolation** - Secrets stored securely

### Your Responsibilities

🔒 **Protect API Token** - Never expose in client code  
🔒 **Validate Input** - Check form data server-side  
🔒 **Rate Limiting** - Consider adding (Cloudflare can help)  
🔒 **Email Verification** - Verify email addresses before sending

---

## Performance

### Cloudflare Edge Network

- **Fast**: Your app runs on edge servers worldwide
- **Scalable**: Handles high traffic automatically
- **Reliable**: Built-in redundancy and failover

### Optimization Tips

1. **Minimize API calls** - Batch when possible
2. **Cache static assets** - Cloudflare does this automatically
3. **Optimize images** - Use Webflow's image optimization
4. **Lazy load** - Load content as needed

---

## Monitoring

### What to Monitor

- **API response times**
- **Error rates**
- **Form submission success/failure**
- **CMS API quotas**

### Tools

- Browser DevTools (client-side)
- Cloudflare Workers logs (server-side)
- Webflow Dashboard analytics
- Custom logging in your code

---

## Best Practices

### ✅ Do This

- Use relative URLs in forms and links
- Store secrets in environment variables
- Test in the actual deployed environment
- Use browser DevTools for debugging
- Handle errors gracefully
- Validate all user input

### ❌ Don't Do This

- Don't reference localhost
- Don't hardcode API tokens
- Don't assume local file system access
- Don't use Node.js-specific APIs (use Web APIs)
- Don't expose sensitive data in client code

---

## Webflow Cloud vs. Traditional Hosting

| Feature | Webflow Cloud | Traditional Hosting |
|---------|---------------|---------------------|
| **Runtime** | Cloudflare Workers | Node.js / Docker |
| **Development** | In-cloud / Git sync | Local + Deploy |
| **Environment** | Edge network | Single server / VPS |
| **Scaling** | Automatic | Manual / Auto-scaling |
| **SSL** | Automatic | Manual setup |
| **Base Path** | Mount path (e.g., `/guestbook-form`) | Usually root (`/`) |

---

## File Structure in Webflow Cloud

```
/guestbook-form/                    ← Your app mount path
├── /                               ← Home page
├── /guestbook                      ← Guestbook page
├── /api/guestbook                  ← API endpoint
└── /assets/                        ← Static files
```

All routes are automatically prefixed with `/guestbook-form`.

---

## Related Documentation

- [API Documentation](./GUESTBOOK-API-DOCUMENTATION.md)
- [Webflow Form Setup](./WEBFLOW-FORM-SETUP.md)
- [Environment Setup](./SETUP-GUIDE.md)
- [Testing Guide](./TESTING-CHECKLIST.md)

---

## Support

If you encounter issues:

1. **Check this documentation** first
2. **Review browser DevTools** for errors
3. **Check Webflow Cloud logs** if available
4. **Verify environment variables** are set correctly
5. **Test with curl** or Postman to isolate issues
6. **Contact Webflow Support** for platform-specific issues
