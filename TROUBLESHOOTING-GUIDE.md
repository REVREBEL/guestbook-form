# Troubleshooting Guide

## Issues You're Experiencing

### ❌ Issue 1: Form Submits as GET Instead of POST (404 Error)

**Symptom:**
```
https://patricia-lanning.webflow.io/guestbook?full_name=Gary+Stringham&...
```

Form submits as GET request with query parameters instead of POST.

**Root Cause:**
The Webflow Devlink component has the form action hardcoded to `/api/guestbook` and may have method set to GET or not properly configured.

**Solutions:**

#### Solution A: Update in Webflow Designer (RECOMMENDED)

1. **Open Webflow Designer**
2. **Navigate to your Guestbook form**
3. **Select the Form Element**
4. **In Form Settings:**
   - Action: `/api/guestbook` or `api/guestbook`
   - Method: `POST` (MUST be POST)
5. **Publish and re-sync Devlink**

#### Solution B: JavaScript Override (Current Fix)

The `GuestbookModal.tsx` now includes JavaScript that overrides the form action after render:

```typescript
form.method = 'post';
form.action = `${baseUrl}/api/guestbook`;
```

This should work, but verify in browser DevTools that the form has:
- `method="post"`
- `action="/guestbook-form/api/guestbook"` (or with your base path)

---

### ❌ Issue 2: Missing Labels in Modal

**Symptom:**
6 labels are missing when form is displayed in modal, but visible on normal page.

**Root Cause:**
CSS from the modal dialog or embedded context is hiding labels with `display: none` or `visibility: hidden`.

**Fix Applied:**

Added CSS override in `GuestbookModal.tsx`:

```css
.guestbook-form-wrapper label {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  margin-bottom: 8px;
}
```

**Additional Check:**

The label has wrong `htmlFor` attribute:
```html
<label for="Phone">Where did you first meet?</label>
```

This should be:
```html
<label for="guestbook_first_met">Where did you first meet?</label>
```

**To Fix Permanently:**
1. Open Webflow Designer
2. Find each label element
3. Update the "For" attribute to match the input's ID
4. Re-publish and sync Devlink

---

### ❌ Issue 3: Completed Fields Turn Blue

**Symptom:**
Input fields turn blue after being filled out. This is not part of the Webflow design.

**Root Cause:**
Browser default `:valid` pseudo-class styling or CSS from another source.

**Fix Applied:**

```css
.guestbook-form-wrapper input:valid,
.guestbook-form-wrapper textarea:valid,
.guestbook-form-wrapper select:valid {
  color: inherit !important;
  border-color: var(--input) !important;
}
```

---

### ❌ Issue 4: Dropdown Selection Bumps Out

**Symptom:**
When selecting a value in the dropdown and moving to the next field, the selection "bumps back out" (resets or loses focus incorrectly).

**Root Cause:**
Z-index or position issues causing the dropdown to lose focus when another field is selected.

**Fix Applied:**

```css
.guestbook-form-wrapper select {
  position: relative !important;
  z-index: 1 !important;
}

.guestbook-form-wrapper select:focus {
  z-index: 10 !important;
}

.guestbook-form-wrapper select option {
  background-color: var(--background) !important;
  color: var(--foreground) !important;
  padding: 8px !important;
}
```

---

## Debugging Steps

### Step 1: Check Form Attributes

Open browser DevTools → Elements tab:

```html
<form 
  id="wf-form-Guestbook-Form"
  method="post"  <!-- MUST be "post" -->
  action="/guestbook-form/api/guestbook"  <!-- Check this matches your base path -->
>
```

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Submit the form
3. Look for POST request to `/guestbook-form/api/guestbook`
4. Check:
   - Request Method: `POST` (not GET)
   - Status: Should be 200 (not 404)
   - Request Payload: Should contain form data

### Step 3: Check Console for Errors

Open DevTools → Console tab and look for:

```javascript
Form configured: {
  id: "wf-form-Guestbook-Form",
  method: "post",
  action: "/guestbook-form/api/guestbook",
  baseUrl: "/guestbook-form"
}
```

### Step 4: Verify API Endpoint

Test the API directly with curl:

```bash
curl -X POST https://patricia-lanning.webflow.io/guestbook-form/api/guestbook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "full_name=Test User" \
  -d "email=test@example.com" \
  -d "collection_id=69383a09bbf502930bf620a3"
```

Expected response:
```json
{
  "success": true,
  "message": "Entry created successfully",
  "data": { ... }
}
```

---

## Common Issues & Solutions

### Issue: Collection ID is Empty

**Symptom:**
```
https://...?collection_id=
```

**Fix:**
Check that the hidden input has the collection ID:

```html
<input type="hidden" name="collection_id" value="69383a09bbf502930bf620a3" />
```

Or verify the `GuestbookModal` is passing the collectionId prop:

```tsx
<GuestbookButton collectionId="69383a09bbf502930bf620a3" />
```

### Issue: Form Doesn't Submit at All

**Possible Causes:**
1. JavaScript error preventing submit handler
2. Form validation preventing submission
3. Missing required fields

**Debug:**
```javascript
// In browser console
const form = document.getElementById('wf-form-Guestbook-Form');
console.log('Form:', form);
console.log('Method:', form.method);
console.log('Action:', form.action);
console.log('Onsubmit:', form.onsubmit);
```

### Issue: CSS from Embed Context

**Symptom:**
Styles look different in modal vs. standalone page.

**Cause:**
The modal's `DialogContent` component or parent containers have CSS that affects form elements.

**Fix:**
Use more specific selectors and `!important`:

```css
.guestbook-form-wrapper * {
  /* Your overrides here */
}
```

---

## Testing Checklist

- [ ] Form has `method="post"` attribute
- [ ] Form has correct `action` attribute (check in DevTools)
- [ ] All labels are visible in modal
- [ ] Input fields don't turn blue after completion
- [ ] Dropdown selection stays when moving to next field
- [ ] Collection ID is present in form data
- [ ] POST request appears in Network tab (not GET)
- [ ] API returns 200 status (not 404)
- [ ] Success message appears after submission
- [ ] Entry appears in Webflow CMS

---

## Alternative Approach: Native Form Page

If the modal approach continues to have issues, use a dedicated page with native form submission:

**File:** `src/pages/guestbook-native.astro`

This page:
- ✅ No React modal interference
- ✅ Native form submission
- ✅ Simpler debugging
- ✅ Better CSS control

**URL:** `https://patricia-lanning.webflow.io/guestbook-form/guestbook-native`

---

## Next Steps

1. **Verify form attributes** in browser DevTools
2. **Check console logs** for form configuration
3. **Test submission** and check Network tab
4. **If still issues**, consider updating form in Webflow Designer
5. **Re-sync Devlink** after any Designer changes

---

## Need More Help?

**Check these files:**
- `src/components/GuestbookModal.tsx` - Form handling logic
- `src/pages/api/guestbook.ts` - API endpoint
- `GUESTBOOK-API-DOCUMENTATION.md` - API reference
- `WEBFLOW-FORM-SETUP.md` - Designer setup guide

**Enable Debug Logging:**

Add this to your browser console:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check form state
const form = document.getElementById('wf-form-Guestbook-Form');
console.log({
  method: form.method,
  action: form.action,
  elements: Array.from(form.elements).map(el => ({
    name: el.name,
    type: el.type,
    value: el.value
  }))
});
```
