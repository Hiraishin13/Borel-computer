# 🔌 BOREL COMPUTER - Architecture API

## Endpoints API RESTful

### **Base URL**
```
Production: https://api.borelcomputer.vercel.app/api
Development: http://localhost:3000/api
```

---

## 🔐 AUTHENTICATION

### POST `/auth/register`
Enregistrement utilisateur
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont"
}

Response: 201
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "Jean",
  "token": "jwt_token_here"
}
```

### POST `/auth/login`
Connexion utilisateur
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200
{
  "id": "user_123",
  "email": "user@example.com",
  "token": "jwt_token_here",
  "role": "user"
}
```

### POST `/auth/logout`
Déconnexion (Auth Required)
```
Response: 200 { "message": "Logged out successfully" }
```

### POST `/auth/refresh-token`
Renouveler token JWT
```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response: 200
{
  "token": "new_jwt_token"
}
```

### POST `/auth/forgot-password`
Réinitialiser mot de passe
```json
Request:
{
  "email": "user@example.com"
}

Response: 200
{
  "message": "Email envoyé avec instructions"
}
```

### POST `/auth/reset-password`
Confirmer réinitialisation
```json
Request:
{
  "token": "reset_token_from_email",
  "newPassword": "NewPass123"
}

Response: 200
{
  "message": "Mot de passe mis à jour"
}
```

---

## 👤 USERS

### GET `/users/me` (Auth Required)
Profil courant
```
Response: 200
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33 6 XX XX XX XX",
  "profileImage": "https://...",
  "role": "user",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

### PATCH `/users/me` (Auth Required)
Mettre à jour profil
```json
Request:
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33 6 XX XX XX XX",
  "profileImage": "base64_image_or_url"
}

Response: 200 { "message": "Profil mis à jour" }
```

### POST `/users/me/addresses` (Auth Required)
Ajouter adresse
```json
Request:
{
  "type": "shipping",
  "street": "123 Rue de Paris",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "default": true
}

Response: 201
{
  "id": "addr_123",
  "type": "shipping",
  "street": "123 Rue de Paris",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

### GET `/users/me/addresses` (Auth Required)
Lister adresses
```
Response: 200
[
  {
    "id": "addr_123",
    "type": "shipping",
    "street": "123 Rue de Paris",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "default": true
  }
]
```

### DELETE `/users/me/addresses/:id` (Auth Required)
Supprimer adresse
```
Response: 200 { "message": "Adresse supprimée" }
```

---

## 📦 PRODUCTS

### GET `/products`
Lister produits avec filtrage
```
Query Parameters:
?category=gaming
?subcategory=laptops
?sortBy=price
?order=asc
?page=1
&limit=20
&search=RTX
&minPrice=1000
&maxPrice=5000

Response: 200
{
  "data": [
    {
      "id": "prod_123",
      "sku": "RTX4090-001",
      "name": "NVIDIA GeForce RTX 4090",
      "description": "Carte graphique haute performance...",
      "category": "Composants",
      "price": 1899.99,
      "discountPrice": 1699.99,
      "stock": 15,
      "rating": 4.8,
      "reviews": 234,
      "thumbnail": "https://...",
      "images": ["https://...", "https://..."],
      "featured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### GET `/products/:id`
Détails produit
```
Response: 200
{
  "id": "prod_123",
  "sku": "RTX4090-001",
  "name": "NVIDIA GeForce RTX 4090",
  "description": "Description détaillée...",
  "category": "Composants",
  "subcategory": "GPU",
  "price": 1899.99,
  "discountPrice": 1699.99,
  "currency": "EUR",
  "stock": 15,
  "images": [
    "https://...",
    "https://...",
    "https://..."
  ],
  "specifications": {
    "Memory": "24GB GDDR6X",
    "Architecture": "Ada",
    "Power Consumption": "450W",
    "Interface": "PCI-E 4.0"
  },
  "variants": [
    {
      "id": "var_123",
      "name": "Couleur",
      "options": ["Black", "White"]
    }
  ],
  "warranty": "3 years",
  "rating": 4.8,
  "reviews": 234,
  "compatibility": ["prod_124", "prod_125"],
  "tags": ["gaming", "4k", "high-end"],
  "createdAt": "2026-01-15T10:30:00Z"
}
```

### GET `/products/:id/reviews`
Avis produit
```
Query Parameters:
?page=1
&limit=10
&sortBy=recent

Response: 200
{
  "data": [
    {
      "id": "review_123",
      "userId": "user_456",
      "userName": "Jean D.",
      "rating": 5,
      "title": "Excellent rapport qualité-prix",
      "comment": "Très satisfait de mon achat...",
      "images": ["https://..."],
      "verified": true,
      "helpful": 23,
      "createdAt": "2026-01-20T14:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 234 }
}
```

### POST `/products/:id/reviews` (Auth Required)
Ajouter avis
```json
Request:
{
  "rating": 5,
  "title": "Excellent produit",
  "comment": "Très satisfait...",
  "images": ["base64_image_1", "base64_image_2"]
}

Response: 201
{
  "id": "review_789",
  "rating": 5,
  "title": "Excellent produit",
  "comment": "Très satisfait...",
  "verified": false,
  "createdAt": "2026-01-22T10:00:00Z"
}
```

### GET `/products/search`
Recherche produits
```
Query Parameters:
?q=RTX
&category=GPU

Response: 200
{
  "data": [
    {
      "id": "prod_123",
      "name": "NVIDIA GeForce RTX 4090",
      "price": 1899.99,
      "thumbnail": "https://..."
    }
  ],
  "total": 15,
  "time": 0.234
}
```

### POST `/products` (Auth Admin)
Créer produit
```json
Request:
{
  "sku": "RTX4090-001",
  "name": "NVIDIA GeForce RTX 4090",
  "description": "Description...",
  "category": "Composants",
  "subcategory": "GPU",
  "price": 1899.99,
  "stock": 15,
  "images": ["url1", "url2"],
  "specifications": { "Memory": "24GB" }
}

Response: 201 { "id": "prod_123", ... }
```

### PATCH `/products/:id` (Auth Admin)
Mettre à jour produit
```json
Request:
{
  "name": "Nouveau nom",
  "price": 1799.99,
  "stock": 20
}

Response: 200 { "message": "Produit mis à jour" }
```

### DELETE `/products/:id` (Auth Admin)
Supprimer produit
```
Response: 200 { "message": "Produit supprimé" }
```

---

## 🛒 CART

### GET `/cart` (Auth Required)
Récupérer panier
```
Response: 200
{
  "id": "cart_123",
  "userId": "user_123",
  "items": [
    {
      "id": "cart_item_1",
      "productId": "prod_123",
      "name": "RTX 4090",
      "price": 1699.99,
      "quantity": 1,
      "variant": "Black",
      "image": "https://..."
    }
  ],
  "subtotal": 1699.99,
  "tax": 289.98,
  "shipping": 0,
  "total": 1989.97,
  "couponCode": "WELCOME10",
  "discount": 169.99,
  "createdAt": "2026-01-22T10:00:00Z"
}
```

### POST `/cart/items` (Auth Required)
Ajouter au panier
```json
Request:
{
  "productId": "prod_123",
  "quantity": 1,
  "variant": "Black"
}

Response: 201
{
  "id": "cart_item_1",
  "productId": "prod_123",
  "name": "RTX 4090",
  "quantity": 1
}
```

### PATCH `/cart/items/:itemId` (Auth Required)
Mettre à jour quantité
```json
Request:
{
  "quantity": 2
}

Response: 200
{
  "id": "cart_item_1",
  "quantity": 2,
  "total": 3399.98
}
```

### DELETE `/cart/items/:itemId` (Auth Required)
Supprimer du panier
```
Response: 200 { "message": "Article supprimé" }
```

### POST `/cart/clear` (Auth Required)
Vider panier
```
Response: 200 { "message": "Panier vidé" }
```

### POST `/cart/apply-coupon` (Auth Required)
Appliquer code promo
```json
Request:
{
  "code": "WELCOME10"
}

Response: 200
{
  "code": "WELCOME10",
  "discount": 169.99,
  "newTotal": 1819.98
}
```

---

## 💳 ORDERS

### POST `/orders/checkout` (Auth Required)
Créer commande et paiement
```json
Request:
{
  "shippingAddressId": "addr_123",
  "billingAddressId": "addr_123",
  "shippingMethod": "express",
  "paymentMethod": "stripe",
  "paymentToken": "pm_stripe_token"
}

Response: 201
{
  "orderId": "order_123",
  "orderNumber": "ORD-2026-001234",
  "status": "processing",
  "paymentStatus": "completed",
  "total": 1989.97,
  "clientSecret": "pi_stripe_secret"
}
```

### GET `/orders` (Auth Required)
Lister commandes utilisateur
```
Query Parameters:
?status=completed
&page=1
&limit=10

Response: 200
{
  "data": [
    {
      "id": "order_123",
      "orderNumber": "ORD-2026-001234",
      "status": "delivered",
      "total": 1989.97,
      "itemCount": 1,
      "createdAt": "2026-01-20T10:30:00Z",
      "estimatedDelivery": "2026-01-27"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 5 }
}
```

### GET `/orders/:id` (Auth Required)
Détails commande
```
Response: 200
{
  "id": "order_123",
  "orderNumber": "ORD-2026-001234",
  "status": "delivered",
  "items": [
    {
      "productId": "prod_123",
      "name": "RTX 4090",
      "sku": "RTX4090-001",
      "price": 1699.99,
      "quantity": 1
    }
  ],
  "subtotal": 1699.99,
  "tax": 289.98,
  "shipping": 0,
  "discount": 0,
  "total": 1989.97,
  "shippingAddress": { ... },
  "tracking": {
    "carrier": "DPD",
    "trackingNumber": "1234567890",
    "status": "delivered",
    "estimatedDelivery": "2026-01-27"
  },
  "paymentStatus": "completed",
  "createdAt": "2026-01-20T10:30:00Z",
  "updatedAt": "2026-01-27T14:30:00Z"
}
```

### POST `/orders/:id/cancel` (Auth Required)
Annuler commande
```
Response: 200
{
  "id": "order_123",
  "status": "cancelled",
  "refund": { "amount": 1989.97, "status": "processing" }
}
```

### POST `/orders/:id/return` (Auth Required)
Demander retour
```json
Request:
{
  "reason": "Défaut produit",
  "comment": "Produit arrive défectueux...",
  "images": ["base64_image_1"]
}

Response: 201
{
  "returnId": "return_123",
  "status": "pending",
  "shippingLabel": "https://..."
}
```

---

## 🎁 WISHLISTS

### GET `/wishlists` (Auth Required)
Récupérer favoris
```
Response: 200
{
  "data": [
    {
      "id": "prod_123",
      "name": "RTX 4090",
      "price": 1699.99,
      "image": "https://...",
      "addedAt": "2026-01-20T10:30:00Z"
    }
  ],
  "total": 3
}
```

### POST `/wishlists` (Auth Required)
Ajouter aux favoris
```json
Request:
{
  "productId": "prod_123"
}

Response: 201
{
  "id": "prod_123",
  "addedAt": "2026-01-22T10:00:00Z"
}
```

### DELETE `/wishlists/:productId` (Auth Required)
Supprimer des favoris
```
Response: 200 { "message": "Supprimé des favoris" }
```

---

## 🎟️ PROMOTIONS

### GET `/promos`
Lister promotions actives
```
Response: 200
{
  "data": [
    {
      "code": "WELCOME10",
      "type": "percentage",
      "value": 10,
      "description": "10% sur première commande",
      "validUntil": "2026-12-31",
      "minPurchase": 100
    }
  ],
  "total": 5
}
```

### POST `/promos/validate` 
Valider code promo
```json
Request:
{
  "code": "WELCOME10",
  "cartTotal": 1500
}

Response: 200
{
  "valid": true,
  "type": "percentage",
  "value": 10,
  "discount": 150,
  "message": "Code appliqué"
}
```

---

## 📊 ADMIN DASHBOARD

### GET `/admin/dashboard/stats` (Auth Admin)
Statistiques principales
```
Response: 200
{
  "revenue": {
    "total": 45230.50,
    "month": 12350.75,
    "growth": 15.2
  },
  "orders": {
    "total": 234,
    "pending": 12,
    "completed": 200,
    "cancelled": 22
  },
  "customers": {
    "total": 156,
    "new": 23,
    "active": 98
  },
  "products": {
    "total": 450,
    "outOfStock": 5,
    "lowStock": 23
  }
}
```

### GET `/admin/orders` (Auth Admin)
Lister toutes commandes
```
Query Parameters:
?status=pending
&page=1
&limit=20
&sortBy=createdAt

Response: 200
{
  "data": [
    {
      "id": "order_123",
      "orderNumber": "ORD-2026-001234",
      "customer": "Jean D.",
      "total": 1989.97,
      "status": "processing",
      "paymentStatus": "completed",
      "createdAt": "2026-01-20T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### PATCH `/admin/orders/:id` (Auth Admin)
Mettre à jour statut commande
```json
Request:
{
  "status": "shipped",
  "trackingNumber": "1234567890",
  "carrier": "DPD"
}

Response: 200 { "message": "Commande mise à jour" }
```

### GET `/admin/inventory` (Auth Admin)
Gestion stock
```
Query Parameters:
?status=lowStock
&page=1

Response: 200
{
  "data": [
    {
      "id": "prod_123",
      "sku": "RTX4090-001",
      "name": "RTX 4090",
      "stock": 3,
      "warning": true
    }
  ]
}
```

### POST `/admin/promos` (Auth Admin)
Créer promotion
```json
Request:
{
  "code": "SUMMER50",
  "type": "percentage",
  "value": 50,
  "maxUses": 100,
  "validFrom": "2026-06-01",
  "validUntil": "2026-08-31",
  "minPurchase": 100,
  "applicableCategories": ["GPU", "CPU"]
}

Response: 201 { "id": "promo_123", ... }
```

---

## ⚠️ ERROR RESPONSES

### Standard Error Format
```json
400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": [
      {
        "field": "email",
        "message": "Email invalide"
      }
    ]
  }
}

401 Unauthorized
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Token invalide ou expiré"
  }
}

403 Forbidden
{
  "error": {
    "code": "PERMISSION_ERROR",
    "message": "Accès refusé"
  }
}

404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Ressource non trouvée"
  }
}

409 Conflict
{
  "error": {
    "code": "CONFLICT",
    "message": "Email déjà utilisé"
  }
}

500 Server Error
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Erreur serveur interne"
  }
}
```

---

## 🔑 AUTHENTICATION HEADER

Pour toutes les requêtes protégées, inclure :
```
Authorization: Bearer <jwt_token>
```

---

## 📝 RATE LIMITING

- **Unauthenticated:** 100 req/hour
- **Authenticated:** 1000 req/hour
- **Admin:** 5000 req/hour

Réponse when rate limited:
```json
429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Trop de requêtes. Réessayez dans 60 secondes",
    "retryAfter": 60
  }
}
```

---

## 🔄 WEBHOOK EVENTS

### POST `/webhooks/stripe`
Événements Stripe
```json
{
  "type": "charge.succeeded",
  "data": { ... }
}
```

### POST `/webhooks/orders`
Notifications commande
```json
{
  "event": "order.shipped",
  "orderId": "order_123",
  "timestamp": "2026-01-22T10:00:00Z"
}
```

---

**Dernière mise à jour :** 29 Août 2026
