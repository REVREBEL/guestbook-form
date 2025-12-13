# 🎯 Embedding the Guestbook Button on Webflow Pages

There are **two ways** to add the guestbook button to your Webflow site pages:

---

## ✅ **Method 1: iframe Embed (Simplest - Recommended)**

This works immediately without any build step.

### Steps:

1. **Open your Webflow page** in the Designer
2. **Add an Embed element** where you want the button
3. **Paste this code**:

```html
<iframe 
  src="https://patricia-lanning.webflow.io/guestbook-form/embed" 
  style="border:none; width:100%; height:60px; overflow:visible;"
  scrolling="no"
  title="Sign Guestbook"
></iframe>
```

4. **Publish** your site

### Pros:
- ✅ No build process needed
- ✅ Works immediately
- ✅ Isolated styles (won't conflict with your page)
- ✅ Automatic updates when you deploy changes

### Cons:
- ⚠️ Modal opens inside iframe (might need height adjustment)
- ⚠️ Small layout limitations

### Adjustments:

If the modal gets cut off, you can increase the iframe height when the button is clicked:

```html
<iframe 
  id="guestbook-iframe"
  src="https://patricia-lanning.webflow.io/guestbook-form/embed" 
  style="border:none; width:100%; height:60px; transition: height 0.3s;"
  scrolling="no"
  title="Sign Guestbook"
></iframe>
```

---

## 🔧 **Method 2: Direct Component Embed (Advanced)**

This requires building a standalone JavaScript bundle.

### Steps:

1. **Build the embed bundle** (requires Node.js setup):
   
   ```bash
   # Install dependencies
   npm install
   
   # Build the embed
   npm run build:embed
   ```

2. **Upload the bundle** to your site's hosting (or use the Webflow Cloud URL)

3. **Add this code** to your Webflow page embed:

```html
<div id="guestbook-button"></div>
<script src="https://patricia-lanning.webflow.io/guestbook-form/dist/guestbook-embed.js"></script>
<script>
  window.mountGuestbookButton(
    document.getElementById('guestbook-button'),
    {
      buttonText: 'Sign Our Guestbook',
      baseUrl: 'https://patricia-lanning.webflow.io/guestbook-form'
    }
  );
</script>
```

### Pros:
- ✅ Modal appears on top of page (better UX)
- ✅ More flexible styling options
- ✅ Full integration with page

### Cons:
- ⚠️ Requires build process
- ⚠️ More complex setup
- ⚠️ Potential style conflicts with your site

---

## 📝 **Quick Comparison**

| Feature | iframe Embed | Direct Embed |
|---------|--------------|--------------|
| Setup Time | 30 seconds | 15+ minutes |
| Build Required | No | Yes |
| Style Isolation | Yes | No |
| Modal Position | Inside iframe | On page |
| Best For | Quick setup | Advanced customization |

---

## 🚀 **Recommended Approach**

**Start with Method 1 (iframe)** - it works immediately and is perfect for most use cases.

Only move to Method 2 if you need:
- Modal to appear above page content
- Deep integration with your site's JS
- Custom styling that conflicts with iframe

---

## 🆘 **Troubleshooting**

### iframe is too small
Increase the height: `height:80px` or `height:100px`

### Modal is cut off
The iframe needs to expand. Add JavaScript to resize it when the button is clicked.

### Button doesn't appear
1. Check that the app is deployed and accessible at `/guestbook-form/embed`
2. Check browser console for errors
3. Ensure your API token is set in environment variables

### "mountGuestbookButton is not defined"
This means you're trying Method 2 without building the bundle first. Either:
- Use Method 1 (iframe) instead
- Run `npm run build:embed` to create the bundle

---

## ✅ **Success Checklist**

- [ ] App is deployed to Webflow Cloud at `/guestbook-form/`
- [ ] Environment variable `GUESTBOOK_COLLECTION_ID` is set
- [ ] Environment variable `WEBFLOW_CMS_SITE_API_TOKEN` is set
- [ ] `/guestbook-form/embed` page loads in browser
- [ ] iframe code is added to Webflow page
- [ ] Page is published
- [ ] Button appears and clicks open modal
- [ ] Form submits successfully to CMS

---

**Need help?** Check the main [GUESTBOOK-INDEX.md](../GUESTBOOK-INDEX.md) documentation.
