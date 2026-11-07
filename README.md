# Nusuk Key Compass

Build a complete, production-ready web app called "Nusuk Key World" using React, Tailwind, and your built-in Supabase integration. Automatically create all necessary database tables and wire them to the frontend.

1. UI/UX & Design System (Crucial):
- Global Glassmorphism aesthetic. Clean Light/White theme.
- Use semi-transparent white backgrounds, backdrop-blur effects, and subtle white borders for all cards and modals.
- Colors: Deep Navy Blue (#0f172a) for text. Cyan, Aqua, and Indigo (#6366f1) gradients for buttons, badges, and accents.
- Footer: Include a glassmorphic footer at the bottom of public pages: "Developed by Shoibur Rahman | Support: +880 1752-200299".

2. Public User Experience (/):
- Welcome Entry Modal: As soon as a user loads the website, auto-show a floating glassmorphic Modal asking them to "Submit a new key to help others". Once they submit or click "Skip", reveal the main feed.
- Live Key Feed: A responsive grid showing all submitted keys in floating glass cards. 
- Smart Tracking & Individual Copy (Crucial Feature): 
  - Each card has a "Copy Key" button. 
  - When clicked, copy the key_value to the clipboard, show a "Copied!" toast, and save the key's ID in the browser's localStorage.
  - Visual State: If a key's ID is in localStorage (meaning the user has already copied it), change its appearance permanently for that user (e.g., reduce opacity to 50% and change button text to "Already Copied"). This ensures users know which keys they have already used even after a page refresh.
- Keys dropped by Admin must have a glowing Cyan/Aqua "Verified Admin Drop" badge.

3. Admin Route (/admin):
- Login: Hardcode a simple auth screen allowing access ONLY for email: siamhosain720@gmail.com (Password: Admin@12345).
- Dashboard: 
  - An Admin form to submit verified keys (is_admin_drop set to true).
  - A table listing all keys with a "Delete" button to easily remove spam/fake keys.

4. Automated Database Setup:
- Auto-create a nusuk_keys table. Columns: id (uuid), key_value (text), is_admin_drop (boolean, default false), created_at (timestamp). Wire everything automatically without requiring manual Supabase setup from me.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nusuk-key-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f7894e2d-32e3-4a8b-95a2-9012916f3f89).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
