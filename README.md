# Template AuditCom

Ce projet est un template pour afficher une liste de rapports PDF et permettre leur téléchargement via un formulaire avec suivi de progression en temps réel.

## 📁 Structure du projet

```
auditcom-template/
├── index.html              # Page principale (MODIFIABLE)
├── css/
│   ├── reset.css          # Reset CSS (ne pas modifier)
│   └── style.css          # Styles personnalisés (MODIFIABLE)
├── src/
│   ├── main.js            # Logique principale (ne pas modifier)
│   ├── templating.js      # Système de templating (ne pas modifier)
│   └── loadTemplate.js    # Chargement des templates (ne pas modifier)
└── templates/
    ├── teamItem.html      # Template pour chaque élément (MODIFIABLE)
    └── messageItem.html   # Template pour les messages (MODIFIABLE)
```

## 🎯 Fichiers modifiables

Vous pouvez modifier **uniquement** les fichiers suivants :
- ✅ `index.html` - Structure de la page principale
- ✅ `css/style.css` - Styles personnalisés
- ✅ `templates/teamItem.html` - Template pour chaque élément de la liste
- ✅ `templates/messageItem.html` - Template pour les messages

**Fichiers à ne pas modifier :**
- ❌ `src/main.js` - Contient la logique de l'application
- ❌ `src/templating.js` - Système de templating
- ❌ `src/loadTemplate.js` - Chargement des templates
- ❌ `css/reset.css` - Reset CSS de base

## 🔧 Configuration de `index.html`

### IDs obligatoires

Ces IDs **doivent absolument être présents** et **ne doivent pas être modifiés** :

```html
<!-- Conteneur pour la liste des éléments -->
<section id="teamList"></section>

<!-- Conteneur pour les messages de succès/erreur -->
<div id="messageContainer"></div>

<!-- Formulaire de téléchargement -->
<form id="downloadForm"></form>
```

### Métadonnées globales

Utilisez `data-bind-global` pour afficher des métadonnées globales :

```html
<!-- Affiche le nombre total de rapports -->
<h1 data-bind-global="count"></h1>
```

**Données disponibles :**
- `count` - Nombre total de rapports

## 🎨 Template `teamItem.html`

Ce template définit la structure de chaque élément PDF dans la liste. Vous pouvez modifier le HTML et ajouter des classes CSS, mais **vous devez conserver les attributs `data-bind`**.

### Attributs disponibles

```html
<template>
  <article>
    <!-- Logo de l'équipe -->
    <img data-bind-attr-src="logoUrl" alt="Logo">
    
    <!-- Nom de l'équipe -->
    <h2 data-bind="teamName"></h2>
    
    <!-- Date de téléversement (formatée automatiquement) -->
    <p data-bind="uploadedAt"></p>
    
    <!-- Auteur du document -->
    <p data-bind="author"></p>
  </article>
</template>
```

**Données disponibles :**
- `logoUrl` - URL complète du logo (construite automatiquement depuis l'API)
- `teamName` - Nom de l'équipe (affiche "—" si non fourni)
- `uploadedAt` - Date de téléversement (formatée automatiquement)
- `author` - Auteur du document PDF

## 💬 Template `messageItem.html`

Ce template définit l'affichage des messages (succès, erreur, chargement) avec barre de progression.

### Structure

```html
<template>
  <aside data-bind-attr-class="messageClass" class="message">
    <p data-bind="message"></p>
    <div class="progress-container" data-bind-attr-style="progressContainerStyle">
      <progress 
        data-bind-attr-value="progressValue" 
        data-bind-attr-max="progressMax" 
        class="progress-bar"
      ></progress>
      <span class="progress-text" data-bind="progressPercent"></span>
    </div>
  </aside>
</template>
```

### Attributs disponibles

- `data-bind="message"` - Texte du message à afficher
- `data-bind-attr-class="messageClass"` - Classe CSS (`success`, `error`, ou `loading`)
- `data-bind-attr-style="progressContainerStyle"` - Style pour afficher/masquer la barre de progression
- `data-bind-attr-value="progressValue"` - Valeur actuelle de progression (en bytes)
- `data-bind-attr-max="progressMax"` - Valeur maximale (Content-Length ou estimation)
- `data-bind="progressPercent"` - Texte de progression (pourcentage ou MB)

### Types de messages

- **`success`** : Fond vert, disparaît automatiquement après 5 secondes
- **`error`** : Fond rouge, reste affiché jusqu'au prochain message
- **`loading`** : Fond bleu, affiche une barre de progression avec pourcentage ou MB téléchargés

### Barre de progression

La barre de progression utilise l'élément HTML5 `<progress>` natif :
- Utilise le header `Content-Length` de la réponse HTTP pour une progression précise
- Affiche un pourcentage si `Content-Length` est disponible
- Affiche les MB téléchargés si `Content-Length` n'est pas disponible
- S'ajuste automatiquement si le fichier dépasse la taille annoncée

## 📝 Formulaire de téléchargement

Le formulaire avec l'ID `downloadForm` est automatiquement connecté à l'API. Ajoutez les champs de obligatoires :

```html
<form id="downloadForm">
    <input type="text" name="lastName" placeholder="Nom">
    <input type="text" name="firstName" placeholder="Prénom">
    <input type="email" name="email" placeholder="Email">
    <input type="checkbox" name="newsletterAgreement" id="consent">
    <label for="consent">J'accepte de recevoir la newsletter</label>
    <button type="submit">Télécharger</button>
</form>
```

**Comportement :**
- Les données sont envoyées en JSON à l'API lors de la soumission
- Le champ `newsletterAgreement` est automatiquement converti en `"true"` ou `"false"`
- Le PDF est téléchargé automatiquement sous le nom `rapport-auditcom.pdf`
- Les messages s'affichent dans `#messageContainer`
- La progression du téléchargement est affichée en temps réel

## 🚀 Démarrage

### ⚠️ Serveur HTTP requis

**Les modules JavaScript ES6 nécessitent un serveur HTTP.** Ne pas ouvrir directement `index.html` avec `file://`.

### Options de serveur

**Option 1 : Live Server (recommandé pour VS Code/Cursor)**
1. Installez l'extension "Live Server" par Ritwick Dey
2. Clic droit sur `index.html` → "Open with Live Server"

**Option 2 : Python**
```bash
python3 -m http.server 8000
```
Puis ouvrez `http://localhost:8000`

**Option 3 : Node.js**
```bash
npx serve -p 8000
```
Puis ouvrez `http://localhost:8000`

## 🔌 API

**Base URL :** `https://auditcom.onrender.com/api`

**Endpoints :**
- `GET /pdfs` - Récupère la liste des PDFs avec métadonnées
- `POST /submit` - Soumet le formulaire et retourne un PDF (streaming avec Content-Length)

## ⚠️ Points d'attention

1. **IDs obligatoires** : `teamList`, `messageContainer`, `downloadForm` doivent être présents dans `index.html`
2. **Attributs `data-bind`** : Conservez les noms exacts des attributs dans les templates
3. **Balise `<template>`** : Chaque template doit contenir une balise `<template>` à la racine
4. **Serveur HTTP** : Utilisez toujours un serveur HTTP local (pas `file://`)
5. **Content-Length** : Le suivi de progression est plus précis si l'API envoie le header `Content-Length`

## 📚 Système de templating

Le système fonctionne automatiquement :

1. **Chargement** : Les templates sont chargés au démarrage
2. **Remplissage global** : `fillGlobals()` remplit les éléments avec `data-bind-global`
3. **Remplissage des items** : `fillTemplate()` remplit chaque élément avec les données de l'API
4. **Insertion** : Les éléments sont ajoutés dans `#teamList`
5. **Messages** : Les messages s'affichent automatiquement dans `#messageContainer`

## 💡 Personnalisation

### Styles CSS

Le fichier `css/style.css` utilise des variables CSS pour faciliter la personnalisation :

```css
:root {
  --color-success-bg: #e8f5e9;
  --color-error-bg: #ffebee;
  --color-loading-bg: #e3f2fd;
  /* ... autres variables */
}
```

Vous pouvez modifier ces variables pour changer les couleurs, espacements, etc.

### Exemple de styles personnalisés

```css
/* Liste des PDFs */
#teamList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 2rem;
}

#teamList article {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}

/* Formulaire */
#downloadForm {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```
