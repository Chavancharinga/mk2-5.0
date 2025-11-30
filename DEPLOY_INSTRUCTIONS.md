# How to Fix the Deployment (404 Error)

The error you are seeing (`404 Not Found` for `index.tsx`) happens because **GitHub is trying to run your code directly** instead of running the **built website**. Browsers cannot run `.tsx` files, so it fails.

To fix this, you must tell GitHub to use the **GitHub Actions** workflow I created.

## Step 1: Push Your Changes
Make sure you have pushed the latest fixes I made (favicon and path fixes). Run this in your terminal:

```bash
git add .
git commit -m "Fix missing styles in production"
git push -u origin main
```

## Step 2: Change GitHub Settings (CRITICAL)
This is the step that will fix the error.

1. Open your repository on GitHub: **https://github.com/chavancharinga/MK2-AI** (or your actual repo URL).
2. Click on the **Settings** tab (top right).
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Look for the **Build and deployment** section.
5. Under **Source**, click the dropdown menu (it probably says "Deploy from a branch").
6. Select **GitHub Actions**.
7. There is no save button, it saves automatically.

## Step 3: Wait for Deployment
1. Click on the **Actions** tab (top of the page).
2. You should see a workflow running (probably named "Deploy to GitHub Pages").
3. Wait for it to turn **Green** (Success).
4. Click on the workflow run, then click the link under "deploy" to see your working site.

## Why this works
By selecting "GitHub Actions", you tell GitHub to use the `deploy.yml` file I created. This file:
1. Installs your dependencies.
2. Builds your site (converts `.tsx` to `.js` and `.css`).
3. Deploys the *result* (the `dist` folder) to your website.

This will eliminate the 404 errors.
