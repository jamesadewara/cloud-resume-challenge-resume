# 📄 Cloud Resume Challenge - Frontend Assets

This repository contains the high-performance, responsive frontend for the Cloud Resume Challenge. Built with **Vanilla HTML5, CSS3, and JavaScript**, it demonstrates the power of keeping things lightweight while maintaining a premium, modern aesthetic.

## ✨ Highlights

- **Edge-Optimized**: Served via **Amazon S3** and globally accelerated by **Cloudflare CDN**.
- **Dynamic Visitor Counter**: Real-time interaction with a serverless Python API.
- **Glassmorphic UI**: Modern design system using smooth gradients, subtle animations, and fluid typography.
- **SEO & Accessibility**: Structured with semantic HTML5 for maximum reach and accessibility.
- **Zero-Touch CI/CD**: Automatic S3 synchronization on every push using GitHub Actions and AWS OIDC.

## 🛠️ Tech Stack

- **Structure**: HTML5 (Semantic)
- **Styling**: Vanilla CSS3 (Custom Design System)
- **Logic**: Vanilla JavaScript (Async/Await Fetch API)
- **Hosting**: AWS S3 (Static Website Hosting)
- **CDN**: Cloudflare (Edge Caching & SSL)

## 📂 Project Anatomy

| File | Role |
| :--- | :--- |
| `index.html` | The semantic core and layout of the resume. |
| `styles.css` | Custom design tokens, layout utilities, and micro-animations. |
| `main.js` | Asynchronous logic for the visitor counter and UI interactions. |
| `assets/` | Optimized images and icons used throughout the site. |

## 🚀 Local Development

Since this is a static site, you can simply open `index.html` in your browser. For a more production-like experience (to avoid CORS issues with the local API), use a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (if installed)
npx serve .
```

## 🔒 Production Security

Traffic is strictly routed through **HTTPS (TLS 1.3)** via Cloudflare. The origin S3 bucket is configured with a restricted Bucket Policy, allowing only the Cloudflare IP ranges (or public read where configured) to access the assets, ensuring the origin is protected.

---
*Developed as a showcase for cloud-native frontend architecture.*