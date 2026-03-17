# Fix Vercel Deployment - TODO Steps

## Approved Plan Steps:
1. [x] Delete package-lock.json to remove corrupted lockfile
2. [x] Edit package.json: Add "engines": {"node": "18.x"}
3. [x] Run `npm install` to regenerate clean package-lock.json
4. [ ] Test locally: `npm run dev` (verify http://localhost:3000 works)
5. [ ] Deploy to Vercel: `vercel --prod`

**Next: Step 4 - `npm run dev` running. Test http://localhost:3000/ice-cream in browser. Ctrl+C to stop when tested.**

