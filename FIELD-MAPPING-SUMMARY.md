# Guestbook CMS Field Mapping - Complete Reference

## 🎯 Critical Auto-Generated Fields

These fields are **automatically generated** when creating a new record:

| Field | Value | Purpose |
|-------|-------|---------|
| `slug` | 10-digit alphanumeric code | URL identifier + edit authentication |
| `edit-code` | 6-character alphanumeric code | Edit authentication (sent via email) |
| `active` | `true` | Record is active by default |

## 📋 Form Field → CMS Field Mapping

### Required Fields

| Form Field | CMS Field | Notes |
|------------|-----------|-------|
| `full_name` | `name` | **Required by Webflow** - becomes the CMS item name |
| `full_name` | `first-name` | **Also mapped here** - custom field duplicate |
| `email` | `email-address` | Required for edit authentication |
| (auto) | `slug` | 10-digit code - required by Webflow |
| (auto) | `edit-code` | 6-char code - for later edits |
| (auto) | `active` | Boolean - set to `true` on creation |

### Optional Custom Fields

| Form Field | CMS Field | Type |
|------------|-----------|------|
| `guestbook_location` | `location` | Plain Text |
| `guestbook_first_meeting` | `memory` | Plain Text |
| `guestbook_relationship` | `tag-1` | Plain Text |
| `profile_image` | `photo` | Image |
| `date_added` | `memory-date` | Date |
| `guestbook_id` | `guestbook-id` | Number |
| `guestbook_edit_code` | `guestbook-edit-code` | Plain Text (legacy) |

## 🔐 Edit Record Authentication

To edit a record later, the user must provide **all three**:

1. **Email** - their email address
2. **Slug** - the 10-digit code (from confirmation email)
3. **Edit Code** - the 6-character code (from confirmation email)

All three must match exactly to grant edit access.

## 📧 Post-Submission Email

After successful submission, send an email containing:

```
✅ Thank you for your guestbook entry!

To edit your entry later, you'll need these codes:

🔑 Your Slug: a1b2c3d4e5
🔐 Your Edit Code: Xy9K2m
📧 Your Email: [their email]

Visit [edit URL] and enter all three to make changes.
```

## 🔄 Create vs. Update Logic

```typescript
// NEW ITEM (no itemId)
{
  slug: generateSlug(),        // Generate new 10-digit code
  edit_code: generateEditCode(), // Generate new 6-char code
  active: true,                 // Set to true
  // ... other fields from form
}

// UPDATE EXISTING (itemId present)
{
  slug: existingSlug,           // Keep existing
  edit_code: existingEditCode,  // Keep existing
  active: existingActive,       // Keep existing
  // ... update other fields from form
}
```

## 📝 Example CMS Payload

```json
{
  "isArchived": false,
  "isDraft": false,
  "fieldData": {
    "name": "John Doe",
    "slug": "a1b2c3d4e5",
    "first-name": "John Doe",
    "email-address": "john@example.com",
    "edit-code": "Xy9K2m",
    "active": true,
    "memory": "We met at the wedding",
    "location": "New York",
    "tag-1": "Friend",
    "memory-date": "2024-01-15T00:00:00.000Z"
  }
}
```

## ⚠️ Important Rules

1. **`full_name` is dual-mapped** - it populates BOTH `name` (required) and `first-name` (custom)
2. **Slug is NOT text-derived** - it's a random 10-digit identifier
3. **Underscores → Hyphens** - Form fields use underscores, CMS uses hyphens
4. **Edit codes are case-sensitive** - Store and compare exactly
5. **Active defaults to true** - Only set on new records

---

**Reference**: See `WEBFLOW-CMS-FIELD-MAPPING-RULES.md` for the complete specification.
