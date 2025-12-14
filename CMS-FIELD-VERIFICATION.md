# CMS Field Verification for Guestbook Collection

Collection ID: `69383a09bbf502930bf620a3`

## ✅ Verified Field Mappings

| Form Field | CMS Slug | CMS Type | Required | Status |
|------------|----------|----------|----------|--------|
| `full_name` | `name` | PlainText | ✅ YES | ✅ CORRECT |
| `full_name` | `first-name` | PlainText | ❌ No | ✅ CORRECT |
| (auto-generated) | `slug` | PlainText | ✅ YES | ✅ CORRECT |
| (auto-generated) | `edit-code` | PlainText | ❌ No | ✅ CORRECT |
| (auto-generated) | `active` | Switch | ❌ No | ✅ CORRECT |
| `email` | `email-address` | Email | ❌ No | ✅ CORRECT |
| `guestbook_location` | `location` | PlainText | ❌ No | ✅ CORRECT |
| `guestbook_first_meeting` | `memory` | PlainText | ❌ No | ✅ CORRECT |
| `guestbook_relationship` | `tag-1` | PlainText | ❌ No | ✅ CORRECT |
| `date_added` | `memory-date` | DateTime | ❌ No | ✅ CORRECT |
| `profile_image` | `photo` | Image | ❌ No | ✅ CORRECT |
| `guestbook_id` | `guestbook-id` | Number | ❌ No | ✅ CORRECT |
| `guestbook_edit_code` | `guestbook-edit-code` | PlainText | ❌ No | ✅ CORRECT (legacy) |

## 🔍 CMS Field Details

### Required Fields (MUST be provided)
1. **`name`** (slug: `name`)
   - Type: PlainText
   - Max Length: 256
   - **Populated from**: `full_name` form field

2. **`slug`** (slug: `slug`)
   - Type: PlainText
   - Max Length: 256
   - Pattern: Must be alphanumerical, no spaces or special characters
   - **Generated**: Random 10-digit alphanumeric code (lowercase + numbers)

### Custom Fields (Optional)

#### Text Fields
- **`first-name`**: Duplicate of full name (for display purposes)
- **`email-address`**: User's email (Email type with validation)
- **`edit-code`**: 6-character code for editing (auto-generated)
- **`location`**: User's location
- **`memory`**: How they met/first meeting story
- **`tag-1`**: Relationship type (Friend, Family, etc.)
- **`guestbook-edit-code`**: Legacy edit code field

#### Special Fields
- **`active`**: Switch (boolean) - Set to `true` on creation
- **`photo`**: Image field for profile picture
- **`memory-date`**: DateTime for when the memory occurred
- **`guestbook-id`**: Numeric ID (integer, no negatives)

## 📝 API Payload Example

Based on the verified fields:

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
    "memory-date": "2024-01-15T00:00:00.000Z",
    "photo": {
      "fileId": "",
      "url": "https://example.com/photo.jpg",
      "alt": "John Doe"
    },
    "guestbook-id": 1
  }
}
```

## ⚠️ Important Validations

1. **`slug`**: Must be alphanumeric only (no spaces or special chars)
   - Our generator uses: `[a-z0-9]{10}` ✅

2. **`name`**: Max 256 characters
   - Need to add validation for this

3. **`guestbook-id`**: Integer only, no negatives
   - Our code handles this correctly ✅

4. **`email-address`**: Must be valid email format
   - We have validation for this ✅

## 🚀 Next Steps

1. ✅ All field mappings are correct
2. ⚠️ Need to test actual API call to verify payload structure
3. ⚠️ Add max length validation for `name` field (256 chars)
4. ✅ Auto-generation logic is correct

---

**Last Verified**: ${new Date().toISOString()}
