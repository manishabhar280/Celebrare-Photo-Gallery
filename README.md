# Celebrare Photo Gallery

A React photo gallery assignment that displays photos from the Picsum Photos API. Visitors can search photos by author and save favorites in their browser.

## Features

- Loads 30 photos from Picsum Photos.
- Shows loading and error states while retrieving photos.
- Displays a responsive gallery with one column on mobile, two on tablet, and four on desktop.
- Filters the loaded photos by author as you type; search is case-insensitive.
- Lets visitors toggle photo favorites, which persist in browser `localStorage`.
- Uses accessible labels for the search field, photo images, and favorite buttons.

## Technology

- React with JavaScript
- Vite
- Tailwind CSS 4 with the official Vite plugin
- Picsum Photos API

## Setup

Install the project dependencies:

```powershell
npm install
```

No API key or environment variables are required.

## Run locally

Start the development server:

```powershell
npm run dev
```

Open the local URL printed by Vite in your browser. To create and locally preview a production build:

```powershell
npm run build
npm run preview
```

To run the project linter:

```powershell
npm run lint
```
