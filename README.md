# Personal Landing Page

A minimalist personal landing page built with Next.js 15, matching Jane Manchun Wong's design aesthetic.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Move your headshot image to the `public` folder:
```bash
cp assets/images/headshot.jpg public/headshot.jpg
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production (static export for GitHub Pages):
```bash
npm run build
```

The static files will be in the `out` folder, ready to deploy to GitHub Pages.

## Project Structure

- `app/layout.tsx` - Root layout with Inter font
- `app/page.tsx` - Main landing page
- `app/globals.css` - Global styles and animations
- `components/SocialButton.tsx` - Reusable social button component
- `tailwind.config.ts` - Tailwind configuration
- `public/headshot.jpg` - Profile image (move from assets/images/)

## Design Specifications

- Background: `#0C0E12`
- Avatar: 80px × 80px, circular with soft shadow
- Name: 22px, font-weight 600
- Location: 14px, opacity 0.65
- Buttons: 48px height, pill-shaped, 1px border with rgba(255,255,255,0.12)
- Icons: 16px, opacity 0.8
- Spacing: 12px gap between buttons

