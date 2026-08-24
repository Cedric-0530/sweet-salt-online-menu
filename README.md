<p align="center">
  <img src="icon/%E5%9B%BE%E7%89%87logo.png" width="220" alt="Sweet & Salt logo">
</p>

<h1 align="center">Sweet & Salt Online Menu</h1>

<p align="center">
  A responsive, photo-first digital menu for Sweet & Salt — built for quick browsing on phones, tablets, and desktops.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-Static%20site-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Responsive-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JavaScript">
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#run-locally">Run locally</a> ·
  <a href="#project-structure">Project structure</a>
</p>

<p align="center">
  <img src="image/bowral%20burger.jpg" width="760" alt="Big Bowral Beef Burger from the Sweet & Salt menu">
</p>

## Overview

Sweet & Salt Online Menu turns a traditional takeaway menu into a clear, easy-to-search web experience. Visitors can browse burgers, fish and chicken, drinks, salads, snacks, and deals without downloading an app or creating an account.

## Features

- Responsive layout designed for mobile-first menu browsing.
- Category filters and a live search field for finding dishes or ingredients quickly.
- Chef's Choice highlights for featured menu items.
- Real on-site food photography with meaningful alternative text.
- Keyboard-friendly controls, visible focus states, and a skip-to-menu link.
- Lightweight static implementation: no framework, build step, or backend required.

## Run locally

Because this is a static website, you can open `index.html` directly in a browser. For the best local testing experience, serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Project structure

```text
.
├── index.html       # Menu content and page structure
├── style.css        # Responsive layout and visual design
├── script.js        # Search, category filters, and local view counter
├── image/           # Food photography used throughout the menu
├── icon/            # Brand logo and favicons
└── optimize.sh      # Image optimisation helper
```

## Updating the menu

1. Edit the relevant menu section in `index.html`.
2. Add or replace product images in `image/`.
3. Keep image `alt` text descriptive so the menu remains accessible.
4. Preview locally before publishing the update.

## Deployment

This repository is ready for any static host. To publish it with GitHub Pages, enable **Settings → Pages**, choose **Deploy from a branch**, and select the `main` branch with the `/(root)` folder.

## Notes

Menu availability and prices can change. Update the HTML source whenever the in-store menu changes so the online version stays accurate.

