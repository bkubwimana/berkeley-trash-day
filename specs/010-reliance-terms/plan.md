# Implementation plan

1. Add a concise, visually prominent reliance notice ahead of results.
2. Keep acceptance in React state and remember only the current Terms version in local storage.
3. Gate report submission and collection/street-sweeping calendar downloads; require the
   current version at the report API boundary.
4. Publish a plain-language Terms page with authoritative City links and legal caveats.
5. Store the version and server acceptance time with submitted reports while leaving
   calendar downloads local and unlogged.
6. Update Privacy, README, navigation, sitemap, and multi-page Vite inputs.
7. Test persistence, API validation, stored records, copy, and build output before deployment.
