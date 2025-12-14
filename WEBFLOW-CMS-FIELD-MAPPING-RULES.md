# Webflow CMS Field Mapping Rules

**CRITICAL: These rules apply to ALL forms that interact with Webflow CMS collections.**

## Core Mapping Rules

### 1. Name Field (Required by Webflow)
- **Form field**: `full_name`
- **CMS field**: `name` (required by Webflow for all CMS items)
- **Behavior**: The `full_name` value populates BOTH:
  - `name` (required CMS field)
  - `first-name` (custom field)

### 2. Slug Field (Required by Webflow)
- **Form field**: `slug` (auto-generated, not user input)
- **CMS field**: `slug` (required by Webflow for all CMS items)
- **Generation**: Random 10-digit alphanumeric code
- **Format**: `[a-z0-9]{10}` (lowercase letters and numbers only)
- **Purpose**: Used with email and edit-code for edit authentication

### 3. Edit Code Field
- **Form field**: `edit_code`
- **CMS field**: `edit-code`
- **Generation**: Random 6-character alphanumeric code (case-insensitive)
- **Format**: `[A-Za-z0-9]{6}`
- **Purpose**: Sent to user via email; required along with email and slug to edit record later

### 4. Active Field
- **Form field**: `active`
- **CMS field**: `active`
- **Default value**: `true` (set automatically on record creation)
- **Type**: Boolean

### 5. Standard Field Name Conversion
- **Rule**: Underscores in form field names → Hyphens in CMS field slugs
- **Examples**:
  - `full_name` → `first-name` (custom field, NOT the name field)
  - `email` → `email-address`
  - `guestbook_location` → `location`
  - `guestbook_first_meeting` → `memory`
  - `guestbook_relationship` → `tag-1`

## Edit Record Flow

To edit a record later, the user must provide THREE pieces of information:
1. **Email** (their email address)
2. **Slug** (the 10-digit code from the confirmation email)
3. **Edit Code** (the 6-character code from the confirmation email)

All three must match exactly to unlock editing capability.

## Auto-Generated Fields Summary

When creating a new CMS item, these fields are ALWAYS auto-generated:
- `slug`: 10-digit random alphanumeric code
- `edit-code`: 6-character random alphanumeric code  
- `active`: Set to `true`
- `name`: Populated from `full_name` input

## Email Confirmation

After successful record creation, send email to user containing:
- Confirmation of submission
- Their **slug** (10 digits)
- Their **edit-code** (6 characters)
- Instructions: "To edit your entry later, visit [edit URL] and enter your email, slug, and edit code"

---

**IMPORTANT**: Reference this document for EVERY form that creates/updates CMS items. Do not deviate from these rules.
