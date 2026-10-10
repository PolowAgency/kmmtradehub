---
workflow: product-launch-video
format: 1080x1920              # vertical iPhone ; écrans capturés en iPhone 15 Pro 393x852 @3x (1179x2556)
duration: 20s
audio: music                   # musique + SFX, sans voix off
loop: false
theme: "à choisir à l'étape 3"
---

# KMM Terminal — lancement de l'appli mobile

**One message:** Ton terminal et ta formation, enfin dans ta poche.

**Audience & channel:** traders indépendants sur l'or (XAU/USD), membres et futurs membres KMM. Reels / TikTok / Stories en 9:16, lecture auto sans le son : tout doit se comprendre à l'image.

**Truth source:** le code et les pages du dépôt `PolowAgency/terminalkmm` (README, ROADMAP, `app/terminal`, `app/formation`, `app/espace`). Aucune fonctionnalité, aucun client, aucun chiffre en dehors.

**Proof moment:** dans le terminal mobile, un tap sur « ⇄ Espace » ramène à l'écran « Où veux-tu aller ? » ; un second tap sur « Formation » ouvre la suite des cours. Deux mondes, une seule appli, deux gestes. *(Le lien direct « événement du terminal → leçon » n'existe pas dans le code : on ne le montre pas.)*

**Components** (audit sur le code de `terminalkmm` et la démo mobile `/terminal-v2/demo` lancée en local ; captures dans `captures/`)

Score /8 = actuel + calme + dans la marque + montre la preuve (0–2 chacun).

| Component | Source | Score | Real or imaginary | Notes |
|---|---|---|---|---|
| **Hub « Où veux-tu aller ? »** (logo, salutation, cartes Terminal / Formation avec mini-maquettes) | `app/espace/page.tsx`, `MiniPriceMock`, `MiniProgressMock` | 2+2+2+2 = 8 | **réel**, reconstruit en HTML | composant pivot du film |
| Terminal mobile : prix GC, Market Lens heatmap, nav basse Signals / Lens / Depth | `terminal-v2`, capture `terminal-mobile-demo.png` | 2+0+2+1 = 5 | **réel simplifié** | garder le prix, la heatmap, un mur « DEFENDED », la nav ; retirer footprint et barres d'outils |
| Carte signal (ex. SWEEP · score, ABSORPTION) | onglet Signals / Market Lens | 2+1+2+1 = 6 | **réel simplifié** | une carte à la fois, données d'exemple, aucun « achète / vends » |
| Courbe CVD | panneau CVD | 2+2+2+0 = 6 | réel simplifié | élément d'ambiance qui se dessine |
| Bouton « ⇄ Espace » | `TopBar.tsx` | 2+2+2+2 = 8 | réel | cible du point de tap |
| Formation Home : prénom, carte « prochaine leçon », 3 stats (leçons, série, %), « Mes cours » avec anneaux | `app/formation/(app)/page.tsx`, `ProgressRing` | 2+2+2+1 = 7 | **réel**, reconstruit | prénom et cours d'exemple |
| Nav basse formation : Home / Cours / Communauté / Classement | `AppBottomNav.tsx` | 2+2+2+0 = 6 | réel | |
| Communauté / lives (aperçu) | `communaute`, `calendrier` | — | réel, optionnel | seulement si le rythme le permet |
| Écran de connexion Face ID | `FaceIdToggle`, login | — | non retenu | pas la preuve |

**Brand:** logo officiel `terminalkmm/components/Logo.tsx` / `public/brand/kmm-tradehub-logo.png` / `public/logo-mark.svg` · or KMM #e8c468 (accents, CTA) · fonds #050607 / #0a0c0f (pas de noir pur) · terminal : cyan acheteurs #35c8e0, rouge vendeurs #e5484d, orange #e8822a · texte #f5f5f7 / #86868b · polices Quicksand (titres app), Manrope (texte), JetBrains Mono (chiffres).

**Do / Don't:**
- Jamais de signal ou de conseil d'achat/vente à l'écran ; le narrateur décrit.
- Toute donnée de démo est marquée « données d'exemple » ; rien de simulé présenté comme réel.
- Pas de noir ni de blanc purs, pas de dégradé dans le texte, pas de barre de progression, pas de rebond sur l'UI.
- Logo officiel uniquement.

**Captures :** vrais écrans enregistrés image par image en temps virtuel (`tools/capture-iphone.cjs`, 30 i/s, 1179×2556), puis posés dans un cadre iPhone. Masquer le badge de dev Next.js avant les prises.

**Deliverables:** master 1080×1920 (rendu 4K puis réduit), MP4 H.264, ~20 s. Déclinaison 16:9 possible ensuite.
