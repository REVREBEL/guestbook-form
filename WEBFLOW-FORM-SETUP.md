# Webflow Form Setup Guide

## Configure Your Form in Webflow Designer

To connect your Webflow form to the guestbook API endpoint, follow these steps:

---

## Step 1: Open Form Settings

1. Open your Webflow project in **Designer**
2. Navigate to the page with your guestbook form
3. Select the **Form Block** element
4. Open the **Element Settings** panel (right sidebar)

---

## Step 2: Configure Form Action & Method

In the Form Settings panel:

### Form Name
```
Guestbook Form
```

### Form Action (Important!)
```
/guestbook-form/api/guestbook
```

Or if using a different base path:
```
/your-base-path/api/guestbook
```

### Form Method
```
POST
```

### Form Settings Summary

| Setting | Value |
|---------|-------|
| **Name** | `Guestbook Form` |
| **Action** | `/guestbook-form/api/guestbook` |
| **Method** | `POST` |

---

## Step 3: Configure Input Fields

Ensure each input field has the correct `name` attribute:

### Required Fields

| Field Label | Input Name | Input Type | Required |
|-------------|------------|------------|----------|
| Your Name | `full_name` | `text` | ✅ Yes |
| Email | `email` | `email` | ✅ Yes |

### Optional Fields

| Field Label | Input Name | Input Type | Required |
|-------------|------------|------------|----------|
| Location | `guestbook_location` | `text` | ❌ No |
| How did you meet? | `guestbook_first_met` | `text` | ❌ No |
| Relationship | `guestbook_relationship` | `text` or `select` | ❌ No |
| Message | `guestbook_message` | `textarea` | ❌ No |

### Hidden Fields (System)

Add a hidden input for the collection ID:

| Field Name | Value | Type |
|------------|-------|------|
| `collection_id` | `69383a09bbf502930bf620a3` | `hidden` |

---

## Step 4: Set Input Name Attributes

For each input field:

1. **Select the input element**
2. **Open Settings Panel** → Input Settings
3. **Set the Name attribute** to match the table above

### Example: Full Name Input

```
Element: Text Input
Settings:
  - Name: full_name
  - Type: text
  - Required: Yes (checked)
  - Placeholder: "Enter your full name..."
```

### Example: Email Input

```
Element: Email Input
Settings:
  - Name: email
  - Type: email
  - Required: Yes (checked)
  - Placeholder: "your@email.com"
```

### Example: Message Textarea

```
Element: Textarea
Settings:
  - Name: guestbook_message
  - Type: textarea
  - Required: No
  - Placeholder: "Share your thoughts..."
```

---

## Step 5: Add Hidden Collection ID Field

You need to add a hidden input for the collection ID:

1. **Add a new Text Input** inside your form
2. **Set the input settings:**
   - Name: `collection_id`
   - Type: `text`
   - Value: `69383a09bbf502930bf620a3`
3. **Hide the input:**
   - Add a class like `w-hidden` or `is-hidden`
   - Or set Display: None in Style panel

### Alternative: Use Webflow's Hidden Input

If Webflow provides a "Hidden Input" element, use that instead with:
- Name: `collection_id`
- Value: `69383a09bbf502930bf620a3`

---

## Step 6: Configure Submit Button

1. **Select the Submit Button**
2. **Set button text:** "Sign the Guestbook"
3. **Button Settings:**
   - Type: `submit`
   - Wait Message: "Submitting..."

---

## Step 7: Configure Success/Error Messages

### Success Message
```
Thank you for signing the guestbook! 
You'll receive an email with instructions to edit your entry.
```

### Error Message
```
Oops! Something went wrong. 
Please try again or contact support if the problem persists.
```

---

## Complete Form Structure

Here's what your form should look like in the Navigator:

```
Form Block [action="/guestbook-form/api/guestbook", method="POST"]
├── Form Wrapper
│   ├── Text Input (name="full_name", required)
│   ├── Email Input (name="email", required)
│   ├── Text Input (name="guestbook_location")
│   ├── Text Input (name="guestbook_first_met")
│   ├── Select/Text Input (name="guestbook_relationship")
│   ├── Textarea (name="guestbook_message")
│   ├── Hidden Input (name="collection_id", value="69383a09bbf502930bf620a3")
│   └── Submit Button
├── Success Message
└── Error Message
```

---

## Step 8: Publish & Test

1. **Save your changes** in Designer
2. **Publish your site**
3. **Test the form:**
   - Fill out all required fields
   - Submit the form
   - Check if success message appears
   - Verify entry appears in Webflow CMS

---

## For Edit Functionality (Optional)

If you want to create a separate "Edit Entry" form:

### Additional Fields Required

| Field Label | Input Name | Type | Required |
|-------------|------------|------|----------|
| Email | `email` | `email` | ✅ Yes |
| Slug | `edit_slug` | `text` | ✅ Yes |
| Edit Code | `edit_code` | `text` | ✅ Yes |

### Form Configuration

Same as above, but users must provide:
1. Their email address
2. The slug from their confirmation email
3. The edit code from their confirmation email

All three must match to unlock edit access.

---

## Troubleshooting

### Form Not Submitting

**Check:**
- Form `action` is set correctly
- Form `method` is set to `POST`
- All required fields have correct `name` attributes
- Hidden `collection_id` field is present

### Getting 400 Error

**Check:**
- `full_name` and `email` fields have values
- `collection_id` is included in form data
- Field names match exactly (case-sensitive)

### Getting 500 Error

**Check:**
- `WEBFLOW_CMS_SITE_API_TOKEN` is set in environment variables
- Collection ID is correct
- API token has write permissions

### Success But No Entry in CMS

**Check:**
- Collection ID matches your actual Guestbook collection
- API token has permissions for that collection
- Entry might be in Draft state - check CMS filters

---

## Next Steps

After configuring the form:

1. ✅ **Test submission** with valid data
2. ✅ **Verify CMS entry** is created
3. ✅ **Set up email service** for edit code delivery (see TODO in code)
4. ✅ **Create edit form** (optional)
5. ✅ **Style success/error messages**

---

## Important Notes

⚠️ **Do NOT use custom React components** - This setup uses pure Webflow Designer components with native form submission.

⚠️ **Base Path:** If your app is deployed at a different path (e.g., `/my-app`), update the form action accordingly: `/my-app/api/guestbook`

✅ **Security:** API token is kept server-side only. The form submits to your server, which then communicates with Webflow CMS securely.

---

## Related Documentation

- [API Documentation](./GUESTBOOK-API-DOCUMENTATION.md)
- [Field Mapping Rules](./WEBFLOW-CMS-FIELD-MAPPING-RULES.md)
- [Testing Guide](./TESTING-CHECKLIST.md)
