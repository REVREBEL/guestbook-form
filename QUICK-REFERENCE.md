# 🚀 Guestbook Quick Reference

Fast reference for common tasks and code snippets.

## 📦 Component Imports

```tsx
// Basic button component
import { GuestbookButton } from '../components/GuestbookButton';

// Modal component (if you need more control)
import { GuestbookModal } from '../components/GuestbookModal';

// API functions
import { 
  createGuestbookItem, 
  updateGuestbookItem, 
  saveGuestbookItem 
} from '../lib/guestbook/api-client';

// Utilities
import { 
  slugify, 
  validateGuestbookForm, 
  parseBoolean, 
  formatDate 
} from '../lib/guestbook/utils';

// Types
import type { 
  GuestbookFormData, 
  GuestbookCMSItem, 
  FormStatus 
} from '../lib/guestbook/types';
```

## 🎯 Basic Usage

### In .astro Pages

```astro
---
import { GuestbookButton } from '../components/GuestbookButton';
---

<GuestbookButton client:only="react" />
```

### With Props

```astro
<GuestbookButton 
  client:only="react"
  buttonText="Leave a Message"
  collectionId="69383a09bbf502930bf620a3"
  localeId="optional-locale-id"
  onSuccess={(data) => console.log(data)}
  onError={(error) => console.error(error)}
/>
```

### Edit Mode

```astro
<GuestbookButton 
  client:only="react"
  itemId="existing-item-id"
  buttonText="Edit Entry"
/>
```

## 🔧 API Endpoints

### Create Item
```
POST /api/cms/[collectionId]/create?cmsLocaleId=optional
Body: { isArchived, isDraft, fieldData }
```

### Update Item
```
PATCH /api/cms/[collectionId]/[itemId]?cmsLocaleId=optional
Body: { isArchived, isDraft, fieldData }
```

### Get Item
```
GET /api/cms/[collectionId]/[itemId]
```

## 📝 Field Names Reference

### Form Input Names
```
System/Meta:
- guestbook_name (required)
- slug (auto-generated if empty)
- collectionId (required)
- localeId (optional)
- itemId (optional, triggers update mode)
- archived (boolean)
- draft (boolean)

Custom Fields:
- guestbook_id (number)
- full_name (required)
- email (required)
- profile_image (url)
- guestbook_first_meeting (text)
- guestbook_location (text)
- guestbook_relationship (text)
- date_added (datetime)
- guestbook_edit_code (text)
- active (boolean)
- edit_code (text)
```

### CMS Field Slugs
```
name → CMS "name"
slug → CMS "slug"
guestbook_id → CMS "guestbook-id"
full_name → CMS "first-name"
email → CMS "email-address"
profile_image → CMS "photo"
guestbook_first_meeting → CMS "memory"
guestbook_location → CMS "location"
guestbook_relationship → CMS "tag-1"
date_added → CMS "memory-date"
guestbook_edit_code → CMS "guestbook-edit-code"
active → CMS "active"
edit_code → CMS "edit-code"
```

## 🎨 Custom Form Handling

### Manual Form Submission

```tsx
import { saveGuestbookItem } from '../lib/guestbook/api-client';
import { validateGuestbookForm } from '../lib/guestbook/utils';

async function handleSubmit(formData: GuestbookFormData) {
  // Validate
  const errors = validateGuestbookForm(formData);
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    return;
  }
  
  // Submit
  try {
    const result = await saveGuestbookItem(formData);
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Direct API Calls

```tsx
// Create
const result = await createGuestbookItem({
  guestbook_name: 'John Doe',
  collectionId: '69383a09bbf502930bf620a3',
  full_name: 'John Doe',
  email: 'john@example.com',
  // ... other fields
});

// Update
const updated = await updateGuestbookItem({
  itemId: 'abc123',
  guestbook_name: 'John Doe Updated',
  collectionId: '69383a09bbf502930bf620a3',
  full_name: 'John Doe',
  email: 'john@example.com',
});
```

## 🌍 External Embed

```html
<div id="guestbook"></div>
<script src="https://cdn.example.com/guestbook-embed.js"></script>
<script>
  mountGuestbookButton(document.getElementById('guestbook'), {
    buttonText: 'Sign Guestbook',
    collectionId: '69383a09bbf502930bf620a3',
    baseUrl: 'https://your-app.webflow.io/app',
    onSuccess: (data) => alert('Thanks!'),
    onError: (err) => console.error(err)
  });
</script>
```

## 🔐 Environment Variables

```env
# Required
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here

# Optional
WEBFLOW_API_HOST=https://api.webflow.com
```

## 🛠️ Utility Functions

### Slugify
```tsx
import { slugify } from '../lib/guestbook/utils';

slugify('John Doe'); // 'john-doe'
slugify('Test Entry #1!'); // 'test-entry-1'
```

### Parse Boolean
```tsx
import { parseBoolean } from '../lib/guestbook/utils';

parseBoolean('true'); // true
parseBoolean(1); // true
parseBoolean('false'); // false
parseBoolean(0); // false
```

### Format Date
```tsx
import { formatDate } from '../lib/guestbook/utils';

formatDate(); // Current ISO date
formatDate('2024-01-15'); // '2024-01-15T00:00:00.000Z'
formatDate(new Date()); // ISO string
```

### Validate Form
```tsx
import { validateGuestbookForm } from '../lib/guestbook/utils';

const errors = validateGuestbookForm({
  guestbook_name: '',
  full_name: '',
  email: 'invalid',
  collectionId: '123'
});

// Returns: [
//   { field: 'guestbook_name', message: 'Name is required' },
//   { field: 'full_name', message: 'Full name is required' },
//   { field: 'email', message: 'Email is not valid' }
// ]
```

## 📊 Response Types

### Success Response
```typescript
{
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string | null;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    name: string;
    slug: string;
    'first-name'?: string;
    'email-address'?: string;
    // ... other fields
  }
}
```

### Error Response
```typescript
{
  error: string;
  details?: string;
}
```

## 🎯 Common Patterns

### Show Success Message
```tsx
const [status, setStatus] = useState<FormStatus>({ type: 'idle' });

// After successful submission
setStatus({
  type: 'success',
  message: 'Entry created!',
  data: result
});
```

### Display Errors
```tsx
const errors = validateGuestbookForm(data);
if (errors.length > 0) {
  setStatus({
    type: 'error',
    message: 'Please fix errors:',
    errors
  });
}
```

### Reset Form After Success
```tsx
onSuccess={(data) => {
  console.log('Created:', data);
  setTimeout(() => {
    setIsModalOpen(false);
    setStatus({ type: 'idle' });
  }, 2000);
}}
```

## 🐛 Debug Commands

```bash
# View environment variables
npm run astro -- info

# Check TypeScript
npm run astro check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Quick Links

- [Full Documentation](./README-GUESTBOOK.md)
- [Setup Guide](./SETUP-GUIDE.md)
- [External Embed Example](./embed/example-external-page.html)
- [Webflow CMS API Docs](https://developers.webflow.com/data/reference/collections)

---

**Need more details?** Check the full documentation files! 📚
