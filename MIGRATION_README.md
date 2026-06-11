# Lumini — React Migration v1

This drop replaces the iframe-only React shell with **actual React pages**
for the parts of Lumini that benefit most from it: auth, the home feed, and
profiles. Everything else (chat, calls, stories viewer, settings, admin
tools, etc.) still loads `public/lumini.html` inside an iframe at `/legacy`,
and you can migrate it over time.

## What's new

- **Real auth page** at `/auth` — Google sign-in + email/password, with a
  proper sign-up flow that also creates the `users_directory` entry.
- **Real home feed** at `/` — live posts from Firestore via React Query,
  optimistic likes, stories rail, post composer.
- **Real profile pages** at `/profile/:uid` — follow / unfollow, bio,
  social links, that user's posts.
- **Animated page transitions** between routes (Framer Motion).
- **Glass navbar** with an animated active-tab pill.
- **Ambient gradient background** as a signature touch on every page.
- **Fixed social sharing metadata** — no more "Lovable App" preview.
- **Real Firebase via npm** (`firebase` package) instead of CDN imports.
  Config still works with no setup; supports `VITE_FIREBASE_*` env vars
  when you're ready.

## How to drop it into your repo

The folder structure mirrors your existing project, so most files just go
on top of what's already there:

```
your-repo/
├── index.html                 ← replace
├── package.json               ← replace (adds firebase + framer-motion)
├── tailwind.config.ts         ← replace (adds lumini.* colors)
└── src/
    ├── App.tsx                ← replace
    ├── index.css              ← replace (adds Inter/Montserrat + reduced-motion)
    ├── contexts/              ← NEW
    │   └── AuthContext.tsx
    ├── hooks/                 ← NEW files only
    │   ├── usePosts.ts
    │   ├── useStories.ts
    │   └── useUserDirectory.ts
    ├── lib/
    │   ├── firebase.ts        ← NEW
    │   ├── queryKeys.ts       ← NEW
    │   ├── timeAgo.ts         ← NEW
    │   └── types.ts           ← NEW
    ├── components/            ← NEW files only
    │   ├── AuthGate.tsx
    │   ├── CreatePost.tsx
    │   ├── Layout.tsx
    │   ├── Navbar.tsx
    │   ├── PageTransition.tsx
    │   ├── PostCard.tsx
    │   └── StoriesRail.tsx
    └── pages/
        ├── Auth.tsx           ← NEW
        ├── Feed.tsx           ← NEW
        ├── Index.tsx          ← replace (was iframe)
        ├── Legacy.tsx         ← NEW (iframe fallback)
        └── Profile.tsx        ← NEW
```

Then run `npm install` (or `bun install`) to pick up the new dependencies.
You don't need to delete anything from your old project — the existing
shadcn `components/ui/*` files are still used by the toaster/tooltip
providers and stay as-is.

## Three things to do right after deploying

1. **Lock down Firebase Security Rules.** Your API key is still exposed
   (this is expected for client-side Firebase, but rules are what actually
   protects you). At minimum, only let authenticated users read
   `users_directory`, and only let post authors edit their own posts.
   Open the Firebase Console → Firestore → Rules and confirm.

2. **Enable Firebase App Check** if you haven't. It blocks scripts that
   try to hit your DB from outside your site.

3. **Move the Firebase config to `.env.local`** when convenient. The
   `firebase.ts` file already reads `VITE_FIREBASE_*` if present, so you
   just have to add the file and the hardcoded fallback becomes dormant.
   Don't forget to add `.env*` to `.gitignore`.

## What's intentionally NOT migrated yet

These still live in `public/lumini.html` and load via `/legacy`:

- Chat (1:1 + group, typing indicator)
- Audio / video calls (WebRTC signaling)
- Stories viewer + uploader
- Highlights, saved collections
- Notifications list
- Settings & privacy
- Edit profile (cover, photo, bio, links)
- Admin tools (ban, reports)
- Close friends
- Comment threads (the like + count works in the new UI; full comments
  still happen in the legacy modal)

Suggested order to migrate next:
1. **Comments on posts** — small, opens directly under the new PostCard.
2. **Edit profile** — already styled, just needs a real form.
3. **Notifications** — Firestore data already there, easy win.
4. **Chat** — biggest payoff visually; real-time messaging in React with
   Framer Motion is a noticeable upgrade.
5. **Stories viewer** — last because of the playback timing complexity.

## A few design choices worth knowing

- **Brand:** `lumini.blue` (#2563eb) and `lumini.purple` (#9333ea) are
  registered as Tailwind colors and used wherever the original HTML used
  them, so the two surfaces feel like the same product.
- **Type:** Inter for body, Montserrat for headings — matches lumini.html.
- **Motion:** Page enter is a 250ms fade + 8px upward slide. The active
  nav pill uses `layoutId` so it physically slides between tabs instead
  of cross-fading. Liking a post triggers a 300ms scale pulse on the
  heart. All motion respects `prefers-reduced-motion`.
- **Background:** Three soft blurred gradient blobs, fixed position, low
  opacity. They give every page the "luminous" feel the name implies
  without dominating the content.

## Known follow-ups

- The new feed only handles **text and image/video posts**. The legacy
  HTML also supports the "project" type with extra fields; those still
  render here but tagged-user mentions don't link yet.
- The "Edit profile" button on your own profile is currently disabled
  with a hint to use Classic. Coming next.
- `useStories` requires a Firestore composite index on
  `(expiresAt asc/desc)`. If you don't have one, the rail just shows
  empty — no crash. Firebase will print a link in the console to create
  it the first time the query runs.
