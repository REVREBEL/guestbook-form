# Guestbook CMS Integration

Complete integration between Webflow-generated form components and the Webflow CMS API for creating and updating guestbook entries.

## 🎯 Overview

This implementation provides:
- ✅ Full CMS integration for Guestbook collection
- ✅ Create & Update functionality
- ✅ Form validation with user-friendly error messages
- ✅ Success confirmations with entry details
- ✅ External embed support for non-Cloud pages
- ✅ Uses only Webflow-generated components (no custom rewrites)

## 📁 File Structure

```
src/
├── lib/guestbook/
│   ├── types.ts              # TypeScript types for Guestbook data
│   ├── utils.ts              # Helper functions (slugify, validation, etc.)
│   └── api-client.ts         # CMS API integration logic
├── components/
│   ├── GuestbookButton.tsx   # Button that opens modal (internal use)
│   └── GuestbookModal.tsx    # Modal with form and submission logic
├── pages/
│   ├── guestbook.astro       # Demo page
│   └── api/cms/
│       ├── [collectionId]/
│       │   ├── create.ts     # POST endpoint for creating items
│       │   └── [itemId].ts   # PATCH endpoint for updating items
embed/
└── guestbook-embed.tsx       # External embed entry point
```

## 🔑 Environment Variables

Add these to your `.env` file:

```env
# Required: Your Webflow CMS API token
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here

# Optional: Custom API host for development
WEBFLOW_API_HOST=https://api.webflow.com
```

### How to get your API token:
1. Log into Webflow
2. Go to Site Settings → Apps & Integrations → API Access
3. Generate a new token with CMS read/write permissions
4. Copy the token to your `.env` file

## 📝 Form Fields Mapping

### System/Meta Fields (Top-level)
- `guestbook_name` → CMS `name` field (required)
- `slug` → CMS `slug` (auto-generated from name if empty)
- `Collection ID` → The collection to write to
- `Locale ID` → Optional locale
- `Item ID` → If present, update existing item; else create new
- `Archived` → Boolean
- `Draft` → Boolean

### Custom Fields (CMS fieldData)
- `guestbook_id` → Number
- `full_name` → Plain text (required)
- `email` → Email (required)
- `profile_image` → Image URL
- `guestbook_first_meeting` → Plain text
- `guestbook_location` → Plain text
- `guestbook_relationship` → Plain text
- `date_added` → DateTime (defaults to now if empty)
- `guestbook_edit_code` → Plain text
- `active` → Boolean
- `edit-code` → Plain text

## 🚀 Usage

### Internal Use (Within Webflow Cloud App)

```astro
---
// In any .astro page
import { GuestbookButton } from '../components/GuestbookButton';
---

<GuestbookButton 
  client:only="react"
  buttonText="Sign Guestbook"
  collectionId="69383a09bbf502930bf620a3"
/>
```

### Props for GuestbookButton

```tsx
interface GuestbookButtonProps {
  buttonText?: string;           // Default: "Sign Guestbook"
  collectionId?: string;          // Default: Guestbook collection ID
  localeId?: string;              // Optional locale ID
  itemId?: string;                // If set, will update existing item
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}
```

### External Embed (Outside Webflow Cloud)

For embedding on external pages, you need to:

1. **Build the embed bundle** (you'll need to set up a build process):

```bash
# Example using a bundler like Vite or Webpack
# Bundle embed/guestbook-embed.tsx into a standalone JS file
```

2. **Include on external page**:

```html
<!DOCTYPE html>
<html>
<head>
  <title>External Page</title>
  <!-- Include the bundled embed script -->
  <script src="https://your-cdn.com/guestbook-embed.js"></script>
</head>
<body>
  <!-- Mount point -->
  <div id="guestbook-button"></div>

  <script>
    // Mount the button
    mountGuestbookButton(document.getElementById('guestbook-button'), {
      buttonText: 'Sign Our Guestbook',
      collectionId: '69383a09bbf502930bf620a3',
      
      // IMPORTANT: Set this to your deployed Webflow Cloud app URL
      baseUrl: 'https://your-site.webflow.io/your-app-path',
      
      onSuccess: (data) => {
        console.log('Entry created:', data);
        alert('Thank you for signing our guestbook!');
      },
      onError: (error) => {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
      }
    });
  </script>
</body>
</html>
```

**Important:** For external embeds, you MUST set the `baseUrl` prop to your deployed Webflow Cloud app URL, otherwise API calls will fail.

## 🔄 Create vs Update Logic

The system automatically determines whether to create or update based on the `itemId`:

- **Create**: If `itemId` is empty/undefined → Creates new CMS item
- **Update**: If `itemId` is provided → Updates existing CMS item

Example for updating:

```astro
<GuestbookButton 
  client:only="react"
  itemId="123abc456def789"
  buttonText="Edit Entry"
/>
```

## ✅ Validation

The form validates:
- ✅ Required fields: `guestbook_name`, `collectionId`, `full_name`, `email`
- ✅ Email format validation
- ✅ User-friendly error messages displayed in the modal

## 📦 Example API Payloads

### Create New Item

```json
{
  "isArchived": false,
  "isDraft": false,
  "fieldData": {
    "name": "John Doe",
    "slug": "john-doe",
    "first-name": "John Doe",
    "email-address": "john@example.com",
    "memory": "We met at the wedding",
    "location": "New York",
    "tag-1": "Friend",
    "memory-date": "2024-01-15T00:00:00.000Z",
    "active": true,
    "guestbook-edit-code": "abc123"
  }
}
```

### Update Existing Item

```json
{
  "isArchived": false,
  "isDraft": false,
  "fieldData": {
    "name": "John Doe",
    "slug": "john-doe",
    "first-name": "John Doe Updated",
    "email-address": "john.updated@example.com",
    "memory": "We met at the wedding (updated)",
    "location": "New York",
    "tag-1": "Best Friend",
    "memory-date": "2024-01-15T00:00:00.000Z",
    "active": true
  }
}
```

## 🛠️ API Endpoints

### POST `/api/cms/[collectionId]/create`

Creates a new CMS item.

**Query params:**
- `cmsLocaleId` (optional)

**Request body:** See example payloads above

**Response:** Created item with `id`, `createdOn`, `lastUpdated`, etc.

### PATCH `/api/cms/[collectionId]/[itemId]`

Updates an existing CMS item.

**Query params:**
- `cmsLocaleId` (optional)

**Request body:** See example payloads above

**Response:** Updated item with timestamps

### GET `/api/cms/[collectionId]/[itemId]`

Gets a live CMS item (for reading existing data).

## 🎨 Components Used

All UI components are from the Webflow-generated `/src/site-components/`:

- `GuestbookFormButton` - The button component
- `GuestbookForm` - The form with all fields
- `DevLinkProvider` - Required wrapper for Devlink components

The modal uses shadCN's `Dialog` component which is pre-installed.

## 📚 Success Response Structure

After successful submission, you'll receive:

```typescript
{
  id: string;                    // CMS item ID
  cmsLocaleId?: string;          // Locale if set
  lastPublished?: string | null; // Publish timestamp
  lastUpdated: string;           // Update timestamp
  createdOn: string;             // Creation timestamp
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    name: string;
    slug: string;
    // ... all custom fields
  }
}
```

## 🐛 Troubleshooting

### "Missing WEBFLOW_CMS_SITE_API_TOKEN" error
- Make sure you've set `WEBFLOW_CMS_SITE_API_TOKEN` in your `.env` file
- Restart your dev server after adding environment variables

### Form submission does nothing
- Check browser console for errors
- Verify the form fields have the correct `name` attributes
- Make sure the collection ID is correct

### External embed not working
- Ensure you've set the `baseUrl` prop
- Check CORS settings on your Webflow Cloud app
- Verify the bundled script includes all dependencies

### Validation errors
- Check that required fields are filled: `guestbook_name`, `full_name`, `email`, `collectionId`
- Email must be in valid format

## 🔐 Security Notes

- API token is stored server-side only (never exposed to client)
- All CMS operations go through your API routes
- Form data is validated before submission
- Consider adding rate limiting to prevent abuse

## 🎯 Next Steps

1. **Test the demo page**: Visit `/guestbook` to see it in action
2. **Customize styling**: Adjust the modal and button styles in your components
3. **Add more validation**: Extend `validateGuestbookForm()` in `utils.ts`
4. **Set up external embed**: Build and deploy the embed bundle
5. **Add publish flow**: Optionally add a publish button to make items live

## 📞 Support

For issues or questions about:
- **Webflow CMS API**: Check [Webflow API docs](https://developers.webflow.com/data/reference/collections)
- **Form components**: Verify components exist in `/src/site-components/`
- **Devlink**: See [Devlink documentation](https://webflow.com/devlink)

---

Built with ❤️ for Webflow Cloud
