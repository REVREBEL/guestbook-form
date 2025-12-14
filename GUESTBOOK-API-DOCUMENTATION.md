# Guestbook API Documentation

## Endpoint

```
POST /guestbook-form/api/guestbook
```

**Note:** This application runs on **Webflow Cloud**, not localhost. The base path (`/guestbook-form`) is automatically handled by the Astro configuration based on your app's mount path in Webflow Cloud.

---

## Overview

This endpoint receives form submissions directly from the Webflow Designer form component and submits the data to the Webflow CMS. It handles both **new entry creation** and **entry updates** based on provided credentials.

---

## Field Mapping Rules

### Special Fields (Auto-Generated)

| Form Field | CMS Field | Value | Notes |
|------------|-----------|-------|-------|
| `full_name` | `name` | User input | Required CMS field |
| `full_name` | `first-name` | User input | Custom field (duplicate of name) |
| - | `edit-code` | 6-char code | Auto-generated alphanumeric |
| - | `slug` | 10-char code | Auto-generated alphanumeric |
| - | `active` | `true` | Always set to true |
| - | `date-added` | Current timestamp | ISO 8601 format |

### One-to-One Field Mappings

| Form Field Name | CMS Field Slug | Required | Notes |
|-----------------|----------------|----------|-------|
| `full_name` | `name` | ✅ Yes | Required by CMS |
| `email` | `email-address` | ✅ Yes | Used for edit verification |
| `guestbook_location` | `location` | ❌ No | Optional |
| `guestbook_first_met` | `memory` | ❌ No | Optional |
| `guestbook_relationship` | `tag-1` | ❌ No | Optional |
| `guestbook_message` | `message` | ❌ No | Optional |
| `collection_id` | - | ✅ Yes | Hidden field, not stored in CMS |

---

## Request Format

### Create New Entry

```html
<form action="/guestbook-form/api/guestbook" method="POST">
  <!-- Required Fields -->
  <input type="text" name="full_name" required />
  <input type="email" name="email" required />
  
  <!-- Optional Fields -->
  <input type="text" name="guestbook_location" />
  <input type="text" name="guestbook_first_met" />
  <input type="text" name="guestbook_relationship" />
  <textarea name="guestbook_message"></textarea>
  
  <!-- System Fields (Hidden) -->
  <input type="hidden" name="collection_id" value="69383a09bbf502930bf620a3" />
  
  <button type="submit">Submit</button>
</form>
```

**Important:** The form action can be either:
- **Absolute path:** `/guestbook-form/api/guestbook` (includes base path)
- **Relative path:** `api/guestbook` (base path added automatically)

### Update Existing Entry

To update an entry, users must provide **all three credentials**:

```html
<form action="/guestbook-form/api/guestbook" method="POST">
  <!-- Edit Credentials (ALL THREE REQUIRED) -->
  <input type="email" name="email" required />
  <input type="text" name="edit_slug" required placeholder="10-character slug" />
  <input type="text" name="edit_code" required placeholder="6-character code" />
  
  <!-- Updated Fields -->
  <input type="text" name="full_name" required />
  <input type="text" name="guestbook_location" />
  <!-- ... other fields ... -->
  
  <!-- System Fields -->
  <input type="hidden" name="collection_id" value="69383a09bbf502930bf620a3" />
  
  <button type="submit">Update Entry</button>
</form>
```

---

## Edit Verification System

### How It Works

1. **User submits form** → Entry created in CMS
2. **User receives email** containing:
   - Email address
   - Slug (10-character code)
   - Edit code (6-character code)
3. **To edit later**, user must provide **ALL THREE** values:
   - `email` (matches `email-address` in CMS)
   - `edit_slug` (matches `slug` in CMS)
   - `edit_code` (matches `edit-code` in CMS)

### Security

- All three credentials must match exactly to unlock edit access
- Edit code is never exposed in public listings
- Email is verified server-side
- Failed verification returns `403 Forbidden`

### Verification Logic

```typescript
// Pseudo-code
const isAuthorized = (
  providedEmail === cmsItem.fieldData['email-address'] &&
  providedSlug === cmsItem.fieldData['slug'] &&
  providedEditCode === cmsItem.fieldData['edit-code']
);
```

---

## Response Format

### Success Response (Create)

```json
{
  "success": true,
  "message": "Entry created successfully",
  "data": {
    "id": "67a1b2c3d4e5f6789012345",
    "slug": "aB3xY9kL2m",
    "editCode": "Xz8K2p"
  }
}
```

### Success Response (Update)

```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "id": "67a1b2c3d4e5f6789012345",
    "slug": "aB3xY9kL2m",
    "editCode": "Xz8K2p"
  }
}
```

### Error Response (Missing Fields)

```json
{
  "error": "Missing required fields: full_name and email are required"
}
```

**Status Code:** `400 Bad Request`

### Error Response (Invalid Edit Credentials)

```json
{
  "error": "Invalid edit credentials. Please check your email, slug, and edit code."
}
```

**Status Code:** `403 Forbidden`

### Error Response (Server Error)

```json
{
  "error": "Failed to process submission",
  "details": "Detailed error message"
}
```

**Status Code:** `500 Internal Server Error`

---

## Code Generation

### Slug (10 characters)

```typescript
function generateCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const slug = generateCode(10); // e.g., "aB3xY9kL2m"
```

### Edit Code (6 characters)

```typescript
const editCode = generateCode(6); // e.g., "Xz8K2p"
```

---

## CMS Payload Structure

### Example Payload (Create)

```json
{
  "isArchived": false,
  "isDraft": false,
  "fieldData": {
    "name": "John Doe",
    "slug": "aB3xY9kL2m",
    "first-name": "John Doe",
    "email-address": "john@example.com",
    "edit-code": "Xz8K2p",
    "active": true,
    "date-added": "2024-01-15T14:30:00.000Z",
    "location": "New York, NY",
    "memory": "We met at the wedding",
    "tag-1": "Friend",
    "message": "So glad to be part of this!"
  }
}
```

---

## Email Integration (TODO)

After successful submission, the system should send an email to the user containing their edit credentials.

### Email Template

**Subject:** Your Guestbook Entry Confirmation

**Body:**
```
Hi [Full Name],

Thank you for signing the guestbook! Your entry has been submitted successfully.

To edit your entry in the future, you'll need these credentials:

Email: [user@example.com]
Slug: [aB3xY9kL2m]
Edit Code: [Xz8K2p]

Keep this email safe - you'll need all three values to make changes.

Edit your entry: [Link to edit page]

Best regards,
The Team
```

### Implementation Note

Add email service integration in the TODO section of `src/pages/api/guestbook.ts`:

```typescript
// TODO: Send email with edit credentials
// Recommended services for Cloudflare Workers:
// - Resend (resend.com) - Works great with Workers
// - SendGrid
// - Mailgun
// - MailChannels (Cloudflare-specific)
```

---

## Webflow Designer Setup

### Form Configuration

1. **Form Element:**
   - Set `action="/guestbook-form/api/guestbook"` or `action="api/guestbook"`
   - Set `method="POST"`

2. **Required Input Fields:**
   ```html
   <input name="full_name" type="text" required />
   <input name="email" type="email" required />
   ```

3. **Optional Input Fields:**
   ```html
   <input name="guestbook_location" type="text" />
   <input name="guestbook_first_met" type="text" />
   <input name="guestbook_relationship" type="text" />
   <textarea name="guestbook_message"></textarea>
   ```

4. **Hidden System Fields:**
   ```html
   <input type="hidden" name="collection_id" value="69383a09bbf502930bf620a3" />
   ```

---

## Testing in Webflow Cloud

### Deployed App URL Structure

Your app is deployed at a URL like:
```
https://your-site.webflow.io/guestbook-form
```

The API endpoint is accessible at:
```
https://your-site.webflow.io/guestbook-form/api/guestbook
```

### Testing with Browser DevTools

1. Open your deployed app in browser
2. Open DevTools → Network tab
3. Submit the form
4. Check the POST request to `/guestbook-form/api/guestbook`
5. Verify response status and payload

### Testing with curl (if needed)

```bash
curl -X POST https://your-site.webflow.io/guestbook-form/api/guestbook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "full_name=John Doe" \
  -d "email=john@example.com" \
  -d "guestbook_location=New York" \
  -d "guestbook_first_met=At the wedding" \
  -d "guestbook_relationship=Friend" \
  -d "guestbook_message=Great memories!" \
  -d "collection_id=69383a09bbf502930bf620a3"
```

---

## Environment Setup

### Webflow Cloud Environment Variables

Set these in your Webflow Cloud app settings:

```bash
# Required: Webflow CMS API Token
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here

# Optional: Custom API host (usually not needed in production)
WEBFLOW_API_HOST=https://api.webflow.com
```

### Where to Set Environment Variables

1. Go to your Webflow site settings
2. Navigate to **Apps & Integrations**
3. Find your deployed app
4. Click **Settings** or **Environment Variables**
5. Add `WEBFLOW_CMS_SITE_API_TOKEN` with your token

---

## Cloudflare Workers Runtime

This app runs on **Cloudflare Workers** via Webflow Cloud. Important considerations:

### Request Handling
- Forms submit to the Workers runtime
- The API route is executed on Cloudflare's edge network
- Environment variables are accessed via `locals.runtime.env`

### Code Location
```typescript
// In API routes, access env vars like this:
const token = locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN 
  || import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
```

### No Local Development Server
- There is no `localhost:3000` in Webflow Cloud
- All testing happens in the deployed environment
- Use Webflow's preview/publish workflow

---

## Security Considerations

1. **API Token Protection**
   - Token is stored server-side only (`WEBFLOW_CMS_SITE_API_TOKEN`)
   - Never exposed to client
   - Runs in Cloudflare Workers secure environment

2. **Edit Code Security**
   - 6-character alphanumeric = 62^6 = ~56 billion combinations
   - Stored in CMS, only shared via email
   - Required along with email and slug for verification

3. **Cloudflare Protection**
   - Built-in DDoS protection
   - Edge network security
   - Automatic SSL/TLS

4. **Email Validation**
   - Server validates email format
   - Edit verification requires exact email match

---

## File Locations

**API Route:** `src/pages/api/guestbook.ts`

**Production URL:** `/guestbook-form/api/guestbook` (relative to your app mount path)

**Deployed URL:** `https://your-site.webflow.io/guestbook-form/api/guestbook`

---

## Related Documentation

- [Webflow Form Setup Guide](./WEBFLOW-FORM-SETUP.md)
- [Field Mapping Rules](./WEBFLOW-CMS-FIELD-MAPPING-RULES.md)
- [Testing Checklist](./TESTING-CHECKLIST.md)
- [Architecture Diagram](./ARCHITECTURE-DIAGRAM.md)
