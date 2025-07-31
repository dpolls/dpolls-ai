### 3. Deployment (vercel)

```bash
vercel project
vercel link --yes --project dpolls-ai
bun run build:demo && vercel build --prod && vercel --prebuilt --prod
```
