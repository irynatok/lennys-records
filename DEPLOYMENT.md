# Deployment Guide - Lenny's Records

This guide explains how to deploy the Lenny's Records web application to production.

## Prerequisites

- Node.js 18+ installed
- Vercel or Netlify account (free tier works)
- GitHub account (for CI/CD integration)

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the web directory:
   ```bash
   cd web
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: lenny-recs (or your choice)
   - In which directory is your code located: `./`
   - Want to override settings: No

5. Production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

## Alternative: Deploy to Netlify

### Option 1: Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Navigate to web directory and build:
   ```bash
   cd web
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy
   ```

4. Follow prompts, then deploy to production:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Netlify Dashboard

1. Push your code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`
6. Click "Deploy site"

## Updating Recommendations Data

When you want to update the recommendations:

1. Run the extraction script:
   ```bash
   python3 extract_recs.py
   ```

2. (Optional) Add Substack URLs:
   ```bash
   python3 add_substack_urls.py
   ```

3. Copy updated data to web app:
   ```bash
   cp recommendations.json web/public/recommendations.json
   ```

4. Build and deploy:
   ```bash
   cd web
   npm run build
   vercel --prod  # or netlify deploy --prod
   ```

## CI/CD with GitHub Actions

See `.github/workflows/deploy.yml` for automated deployment on push to main branch.

### Required GitHub Secrets

For Vercel deployment via GitHub Actions:
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

To get these values:
1. **VERCEL_TOKEN**: Visit [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**: Run `vercel` in the project, then check `.vercel/project.json`

## Environment Variables

No environment variables needed for the web app! All data is pre-generated as static JSON.

For the data extraction scripts, see `.env.example`:
- `GROQ_API_KEY` - Groq API key (primary)
- `GOOGLE_API_KEY` - Google Gemini API key (fallback)

## Troubleshooting

### Build Errors

**Problem**: `Cannot find module 'recommendations.json'`
**Solution**: Run `npm run copy-data` or manually copy `recommendations.json` to `web/public/`

**Problem**: TypeScript errors during build
**Solution**: Run `npm run lint` to identify issues, then `tsc --noEmit` for details

### CSP Issues

**Problem**: Content blocked by Content-Security-Policy
**Solution**: Check browser console for CSP violations. Update CSP headers in `vercel.json` or `web/public/_headers`

Common fixes:
- For external images: Add domain to `img-src`
- For external scripts: Add domain to `script-src` (use cautiously!)
- For external styles: Add domain to `style-src`

### 404 Errors on Page Refresh

**Problem**: Direct navigation to routes like `/books` returns 404
**Solution**: Verify SPA routing is configured:
- **Vercel**: Check `vercel.json` has rewrites section
- **Netlify**: Check `web/public/_redirects` exists

### Performance Issues

**Problem**: Slow initial load
**Solution**:
1. Check bundle size: `npm run analyze`
2. Verify code splitting is working (check for multiple chunk files in `dist/assets/`)
3. Enable compression on your hosting platform (usually automatic on Vercel/Netlify)

**Problem**: Slow pan/zoom on catalog pages
**Solution**: This is expected with 500+ items. Performance is optimized with:
- Canvas virtualization (only renders visible area)
- Memoized calculations
- Throttled event handlers

## Performance Monitoring

Recommended tools for production monitoring:
- [Web Vitals](https://web.dev/vitals/) - Core Web Vitals
- [Vercel Analytics](https://vercel.com/docs/analytics) - Built-in for Vercel deployments
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit performance, accessibility, SEO

## Security

The application includes:
- **Content Security Policy** (CSP) headers
- **XSS Protection** headers
- **Frame Options** to prevent clickjacking
- **HTTPS-only** cookies and connections
- **URL validation** to prevent malicious links

Security headers are configured in:
- `vercel.json` for Vercel deployments
- `web/public/_headers` for Netlify deployments

## Custom Domain

### Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Netlify
1. Go to "Domain management"
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Support

For issues or questions:
- Check [CLAUDE.md](./CLAUDE.md) for project architecture
- Review [web/README.md](./web/README.md) for development setup
- Open an issue on GitHub
