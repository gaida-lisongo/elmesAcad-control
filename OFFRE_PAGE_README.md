# Page Offre - AIDA Framework

## Vue d'ensemble

La page Offre présente les détails d'un package (offre) en suivant la méthodologie marketing AIDA :

- **A**ttention : Capter l'attention du visiteur
- **I**ntérêt : Susciter l'intérêt avec les fonctionnalités
- **D**ésir : Créer le désir avec les bénéfices
- **A**ction : Appeler à l'action

## Composants créés

### 1. OffreHero (`src/app/components/Offre/OffreHero.tsx`)

**Rôle :** Attention - Première impression percutante

- Affiche le titre, description et prix de l'offre
- Arrière-plan animé avec effets de gradient
- Badges de confiance (Sans engagement, Paiement sécurisé, Support 24/7)
- Bouton CTA principal vers `/#pricing`

### 2. OffreFeatures (`src/app/components/Offre/OffreFeatures.tsx`)

**Rôle :** Intérêt - Présenter les fonctionnalités

- Affiche tous les modules inclus dans le package
- Grille responsive (1/2/3 colonnes selon l'écran)
- Icônes variées et gradients pour chaque module
- Animation au scroll (stagger effect)
- Badge "Inclus" pour chaque module

### 3. OffreBenefits (`src/app/components/Offre/OffreBenefits.tsx`)

**Rôle :** Désir - Montrer la valeur

- Deux colonnes : Bénéfices et Avantages
- Icônes colorées uniques pour chaque item
- Animations de slide depuis gauche/droite
- Banner "Garantie Satisfaction" en bas
- Effets hover sur les cartes

### 4. OffreCTA (`src/app/components/Offre/OffreCTA.tsx`)

**Rôle :** Action - Appeler à l'achat

- Section dédiée pour pousser à l'action
- Bouton "Commander maintenant" vers `/#pricing`
- Points de confiance (Activation immédiate, Paiement sécurisé, Sans engagement)
- Badge d'information avec support 24/7
- Effets d'animation et de glow

### 5. OffreFAQ (`src/app/components/Offre/OffreFAQ.tsx`)

**Rôle :** Lever les objections

- FAQ spécifique au package (basée sur `FAQPackage` schema)
- **Mode Admin** : Ajouter, modifier, supprimer des questions
- Utilise `@headlessui/react` Disclosure pour l'accordéon
- Icônes pour questions et réponses
- Animations de fade-in

**Actions CRUD :**

- Ajouter : Formulaire inline avec question + réponse
- Modifier : Clic sur "Modifier" pour éditer inline
- Supprimer : Confirmation avant suppression

### 6. OffrePartners (`src/app/components/Offre/OffrePartners.tsx`)

**Rôle :** Preuve sociale

- Affiche les logos de tous les clients actifs (`User.role="client"`, `isActive=true`)
- Grille responsive (2/3/4 colonnes)
- Effet grayscale → couleur au hover
- Stats banner avec nombre de clients, satisfaction, rétention
- Glow effect sur les cartes au hover

## Actions serveur (`src/lib/actions/offre-actions.ts`)

### `getFAQByPackage(packageId: string)`

Récupère les questions FAQ pour un package spécifique.

```typescript
const faqResult = await getFAQByPackage(packageId);
const faqItems = faqResult.data?.faqItems || [];
```

### `createOrUpdateFAQ(packageId, faqItems[])`

Crée ou met à jour les questions FAQ d'un package.

```typescript
await createOrUpdateFAQ(packageId, [{ question: "...", answer: "..." }]);
```

### `deleteFAQItem(packageId, questionIndex)`

Supprime une question FAQ par son index.

```typescript
await deleteFAQItem(packageId, 0); // Supprime la première question
```

### `getClients()`

Récupère tous les clients actifs avec leur logo.

```typescript
const clientsResult = await getClients();
const clients = clientsResult.data || [];
```

## Page principale (`src/app/(site)/offre/[slug]/page.tsx`)

Structure de la page :

```tsx
<OffrePage>
  <OffreHero /> {/* 1. ATTENTION */}
  <OffreFeatures /> {/* 2. INTÉRÊT */}
  <OffreBenefits /> {/* 3. DÉSIR */}
  <OffreCTA /> {/* 4. ACTION */}
  <OffreFAQ /> {/* 5. OBJECTIONS */}
  <OffrePartners /> {/* 6. PREUVE SOCIALE */}
</OffrePage>
```

## Design System

### Couleurs et Gradients

- Primary: `bg-primary`, `text-primary`
- Gradients: `from-{color}-500/20 to-{color}-600/20`
- 8 variations de couleurs pour les cartes

### Animations

```css
@keyframes slide-up {
  /* translateY(-20px → 0) */
}
@keyframes fade-in {
  /* opacity 0 → 1 */
}
@keyframes bounce-slow {
  /* translateY animation */
}
```

### Effets Hover

- `hover:scale-105` - Agrandissement léger
- `hover:shadow-xl` - Ombre prononcée
- `hover:bg-primary/90` - Changement de couleur
- Glow effects avec `blur-xl`

### Icônes (Iconify)

Namespace : `mdi:`

- Tailles : 16px (inline), 20-24px (badges), 28-32px (features), 40px+ (heroes)

### Dark Mode

Tous les composants supportent le dark mode :

- `dark:bg-darkmode`
- `dark:text-white`
- `dark:border-darkborder`

## Schema FAQPackage

```typescript
{
  packageId: ObjectId, // Référence au Package
  faqItems: [{
    question: string,
    answer: string
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Permissions Admin

Les administrateurs peuvent :

- ✅ Ajouter des questions FAQ
- ✅ Modifier des questions existantes
- ✅ Supprimer des questions
- ✅ Voir le bouton CTA comme tous les visiteurs

Les clients/visiteurs peuvent :

- ✅ Voir toutes les sections
- ✅ Cliquer sur le CTA vers pricing
- ❌ Ne peuvent PAS modifier les FAQ

## Routes et Liens

- **Page Offre** : `/offre/[packageId]`
- **CTA Button** : Redirige vers `/#pricing` (section pricing de la home)
- **API FAQ** : Utilise server actions (pas de route API directe)

## Responsive Design

- **Mobile** (< 768px) : 1 colonne partout
- **Tablet** (768px - 1024px) : 2 colonnes pour features/benefits
- **Desktop** (> 1024px) : 3-4 colonnes selon la section

## Exemple d'utilisation

```tsx
// Naviguer vers une offre
<Link href={`/offre/${package._id}`}>Voir l'offre</Link>

// La page charge automatiquement :
// - Les détails du package
// - Les FAQ spécifiques
// - Les logos des clients
// - Le statut admin de l'utilisateur
```

## Performance

- **Server-side rendering** : Toutes les données chargées côté serveur
- **Serialization** : Utilisation de `.lean()` + `JSON.parse(JSON.stringify())`
- **Animations** : CSS pures (pas de JS runtime)
- **Images** : Next.js Image avec lazy loading

## Tests suggérés

1. ✅ Vérifier l'affichage sans FAQ (faqItems = [])
2. ✅ Vérifier l'affichage sans clients (clients = [])
3. ✅ Tester les CRUD FAQ en mode admin
4. ✅ Vérifier le lien CTA vers `/#pricing`
5. ✅ Tester le responsive sur mobile/tablet
6. ✅ Vérifier le dark mode

## Dépendances

- `@iconify/react` - Icônes
- `@headlessui/react` - Disclosure (accordéon FAQ)
- `next-auth` - Authentification admin
- `mongoose` - Base de données

Aucune dépendance additionnelle requise ! ✅
