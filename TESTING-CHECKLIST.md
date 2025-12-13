# ✅ Guestbook Testing Checklist

Use this checklist to verify your Guestbook CMS integration is working correctly.

## 🔧 Pre-Flight Checks

- [ ] `.env` file exists with `WEBFLOW_CMS_SITE_API_TOKEN` set
- [ ] API token has CMS read/write permissions
- [ ] Collection ID is correct: `69383a09bbf502930bf620a3`
- [ ] Dev server is running: `npm run dev`
- [ ] No TypeScript errors: `npm run astro check`

## 🎯 Functional Tests

### Basic Form Submission

- [ ] Navigate to `/guestbook`
- [ ] Click "Sign Guestbook" button
- [ ] Modal opens successfully
- [ ] Form displays all fields:
  - [ ] Full Name
  - [ ] Email
  - [ ] Location
  - [ ] Relationship
  - [ ] First Meeting/Memory
  - [ ] Message
- [ ] Fill out all required fields
- [ ] Click "Submit Entry"
- [ ] Loading state shows ("Submitting...")
- [ ] Success message appears
- [ ] Success message shows:
  - [ ] Item ID
  - [ ] Slug
  - [ ] Created timestamp
  - [ ] Updated timestamp
- [ ] Modal closes after 2 seconds

### Validation Tests

- [ ] Submit form with empty name → Shows error
- [ ] Submit form with empty email → Shows error
- [ ] Submit form with invalid email → Shows error
- [ ] Submit form with empty full name → Shows error
- [ ] All validation errors display clearly
- [ ] Can fix errors and resubmit successfully

### CMS Verification

- [ ] Log into Webflow
- [ ] Open CMS Collections
- [ ] Navigate to Guestbooks collection
- [ ] New entry appears in the list
- [ ] Entry has correct data:
  - [ ] Name matches
  - [ ] Slug is generated correctly
  - [ ] Email matches
  - [ ] Location matches
  - [ ] Relationship matches
  - [ ] Message/memory matches
  - [ ] Date is set
  - [ ] Active status is correct

### Update Functionality

- [ ] Get an existing item ID from Webflow CMS
- [ ] Pass `itemId` prop to `GuestbookButton`
- [ ] Click button
- [ ] Form should show "Update Entry" button text
- [ ] Fill out form with updated data
- [ ] Click "Update Entry"
- [ ] Success message shows "updated successfully"
- [ ] Check Webflow CMS → Entry is updated
- [ ] `lastUpdated` timestamp is current

## 🎨 UI/UX Tests

### Desktop

- [ ] Button renders correctly
- [ ] Button hover state works
- [ ] Modal opens smoothly
- [ ] Modal is properly sized (not too big/small)
- [ ] Form fields are clearly labeled
- [ ] All text is readable
- [ ] Success/error messages are visible
- [ ] Modal closes with X button
- [ ] Modal closes with escape key
- [ ] Modal closes by clicking outside

### Mobile (Responsive)

- [ ] Button is tappable (not too small)
- [ ] Modal fits on screen
- [ ] Form is scrollable if needed
- [ ] All fields are accessible
- [ ] Keyboard doesn't block form fields
- [ ] Success/error messages visible
- [ ] Can close modal easily

### Accessibility

- [ ] Can tab through form fields
- [ ] Can submit form with Enter key
- [ ] Focus indicators are visible
- [ ] Dialog has proper ARIA labels
- [ ] Screen reader announces modal opening
- [ ] Error messages are announced
- [ ] Success messages are announced

## 🌍 External Embed Tests (If Applicable)

- [ ] Bundle builds without errors
- [ ] Script loads on external page
- [ ] `mountGuestbookButton` function is available
- [ ] Button renders on external page
- [ ] Modal opens from external page
- [ ] Form submission works
- [ ] API calls include correct `baseUrl`
- [ ] Success/error callbacks fire
- [ ] Unmount works if called

## 🔍 Error Handling Tests

### Network Errors

- [ ] Disconnect internet
- [ ] Try to submit form
- [ ] User-friendly error message appears
- [ ] Can retry after reconnecting

### API Errors

- [ ] Set invalid API token in `.env`
- [ ] Try to submit form
- [ ] Error message appears (not raw API response)
- [ ] Restore valid token
- [ ] Form works again

### Invalid Data

- [ ] Try to submit with invalid collection ID
- [ ] Error message appears
- [ ] Try to update non-existent item
- [ ] Error message appears

## 🚀 Performance Tests

- [ ] Modal opens quickly (< 500ms)
- [ ] Form submission completes in reasonable time (< 3s)
- [ ] No memory leaks (check browser dev tools)
- [ ] Multiple submissions don't cause issues
- [ ] No console errors or warnings

## 🔐 Security Tests

- [ ] API token is not visible in browser
- [ ] API token is not in bundled JavaScript
- [ ] Network tab shows API calls go through `/api/cms/*`
- [ ] Direct Webflow API calls only from server
- [ ] Form data is sanitized
- [ ] No XSS vulnerabilities in success messages

## 📊 Browser Compatibility

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## 🎯 Edge Cases

- [ ] Submit form with very long text (1000+ chars)
- [ ] Submit form with special characters (émojis, accents, etc.)
- [ ] Submit form with HTML/script tags (should be escaped)
- [ ] Submit form rapidly multiple times
- [ ] Open multiple modals simultaneously
- [ ] Submit form while offline
- [ ] Submit form with empty optional fields

## 📝 Test Data

### Valid Test Entry
```
Name: Test User
Full Name: John Test Doe
Email: test@example.com
Location: New York, NY
Relationship: Friend
Message: This is a test guestbook entry
```

### Invalid Test Entry
```
Name: (empty)
Full Name: (empty)
Email: not-an-email
Location: Test
Relationship: Test
Message: Test
```

### Special Characters Test
```
Name: Tëst Üser 🎉
Full Name: José María García
Email: test+special@example.com
Location: São Paulo, Brazil
Relationship: Família
Message: Testing with spëcial çharactërs & émojis 🚀✨
```

## ✅ Sign-Off

After completing all tests above:

- [ ] All critical tests pass ✅
- [ ] All UI/UX tests pass ✅
- [ ] No console errors ✅
- [ ] CMS data is correct ✅
- [ ] Performance is acceptable ✅
- [ ] Security checks pass ✅

**Tested by:** ________________  
**Date:** ________________  
**Environment:** [ ] Development  [ ] Production  
**Status:** [ ] PASS  [ ] FAIL  

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

**Ready for Production?** If all tests pass, you're good to deploy! 🚀
