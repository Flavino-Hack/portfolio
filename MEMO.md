📋 Récapitulatif complet du projet portfolio
Voici tout ce qu'on a construit ensemble, à conserver précieusement.

🎯 Stack technique
Framework : Astro 7.3.5

Styling : Tailwind CSS 4.3.3 (via @tailwindcss/vite)

Contenu : MDX (@astrojs/mdx)

SEO : Sitemap (@astrojs/sitemap)

TypeScript : v6.0.3 (compatible astro check)

Node : v22.23.3

pnpm : v12.8.1

Déploiement : Vercel (auto-deploy sur push GitHub)

URL actuelle : https://portfolio-delta-orcin-fo8mikycbp.vercel.app/

Domaine cible : flavino-hack-dev.kdns.fr

🖥️ Environnement de dev
OS : Windows 11 (PowerShell) — tu as migré depuis WSL

Dossier projet : D:\fhkdev\portfolio

Éditeur : VS Code

Repository GitHub : https://github.com/Flavino-Hack/portfolio

SSH : configuré (~/.ssh/id_ed25519)

📁 Architecture complète du projet
text
portfolio/
├── .github/
│ └── workflows/
│ └── ci.yml
├── public/
│ ├── favicon.svg
│ ├── robots.txt
│ ├── cv.pdf (placeholder — à remplacer)
│ └── images/
│ └── stages/ (photos de stages — à ajouter)
├── src/
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Container.astro
│ │ │ ├── Dock.astro (macOS dock en bas)
│ │ │ ├── Footer.astro
│ │ │ ├── Header.astro (barre macOS complète)
│ │ │ └── ThemeToggle.astro
│ │ ├── sections/
│ │ │ ├── About.astro (profil + parcours + compétences)
│ │ │ ├── Certifications.astro
│ │ │ ├── Contact.astro (formulaire + liens)
│ │ │ ├── Hero.astro (titre + terminal interactif)
│ │ │ ├── Lab.astro
│ │ │ ├── Projects.astro (3 volets : réseau/dev/cyber)
│ │ │ ├── Skills.astro (liste + grande icône 3D)
│ │ │ ├── Stages.astro (timeline + modale + terminal)
│ │ │ └── Writing.astro
│ │ └── ui/
│ │ ├── Sound.astro (son taptic + bouton mute)
│ │ ├── StagesTerminal.astro (terminal interactif + commandes)
│ │ ├── TechIcon.astro (logos SVG des technos)
│ │ └── Terminal.astro (terminal dans le Hero)
│ ├── content/
│ │ └── projects/
│ │ ├── audit-securite.mdx
│ │ ├── gestion-parc.mdx
│ │ ├── monitoring-telegram.mdx
│ │ └── vlan-entreprise.mdx
│ ├── i18n/
│ │ ├── en.ts
│ │ ├── fr.ts
│ │ └── index.ts
│ ├── layouts/
│ │ ├── BaseLayout.astro
│ │ └── ProjectLayout.astro
│ ├── lib/
│ ├── pages/
│ │ ├── en/
│ │ │ └── index.astro
│ │ ├── projects/
│ │ │ └── [slug].astro
│ │ ├── 404.astro
│ │ └── index.astro
│ ├── styles/
│ │ ├── global.css
│ │ └── tokens.css
│ ├── env.d.ts
│ └── content.config.ts
├── astro.config.mjs
├── tsconfig.json
├── tailwind.config.mjs (n'existe plus en Tailwind v4)
├── .prettierrc
├── .gitignore
└── package.json
🎨 Design system
Deux thèmes (data-theme)
ops (sombre) — défaut, bleu-noir #0A0E14

audit (clair) — #FAFBFC

Basculés par le ThemeToggle, persistés dans localStorage, avec script anti-FOUC dans <head>.

Palette de tokens (tokens.css)
css
--bg-primary, --bg-surface, --bg-elevated
--text-primary, --text-secondary, --text-muted
--border-subtle, --border-strong
--accent, --accent-hover
--glass-bg, --glass-border, --glass-highlight
--shadow-sm, --shadow-md, --shadow-lg
--mac-red (#FF5F57), --mac-yellow (#FEBC2E), --mac-green (#28C840)
--sidebar-bg, --window-bg
Effets
Liquid glass (.glass, .glass-strong) partout : header, cards, dock

Hover lift (.hover-lift, .hover-lift-sm, .hover-tag) uniforme sur tous les éléments interactifs

Transitions horizontales entre sections (slide-in-right / slide-out-left)

Fond global animé : halos colorés + grille + particules

🧩 Sections du portfolio

# Section Description

1 Hero Titre + accroche + 2 CTA + terminal interactif à droite
2 Profil (About) Avatar KW + bio + compétences (4 catégories) + parcours (timeline) + contacts
3 Compétences (Skills) Liste des 16 technos + panneau grande icône 3D avec logos SVG + fond galaxie
4 Stages Timeline de tes 2 stages Moov + terminal interactif flottant
5 Certifications Cartes glass avec statut (obtenu/en cours)
6 Lab perso 3 projets de home lab
7 Projets 3 volets : Réseau / Dev / Cybersécurité (avec MDX)
8 Contact 6 liens + formulaire + CV
🍎 Style macOS
Header (barre macOS)
3 pastilles macOS (rouge/jaune/vert)

fhkdev branding en mono

Menus fonctionnels : Fichier / Édition / Affichage (avec dropdowns)

Widgets à droite :

Flux réseau (canvas double bleu/vert style Kali)

Wi-Fi pulsant

Batterie (descend de 87% à 5%, jaune à 20%, rouge à 5%, clignote)

Loupe → ouvre la Command Palette (Ctrl+K)

Bouton son (on/off)

Horloge (secondes au survol)

Sélecteur FR/EN

Theme toggle

Dock (bas centré)
8 icônes d'app avec couleurs macOS officielles

Accueil, Profil, Skills, Stages, Certifs, Lab, Projets, Contact

Effet magnification (voisins grandissent)

Label visible sous chaque icône

Terminal interactif (Hero + Stages)
Prompt style Powerlevel10k : pomme + user + host + chemin + git branch + statut ✓

Effet machine à écrire

Commandes : help, ls, cat stage_N, open <section>, open stage_N, open photo_N_stage_M, projects, contact, pause, play, clear

Autocomplete avec Tab

Déplaçable (drag), réductible, fermable

Auto-play en boucle (reprend après 30s d'inactivité)

Détection Mac → vraie pomme ; sinon fallback >

Sound
Son synthétique "taptic" (style roue d'horloge iOS)

Déclenché au survol des .hover-lift

Bouton mute dans le header

Limité à 1 son / 60ms

Persisté dans localStorage

🌐 i18n (FR/EN)
src/i18n/fr.ts et en.ts : tous les textes

src/i18n/index.ts : helpers useTranslations(), getLangFromUrl()

Routes :

/ → FR (défaut)

/en/ → EN

Sélecteur FR/EN dans le header avec surbrillance de la langue active

Config Astro : i18n: { defaultLocale: 'fr', locales: ['fr', 'en'], prefixDefaultLocale: false }

🧪 Content collections
Schéma (src/content.config.ts)
ts
{
title, description, date, tags[], category (network|dev|hybrid|cyber),
featured, draft,
role, duration, team, year, heroImage,
repo, demo, docs,
features[], previews[], process[], flow[],
architecture, metrics[]
}
4 projets créés
vlan-entreprise.mdx (network)

gestion-parc.mdx (dev)

monitoring-telegram.mdx (hybrid)

audit-securite.mdx (cyber)

📐 Layouts
BaseLayout.astro
Charge global.css

Header + Sidebar (supprimé) → Dock

Anti-FOUC

Script transitions horizontales entre sections

Lightbox global pour photos (window.openLightbox())

Footer + Sound

ProjectLayout.astro
Hero projet (catégorie + titre + description + tags)

Meta bar (rôle/durée/équipe/année)

Hero image

Contenu MDX

Sections conditionnelles : Fonctionnalités / Aperçu zigzag / Process / Flow / Architecture / Métriques / Liens

Avis (étoiles) + Commentaires (form fonctionnel avec avatar + réinitialisation propre)

Footer nav (retour / contact)

🎨 Command Palette (Ctrl+K)
Ouverte par Ctrl+K ou clic sur la loupe

Liste : sections, liens externes, actions

Filtre dynamique

Navigation ↑ ↓ Entrée

ESC ou clic extérieur pour fermer

🔐 Authentification Git
SSH configuré

Remote : git@github.com:Flavino-Hack/portfolio.git

Token GitHub exposé à révoquer (attention!)

📦 Déploiement
Vercel : import automatique depuis GitHub

Chaque git push sur main → redéploiement

Chaque PR → preview URL

⚠️ Problèmes actuels à régler
CLAUDE.md en lecture seule (symlink Windows) → à supprimer

Erreurs de build sur [slug].astro : date non reconnu dans le schéma

Cause probable : content.config.ts pas synchronisé

Fix : utiliser z.coerce.date() et nettoyer les props passées à ProjectLayout

TechIcon.astro créé dans C:\Users\Predator → à recréer dans D:\fhkdev\portfolio

Photos de stages manquantes (public/images/stages/*.jpg) → à ajouter

🔗 Tes coordonnées à jour
Type Valeur
Nom KIEMA Wendtoin Guy Flavien
Pseudo fhkdev / Flavino-Hack
Email pro flavien.kiema@flavino-hack-dev.kdns.fr
Email perso flavienkiema1@gmail.com
WhatsApp +226 64 93 16 93
LinkedIn linkedin.com/in/flavienkiema
GitHub github.com/Flavino-Hack
Domaine flavino-hack-dev.kdns.fr
🎯 Ce qui reste à faire
Priorité haute
□ Corriger content.config.ts (erreur date)
□ Recréer TechIcon.astro dans le bon dossier
□ Supprimer CLAUDE.md (symlink Windows)
□ Ajouter tes vraies photos de stages dans public/images/stages/
□ Remplacer public/cv.pdf par ton vrai CV
□ Configurer Formspree pour le formulaire de contact
Priorité moyenne
□ Tester le rendu sur mobile
□ Créer les vrais projets MDX (VLAN, gestion parc, etc.) avec features/previews/process/metrics
□ Traduire le contenu EN
□ Ajouter heroImage aux projets
Bonus
□ Lier le domaine flavino-hack-dev.kdns.fr sur Vercel
□ Ajouter un blog / write-ups
□ Analytics (Plausible/Umami)
□ GitHub Actions CI (lint + build)
📝 Commandes utiles
powershell

# Naviguer

cd D:\fhkdev\portfolio

# Dev

pnpm dev

# Build

pnpm build

# Formater

pnpm format

# Git

git add .
git commit -m "message"
git push
🚀 Où on en est
Portfolio en ligne : ✅
Design macOS : ✅
Terminal interactif : ✅ (Hero + Stages)
Sound taptic : ✅
i18n FR/EN : ✅ (structure prête, contenu à traduire)
Projets MDX : ✅ (schéma prêt, contenu fictif)
Logos SVG technos : ⏳ (TechIcon à recréer)
Erreur build : ⏳ (content.config à corriger)

Copie ce récapitulatif dans un fichier MEMO.md à la racine du projet pour le retrouver après la limite de conversation.

Si on atteint la limite, tu pourras me le coller et je reprendrai exactement où on en est.

Prochaine étape immédiate : corrige le content.config.ts (erreur date) et recrée TechIcon.astro dans D:\fhkdev\portfolio. Envoie-moi le retour de pnpm build pour qu'on enchaîne.

---

### 2026-10-15 � Mise � jour #2

- ? `fhkdev` (header) rendu cliquable ? retour accueil
- ? `MEMO.md` ajout� � la racine du projet (journal de bord)
- ?? Rendre les 3 pastilles macOS cliquables ? retour accueil

### 2026-10-15 � Mise � jour #3 (en cours)

- ? 3 pastilles macOS (rouge/jaune/vert) cliquables ? retour accueil
- ? Effet hover sur les pastilles (magnification + opacit�)

---

_Derni�re mise � jour : 2026-10-15 (3)_

### 2026-10-15 � Mise � jour #4

- ? CSS hover ajout� sur les 3 pastilles macOS (scale + bg glass au survol)
- ? Attribut `title` et `aria-label` pour accessibilit�

### 2026-10-15 � Mise � jour #5

- ? Header.astro reconstruit compl�tement
- ? Menus Fichier / �dition / Affichage fonctionnels (dropdowns + actions)
- ? 3 pastilles macOS cliquables ? retour accueil
- ? `fhkdev` cliquable ? retour accueil
- ? Widget flux r�seau (canvas double bleu/vert) restaur�
- ? Batterie + Wi-Fi + loupe + son + horloge + FR/EN + th�me restaur�s
- ? Command Palette (Ctrl+K) fonctionnelle
- ? Actions �dition : Basculer th�me + Copier email (toast)

---

_Derni�re mise � jour : 2026-10-15 (5)_

### 2026-10-15 � Mise � jour #6 : traduction FR/EN
- ? Certifications.astro traduit
- ? Contact.astro traduit
- ? Lab.astro traduit
- ? Writing.astro traduit
- ? Projects.astro traduit
- ? Skills.astro traduit (version simplifi�e, sans grande ic�ne 3D)
- ? Stages.astro traduit (version simplifi�e, sans modale + sans terminal flottant)

?? � FAIRE : r�int�grer la grande ic�ne 3D dans Skills + modale/terminal dans Stages (en gardant la traduction)

---

*Derni�re mise � jour : 2026-10-15 (6)*

### 2026-10-15 � Mise � jour #7 : Restauration Skills + Stages
- ? `Skills.astro` restaur� avec grande ic�ne 3D flottante + fond galaxie + logos SVG
- ? `TechIcon.astro` recr�� (logos SVG : Ubuntu, Docker, Python, Git, Zabbix, pfSense, Kali, Windows, Node.js, PostgreSQL, Bash)
- ? `Stages.astro` restaur� avec timeline + modale d�taill�e
- ? `StagesTerminal.astro` recr�� : terminal flottant avec auto-play, drag, r�duce, ferme, autocomplete
- ? Commandes terminal : help, ls, ls photos, cat stage_N, cat all, open <section>, open stage_N, open photo_N_stage_M, projects, contact, pause, play, clear
- ? Lightbox globale dans BaseLayout pour les photos
- ? Traduction FR/EN int�gr�e dans Skills + Stages

---

*Derni�re mise � jour : 2026-10-15 (7)*

### 2026-10-15 � Mise � jour #8 : Terminal Hero complet
- ? `Terminal.astro` (Hero) refait avec toutes les commandes
- ? Prompt = pomme Apple  (fallback > sur Windows/Linux)
- ? Commandes : help, whoami, skills, projects, contact, cat about, ls, ls photos, cat stage_N, cat all, open <section>, open stage_N, open photo_N_stage_M, pause, play, clear
- ? Auto-play : d�file les stages en boucle
- ? Autocomplete avec Tab
- ? D�pla�able, r�ductible (-), fermable (?)
- ? M�me comportement que le terminal de la section Stages

---

*Derni�re mise � jour : 2026-10-15 (8)*
