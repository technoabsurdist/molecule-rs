# Deploying to GitHub Pages

This guide walks you through the process of deploying your Rust WASM + 3Dmol.js application to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Your project pushed to a GitHub repository

## GitHub Repository Setup

1. Push your code to GitHub:

   ```bash
   # If you haven't set up Git for your project yet
   git init
   git add .
   git commit -m "Initial commit"

   # Create a new repository on GitHub and push to it
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

2. Go to your GitHub repository in a web browser.

3. Navigate to Settings > Pages.

4. Under "Build and deployment", set the following:
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
   - Click "Save"

## Automated Deployment

The GitHub Actions workflow (`.github/workflows/github-pages.yml`) will automatically:

1. Build your WASM module
2. Build your web application
3. Deploy to the gh-pages branch

Every time you push to your main branch, the workflow will trigger and update your deployment.

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. Build your app locally:

   ```bash
   cd molecule-web
   npm run build
   ```

2. Deploy the contents of the `molecule-web/dist` directory to any static hosting service, or push it to the gh-pages branch:

   ```bash
   # Install gh-pages package if not installed
   npm install -g gh-pages

   # Deploy
   gh-pages -d dist
   ```

## Accessing Your Deployed Application

Once deployed, your application will be available at:
`https://your-username.github.io/your-repo-name/`

## Troubleshooting

If your deployment is not working:

1. Check the GitHub Actions tab for any build errors
2. Ensure your webpack configuration has `publicPath: './'` for production builds
3. Make sure the `.nojekyll` file is being copied to the output directory
4. Check that all assets are loading correctly (use browser developer tools)

## Local Development

Remember that you can always test your application locally before deployment:

```bash
cd molecule-web
npm start
```

This will start the development server at http://localhost:8080.
