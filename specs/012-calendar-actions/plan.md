# Implementation Plan: Calendar Provider Actions

1. Extract provider-neutral event data from pickup and street-sweeping calendar builders.
2. Build encoded Google Calendar and Outlook next-occurrence links.
3. Add an accessible provider chooser that retains recurring `.ics` download.
4. Add a just-in-time Terms confirmation dialog and resume the requested calendar action.
5. Update Privacy, Terms, calendar specifications, sitemap dates, and automated tests.
6. Validate desktop/mobile layouts, deploy, and verify production provider URLs.
