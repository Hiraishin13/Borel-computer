# Borel Computer

E-commerce informatique haut de gamme — Next.js 14 (App Router), TypeScript, Tailwind CSS,
MongoDB/Mongoose, Stripe, NextAuth/JWT, déployé sur Vercel.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run seed                 # crée un admin + produits de démo
npm run dev
```

Ouvrir http://localhost:3000

Admin de démo : `admin@borelcomputer.com` / `admin1234` — page `/admin/dashboard`.

## Scripts

| Commande            | Description                          |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Serveur de développement            |
| `npm run build`     | Build de production                 |
| `npm run start`     | Serveur de production               |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | Vérification TypeScript             |
| `npm run seed`      | Peuple la base (admin + produits)   |

## Architecture

```
src/
├── app/                  # App Router : pages + route handlers
│   ├── (auth)/           # login, signup, forgot-password
│   ├── (shop)/           # products, cart, checkout, confirmation
│   ├── (account)/        # profil, commandes, favoris (auth requise)
│   ├── admin/            # back-office (rôle admin)
│   ├── configurator/     # configurateur PC
│   ├── blog/ · about/ · contact/ · legal/
│   └── api/              # auth, products, orders, cart, wishlists,
│                         # promos, admin, webhooks/stripe
├── components/           # ui/ · layout/ · home/ · product/ · cart/ · admin/ · auth/
├── lib/                  # mongodb, stripe, jwt, auth, email, utils,
│                         # validators (zod), serializers, constants, animations
├── models/               # schémas Mongoose : User, Product, Order, Review, Promo, Cart
├── store/                # Zustand : cart (persist), auth (persist)
├── hooks/                # useProducts (React Query), useIntersection
└── types/                # types partagés
```

### Points clés

- **Auth** : JWT signé côté serveur (`lib/jwt`), stocké dans `localStorage`, vérifié par
  `requireAuth` / `requireAdmin` dans chaque route protégée.
- **Panier** : côté client via Zustand `persist`. Le checkout **recalcule les prix et le stock
  côté serveur** — les montants client ne sont jamais dignes de confiance.
- **Paiement** : **espèces à la livraison**. À la validation, la commande est enregistrée
  (`status: pending`, `paymentMethod: cash`), une **facture PDF unique** est générée côté client
  (jsPDF) sur la page de confirmation, et un lien `wa.me` pré-rempli ouvre WhatsApp avec le
  récapitulatif complet (articles, totaux, coordonnées, adresse). Numéro cible :
  `NEXT_PUBLIC_WHATSAPP_NUMBER`. Le code Stripe (`lib/stripe`, `api/webhooks/stripe`) reste
  présent mais inutilisé.
- **Erreurs API** : format unique `{ error: { code, message, details? } }` via `lib/api-response`.
- **SEO** : `sitemap.ts`, `robots.ts`, metadata dynamiques, Open Graph.
- **Configurateur** (`/configurator`) : piloté par le catalogue réel
  (`/api/configurator` regroupe les produits `category: composants` par slot). Filtre par marque,
  choix du modèle, sélection de finition (variante « Couleur »). `src/lib/configurator.ts` vérifie
  en temps réel socket CPU↔carte mère, type mémoire, dimensionnement de l'alimentation et estime
  la consommation. Ajout de toute la config au panier (+ service `SVC-ASSEMBLAGE`) et export devis
  PDF (`src/lib/config-sheet.ts`).

## Déploiement Vercel

1. Pousser le repo sur GitHub, importer sur Vercel.
2. Renseigner les variables d'environnement (voir `.env.example`).
3. Configurer le webhook Stripe vers `https://<domaine>/api/webhooks/stripe`
   (événements `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`).
4. `regions` est fixé à `cdg1` (Paris) dans `vercel.json`.

## Reste à faire

- CRUD produits complet dans l'admin (formulaire + upload Vercel Blob)
- Pages `account/orders/[id]`, `reset-password`, avis produits (UI)
- Tests (unitaires + e2e) et rate limiting
- Renseigner `NEXT_PUBLIC_WHATSAPP_NUMBER` avec le vrai numéro de la boutique
