<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Motion design / vidéo

Pour toute demande de motion, vidéo animée, promo ou vidéo de lancement, charge un skill de `.claude/skills/` avant d'écrire du code :
- promo d'app, de SaaS ou de site → `saas-motion-video` (s'appuie sur HyperFrames : `hyperframes`, `product-launch-video`, `general-video`) ;
- vidéo en code pur (HTML + Playwright + ffmpeg), remake, montage calé sur la musique → `motion-design` ;
- projet Remotion → `remotion-best-practices` et les autres skills `remotion-*`.
