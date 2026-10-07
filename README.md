# GetFoxChat for Google Tag Manager

Put the GetFoxChat AI Operator (that you name as you like) on every page of your site from Google Tag Manager. It answers your visitors from your own site's pages, day and night, and hands a conversation to you when a person should take it.

No code to paste into your site. The tag has one field: your Site ID.

## Add it

1. In Google Tag Manager, open the container your site loads. Click **Tags**, then **New**, then **Tag Configuration**. Click **Discover more tag types in the Community Template Gallery**, search for **GetFoxChat** and add it.
2. Paste your **Site ID** into the Site ID field. Under **Triggering**, choose **All Pages**. Click **Save**.
3. Click **Submit**, then **Publish**. Open your site once: the chat switches itself on during that visit.

**Where is my Site ID?** In GetFoxChat, under Site Settings, Installation, on the Google Tag Manager tab, with a Copy button: [getfoxchat.com/tag-manager](https://getfoxchat.com/tag-manager?utm_medium=readme). New to GetFoxChat? The same link starts your account; you get your Site ID when your site is added.

Not in the gallery for you yet? Download [template.tpl](template.tpl), then in Tag Manager click **Templates**, **New**, the three-dot menu, **Import**.

## What it loads

One script, `https://getfoxchat.com/widget.js`, with your Site ID on its address. It is the same chat the GetFoxChat snippet loads, and it loads once per page however often the tag fires. If your site also carries the snippet with the same Site ID, you still get one chat.

The template asks Tag Manager for one permission only: to load scripts from `https://getfoxchat.com/widget.js`. The template itself reads no cookies, no data layer and no other globals.

## Good to know

- The chat switches on once GetFoxChat confirms the site is yours. Publishing this tag in the container your homepage loads is that confirmation; it happens on your first visit after publishing.
- A site on your own computer (localhost) or a staging address cannot be read by GetFoxChat, so put the tag on your live site.
- Plans: [getfoxchat.com/pricing](https://getfoxchat.com/pricing). Help: [getfoxchat.com](https://getfoxchat.com).

## Files

- `template.tpl` — the tag template, with its tests (Tag Manager's template editor runs them under **Tests**).
- `metadata.yaml` — versions for the Community Template Gallery.
- `test/run-tests.mjs` — the same tests without Tag Manager: `node test/run-tests.mjs`.

Licensed under the Apache License 2.0.
