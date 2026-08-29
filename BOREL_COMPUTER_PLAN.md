# 🖥️ BOREL COMPUTER - Plan Complet

**Nom du projet :** Borel Computer  
**Type :** E-commerce / Boutique Informatique Haut de Gamme  
**Inspiré de :** Costume International (Design épuré, animations fluides, thème sombre)  
**Déploiement :** Vercel (Frontend + Backend serverless)

---

## 📋 1. ARCHITECTURE GLOBALE

### Stack Technique Recommandée

#### **Frontend**
- **Framework :** Next.js 14+ (React 18)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS v3
- **Animations :** Framer Motion / GSAP
- **State Management :** TanStack Query (React Query) + Zustand
- **HTTP Client :** Axios ou Fetch API
- **Deployment :** Vercel (Native Next.js support)

#### **Backend**
- **Runtime :** Node.js 18+
- **Framework :** Express.js ou Next.js API Routes
- **Base de données :** MongoDB (Cloud) ou PostgreSQL (Vercel Postgres)
- **Authentication :** JWT + NextAuth.js
- **Image Storage :** Vercel Blob Storage ou Cloudinary
- **Email :** Resend ou SendGrid
- **Paiement :** Stripe API

#### **Infrastructure**
- **Hosting :** Vercel (Frontend + API Routes)
- **Database :** MongoDB Atlas (Cloud) ou Vercel Postgres
- **File Storage :** Vercel Blob Storage
- **CDN :** Vercel CDN (Inclus)
- **Analytics :** Vercel Analytics + Posthog

---

## 📄 2. STRUCTURE DES PAGES

### **Pages Principales**

```
1. ACCUEIL (Home)
   ├── Hero Section (Vidéo fond / Carousel)
   ├── CTA Principal (Consultation / Devis)
   ├── Section "Collection Nouvelle"
   ├── Produits Vedettes (4-6 produits)
   ├── Section "Expertise" ou "À propos"
   ├── Testimonials / Galerie
   └── Contact / Newsletter

2. CATALOGUE
   ├── Ordinateurs Gaming
   │   ├── Desktop
   │   ├── Laptops
   │   └── Pré-configurés
   ├── Composants PC
   │   ├── CPU / Processeurs
   │   ├── GPU / Cartes Graphiques
   │   ├── Mémoire (RAM)
   │   ├── SSD / Stockage
   │   └── Alimentations / Refroidissement
   ├── Périphériques
   │   ├── Claviers
   │   ├── Souris
   │   ├── Écrans
   │   ├── Headsets
   │   └── Accessoires
   ├── Logiciels
   ├── Refurbished / Stock Limité
   └── Filtrage & Tri avancés

3. FICHE PRODUIT
   ├── Galerie d'images (Zoom, 360°)
   ├── Infos produit (Nom, Marque, Prix)
   ├── Spécifications techniques
   ├── Description détaillée
   ├── Variantes (Couleur, Taille, Config)
   ├── Stock en temps réel
   ├── Avis clients & Ratings
   ├── Produits similaires (Related)
   ├── Garantie / Retours
   └── Boutons (Ajouter au panier, Comparer)

4. PANIER & CHECKOUT
   ├── Résumé du panier
   ├── Modification quantités
   ├── Codes promo
   ├── Calcul frais de port
   ├── Formulaire livraison
   ├── Paiement sécurisé (Stripe)
   ├── Confirmation commande
   └── Email de confirmation

5. COMPTE CLIENT (Auth Required)
   ├── Profil utilisateur
   ├── Mes commandes
   ├── Suivi colis
   ├── Adresses sauvegardées
   ├── Favoris / Wishlist
   ├── Historique consultation
   ├── Paramètres & Mot de passe
   └── Notifications

6. CONFIGURATION PERSONNALISÉE (Configurateur)
   ├── Sélecteur de composants interactif
   ├── Vérification de compatibilité
   ├── Calcul prix dynamique
   ├── Estimation performances (GPU/CPU)
   ├── Preview visuelle PC
   ├── Aperçu du panier
   └── Export config (PDF)

7. SERVICE CLIENT
   ├── Chat en direct (Widget)
   ├── FAQ
   ├── Guides & Tutoriels
   ├── Formulaire contact
   ├── Statut ticket support
   └── Téléchargement drivers

8. BLOG / ACTUALITÉS
   ├── Articles tech & gaming
   ├── Comparatifs produits
   ├── Guides d'achat
   ├── Catégories d'articles
   └── Search & filtrage

9. À PROPOS
   ├── Histoire de Borel Computer
   ├── Nos valeurs
   ├── Équipe
   ├── Mentions légales
   ├── Politique de confidentialité
   ├── Conditions d'utilisation
   └── Charte de retours

10. TABLEAU DE BORD ADMIN (Privé)
    ├── Gestion produits (CRUD)
    ├── Gestion commandes
    ├── Gestion clients
    ├── Analytics & Statistiques
    ├── Gestion promotions/Codes
    ├── Gestion inventory
    ├── Paramètres boutique
    └── Export données
```

---

## 🎨 3. COMPOSANTS RÉUTILISABLES

### **Composants UI**

```
/components
├── Layout
│   ├── Header.tsx (Navigation + Logo)
│   ├── Navbar.tsx (Menu principal)
│   ├── Footer.tsx
│   ├── Sidebar.tsx (Filtres)
│   └── MobileNav.tsx

├── Product
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductGallery.tsx
│   ├── ProductSpecs.tsx
│   ├── ReviewSection.tsx
│   ├── RatingStars.tsx
│   └── ProductRelated.tsx

├── Cart
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   ├── CartEmpty.tsx
│   └── PromoCode.tsx

├── Forms
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── CheckoutForm.tsx
│   ├── AddressForm.tsx
│   ├── ContactForm.tsx
│   └── FilterForm.tsx

├── Common
│   ├── Button.tsx (Variantes: primary, secondary, ghost)
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Pagination.tsx
│   ├── Breadcrumb.tsx
│   ├── Modal.tsx
│   ├── Toast/Alert.tsx
│   ├── Spinner.tsx
│   ├── SearchBar.tsx
│   ├── Dropdown.tsx
│   └── Tooltip.tsx

├── Hero
│   ├── HeroSection.tsx (Vidéo/Image fond)
│   ├── CarouselHero.tsx
│   ├── CTASection.tsx
│   └── VideoBackground.tsx

├── Sections
│   ├── FeaturedProducts.tsx
│   ├── Testimonials.tsx
│   ├── Newsletter.tsx
│   ├── Stats.tsx
│   └── Category.tsx

└── Admin
    ├── ProductForm.tsx
    ├── OrderTable.tsx
    ├── StatsCard.tsx
    └── DashboardChart.tsx
```

---

## 🗄️ 4. BASE DE DONNÉES - SCHÉMAS

### **MongoDB Collections** (ou PostgreSQL Tables)

#### **Users**
```json
{
  "_id": ObjectId,
  "email": "string (unique)",
  "password": "string (hashed)",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "profileImage": "string (URL)",
  "role": "enum [user, admin]",
  "addresses": [
    {
      "id": "string",
      "type": "enum [shipping, billing]",
      "street": "string",
      "city": "string",
      "postalCode": "string",
      "country": "string",
      "default": "boolean"
    }
  ],
  "wishlist": ["productId1", "productId2"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### **Products**
```json
{
  "_id": ObjectId,
  "sku": "string (unique)",
  "name": "string",
  "description": "string",
  "category": "string",
  "subcategory": "string",
  "price": "number",
  "discountPrice": "number",
  "currency": "string",
  "stock": "number",
  "images": ["url1", "url2", ...],
  "thumbnail": "string (URL)",
  "rating": "number (0-5)",
  "reviews": "number",
  "specifications": {
    "key1": "value1",
    "key2": "value2"
  },
  "variants": [
    {
      "id": "string",
      "name": "string",
      "options": ["option1", "option2"]
    }
  ],
  "warranty": "string",
  "compatibility": ["product_id1", "product_id2"],
  "tags": ["gaming", "laptop"],
  "featured": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### **Orders**
```json
{
  "_id": ObjectId,
  "orderNumber": "string (unique)",
  "userId": "ObjectId",
  "status": "enum [pending, processing, shipped, delivered, cancelled]",
  "items": [
    {
      "productId": "ObjectId",
      "sku": "string",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "variant": "string"
    }
  ],
  "subtotal": "number",
  "shipping": "number",
  "tax": "number",
  "discount": "number",
  "total": "number",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string"
  },
  "paymentMethod": "string",
  "paymentStatus": "enum [pending, completed, failed]",
  "trackingNumber": "string",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### **Reviews**
```json
{
  "_id": ObjectId,
  "productId": "ObjectId",
  "userId": "ObjectId",
  "rating": "number (1-5)",
  "title": "string",
  "comment": "string",
  "images": ["url1", "url2"],
  "helpful": "number",
  "verified": "boolean",
  "createdAt": "timestamp"
}
```

#### **Promos & Coupons**
```json
{
  "_id": ObjectId,
  "code": "string (unique)",
  "type": "enum [percentage, fixed]",
  "value": "number",
  "maxUses": "number",
  "usedCount": "number",
  "validFrom": "timestamp",
  "validUntil": "timestamp",
  "minPurchase": "number",
  "applicableCategories": ["cat1", "cat2"],
  "active": "boolean",
  "createdAt": "timestamp"
}
```

---

## 🎬 5. ANIMATIONS & INTERACTIONS

### **Animations Principale (Inspiré de Costume International)**

```
1. HERO SECTION
   ├── Fade-in au chargement (opacity 0 → 1)
   ├── Parallax scroll sur vidéo de fond
   ├── Texte qui glisse de haut en bas
   ├── CTA button hover effect (scale + shadow)
   └── Scroll indicator animation (pulsing)

2. NAVIGATION
   ├── Smooth scroll sur links
   ├── Active link underline animation
   ├── Mobile menu slide-in depuis la gauche
   ├── Hover effect sur items (color fade)
   └── Dropdown menus animation (height expand)

3. PRODUCT CARDS
   ├── Hover: Scale up + Shadow expansion
   ├── Image zoom au survol
   ├── Price fade-in / discount badge
   ├── Stock indicator animation
   └── Add to cart button slide-in

4. IMAGES & GALERIE
   ├── Lazy loading avec skeleton
   ├── Fade-in progressive
   ├── Zoom au clic (Modal)
   ├── Carousel auto-play
   └── Image transition smooth

5. FORMULAIRES
   ├── Focus state: Border color + glow
   ├── Error animation: Shake + red highlight
   ├── Success state: Green checkmark
   ├── Input label animation (float up)
   └── Button loading spinner

6. SCROLL EFFECTS
   ├── Stagger animation sur listes
   ├── Intersection Observer pour reveal
   ├── Counter animation (0 → 100)
   ├── Progress bar on scroll
   └── Section entrance effects

7. TRANSITIONS PAGES
   ├── Fade out ancien contenu
   ├── Fade in nouveau contenu
   ├── Smooth scroll to top
   └── Page transition duration: 300ms
```

---

## 🎨 6. DESIGN SYSTEM & STYLES

### **Couleurs**
```css
/* Primary Colors (Inspiré Costume International) */
--color-primary: #0a0a0a    /* Noir principal */
--color-secondary: #1a1a1a  /* Gris foncé */
--color-accent: #e50914     /* Rouge/Accent */
--color-light: #f5f5f5      /* Fond clair */
--color-text: #ffffff       /* Texte blanc */
--color-text-secondary: #b0b0b0  /* Texte gris */

/* Semantic Colors */
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
--info: #3b82f6
```

### **Typography**
```css
/* Fonts */
--font-primary: "Inter", sans-serif
--font-secondary: "Playfair Display", serif  /* Pour les titres premium */

/* Sizes */
h1: 48px / font-weight: 700
h2: 36px / font-weight: 700
h3: 28px / font-weight: 600
Body: 16px / font-weight: 400
Small: 14px / font-weight: 400
```

### **Spacing Scale**
```css
8px, 16px, 24px, 32px, 48px, 64px, 96px
```

### **Border Radius**
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 16px
--radius-full: 9999px
```

---

## 📁 7. STRUCTURE PROJET NEXT.js

```
borel-computer/
├── public/
│   ├── images/
│   ├── videos/
│   ├── icons/
│   ├── favicon.ico
│   └── sitemap.xml
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Accueil)
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (shop)/
│   │   │   ├── products/page.tsx
│   │   │   ├── products/[id]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── order-confirmation/page.tsx
│   │   ├── (account)/
│   │   │   ├── profile/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── customers/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── cart/route.ts
│   │   │   ├── checkout/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   └── search/route.ts
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   │
│   ├── components/
│   │   ├── Layout/
│   │   ├── Product/
│   │   ├── Cart/
│   │   ├── Forms/
│   │   ├── Common/
│   │   ├── Hero/
│   │   ├── Sections/
│   │   └── Admin/
│   │
│   ├── lib/
│   │   ├── mongodb.ts (Database connection)
│   │   ├── stripe.ts (Payment)
│   │   ├── auth.ts (NextAuth config)
│   │   ├── api-client.ts (Axios instance)
│   │   ├── utils.ts (Utilities)
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   ├── useIntersection.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── context/
│   │   ├── CartContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── product.ts
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── api.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── animations.css
│   │   ├── tailwind.config.ts
│   │   └── fonts.css
│   │
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── helpers.ts
│
├── .env.local (Secrets)
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 8. DÉPLOIEMENT VERCEL

### **Configuration Vercel**

#### **Variables d'Environnement** (`.env.local`)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/borel
# OU
POSTGRES_PRISMA_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://borelcomputer.vercel.app
NEXTAUTH_SECRET=your_secret_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Email
RESEND_API_KEY=re_xxx

# Image Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Cloudinary (Alternative)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Analytics
NEXT_PUBLIC_GA_ID=G_xxx
POSTHOG_API_KEY=xxx

# API Base URL
NEXT_PUBLIC_API_URL=https://borelcomputer.vercel.app
```

#### **vercel.json**
```json
{
  "buildCommand": "npm run build",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "STRIPE_SECRET_KEY": "@stripe_secret"
  },
  "regions": ["cdg1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### **Étapes de Déploiement**

1. **Créer un repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connecter à Vercel**
   - Aller sur vercel.com → Importer projet
   - Sélectionner le repository GitHub
   - Configurer les variables d'environnement
   - Cliquer "Deploy"

3. **Configuration Post-Déploiement**
   - Configurer domaine personnalisé
   - Activer HTTPS (Automatique)
   - Configurer webhooks (Stripe, etc.)
   - Mettre en place monitoring & analytics

---

## 💰 9. INTÉGRATIONS EXTERNES

### **Services Obligatoires**

| Service | Utilité | Coût |
|---------|---------|------|
| **Stripe** | Paiements sécurisés | 2.9% + 0.30€ |
| **MongoDB Atlas** | Base de données | Gratuit (5GB) → 10$/mois |
| **Vercel** | Hosting | Gratuit → 20$/mois |
| **Resend** | Email transactionnel | Gratuit (100/jour) → 20$/mois |
| **Cloudinary** | Images & CDN | Gratuit → 99$/mois |
| **SendGrid** | Newsletter | Gratuit (100/jour) → 10$/mois |
| **Posthog** | Analytics | Gratuit → 25$/mois |

---

## 🔒 10. SÉCURITÉ & PERFORMANCE

### **Checklist Sécurité**
- [x] HTTPS partout
- [x] CORS configuré correctement
- [x] Rate limiting sur les API
- [x] Validation input (Frontend + Backend)
- [x] Sanitization données (XSS prevention)
- [x] CSRF protection (NextAuth)
- [x] SQL Injection protection (Prisma/Mongoose)
- [x] Secrets env variables
- [x] Authentication JWT + Sessions
- [x] OWASP Top 10 compliance

### **Optimisation Performance**
- Image optimization (Next.js Image)
- Code splitting automatique
- Lazy loading composants
- Minification CSS/JS
- CDN global (Vercel)
- Caching stratégies (ISR, SSG)
- Web Vitals monitoring
- Database indexing

### **SEO**
- Sitemap.xml + robots.txt
- Meta tags dynamiques
- Open Graph
- Structured data (JSON-LD)
- Alt text sur images
- URLs SEO-friendly
- Mobile responsive
- Page speed optimization

---

## 📊 11. ANALYTICS & MONITORING

### **Outils Recommandés**
- **Vercel Analytics** (Performance)
- **Posthog** (Behavior)
- **Google Analytics 4** (Traffic)
- **Sentry** (Error tracking)
- **New Relic** (APM)

### **Métriques à Suivre**
- Conversion rate
- Panier moyen
- Taux abandon panier
- Produit les plus vendus
- Taux satisfaction client
- Temps de chargement
- Taux erreur API

---

## 📱 12. RESPONSIVE & MOBILE

- Design mobile-first
- Breakpoints: 320px, 640px, 768px, 1024px, 1280px
- Touch-friendly buttons (min 44x44px)
- Optimized images for mobile
- Mobile navigation (Hamburger menu)
- Fast loading (< 3s)

---

## 🎯 13. TIMELINE DE DÉVELOPPEMENT

| Phase | Durée | Tâches |
|-------|-------|--------|
| **Phase 1 : Setup** | 1 semaine | Repo, Stack, Design system |
| **Phase 2 : Frontend Core** | 2 semaines | Layout, Pages principales, Composants |
| **Phase 3 : Backend API** | 2 semaines | Auth, Products, Orders, Payments |
| **Phase 4 : Intégrations** | 1 semaine | Stripe, Email, Storage |
| **Phase 5 : Testing** | 1 semaine | Unit tests, E2E, QA |
| **Phase 6 : Déploiement** | 3 jours | Vercel, DNS, Monitoring |
| **Phase 7 : Launch** | Ongoing | Marketing, Analytics, Improvements |

**Total estimé : 6-8 semaines**

---

## 🚦 14. CHECKLIST FINAL

- [ ] Repo GitHub créé
- [ ] Next.js project initialized
- [ ] Database connectée
- [ ] Auth configurée
- [ ] Stripe intégré
- [ ] Email configuré
- [ ] Images optimisées
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] Tests unitaires écrits
- [ ] Tests E2E passés
- [ ] Performance optimisée (LCP < 2.5s)
- [ ] SEO checklist complétée
- [ ] Sécurité validée
- [ ] Déploiement Vercel réussi
- [ ] Domain custom configuré
- [ ] Analytics en place
- [ ] Launch marketing planifiée

---

## 📞 SUPPORT TECHNIQUE

**Pour démarrer :**
1. Créer un repo GitHub
2. Cloner et initialiser le projet
3. Installer dépendances : `npm install`
4. Configurer .env.local
5. Lancer le dev server : `npm run dev`
6. Commencer le développement !

**Questions ? Points de contact :**
- Documentation Next.js: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Stripe API: https://stripe.com/docs
- MongoDB: https://docs.mongodb.com

---

**Dernière mise à jour :** 29 Août 2026  
**Status :** ✅ Prêt pour démarrage
