import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// VITE_BASE is only set for GitHub Pages (see .github/workflows/deploy.yml). Everywhere else the site is served from "/".
export default defineConfig({base:process.env.VITE_BASE||'/',plugins:[react()]})
