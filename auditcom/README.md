# Template AuditCom

Ce projet est un template pour afficher une liste de rapports PDF et permettre leur téléchargement via un formulaire.

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

## 🎯 Utilisation

### Fichiers modifiables

Vous pouvez modifier **uniquement** les fichiers suivants :
- ✅ `index.html` - Structure de la page principale
- ✅ `css/style.css` - Styles personnalisés
- ✅ `templates/teamItem.html` - Template pour chaque élément de la liste
- ✅ `templates/messageItem.html` - Template pour les messages de succès/erreur

### Fichiers à ne pas modifier

- ❌ `src/main.js` - Contient la logique de l'application
- ❌ `src/templating.js` - Système de templating
- ❌ `src/loadTemplate.js` - Chargement des templates
- ❌ `css/reset.css` - Reset CSS de base

## 🔧 Règles importantes pour `index.html`

### IDs obligatoires

Ces IDs **doivent absolument être présents** et **ne doivent pas être modifiés** :

```html
<!-- Conteneur pour la liste des éléments -->
<section id="teamList">
</section>

<!-- Conteneur pour les messages de succès/erreur -->
<div id="messageContainer"></div>

<!-- Formulaire de téléchargement -->
<form id="downloadForm">
</form>
```

### Attributs `data-bind-global`

Utilisez `data-bind-global` pour afficher des métadonnées globales :

```html
<!-- Affiche le nombre total de rapports -->
<h1 data-bind-global="count"></h1>
```

**Données disponibles :**
- `count` - Nombre total de rapports

## 🎨 Personnalisation du template (`templates/teamItem.html`)

Le template `teamItem.html` définit la structure de chaque élément de la liste. Vous pouvez modifier le HTML et ajouter des classes CSS, mais **vous devez conserver les attributs `data-bind`**.

### Attributs `data-bind` disponibles

```html
<template>
  <article>
    <!-- Nom de l'équipe -->
    <h2 data-bind="teamName"></h2>
    
    <!-- Titre du document PDF -->
    <p data-bind="title"></p>
    
    <!-- Date de téléversement formatée -->
    <p data-bind="uploadedAt"></p>
  </article>
</template>
```

**Données disponibles pour chaque élément :**
- `teamName` - Nom de l'équipe
- `title` - Titre du document PDF
- `uploadedAt` - Date de téléversement (formatée automatiquement)

## 💬 Système de messages (`templates/messageItem.html`)

Le template `messageItem.html` définit l'affichage des messages de succès et d'erreur lors de la soumission du formulaire.

### Structure du template

```html
<template>
  <div data-bind-attr-class="messageClass" class="message">
    <p data-bind="message"></p>
  </div>
</template>
```

### Attributs disponibles

- `data-bind="message"` - Le texte du message à afficher
- `data-bind-attr-class="messageClass"` - La classe CSS ajoutée (`success` ou `error`)

### Comportement

- **Messages de succès** : Affichés après un téléchargement réussi ("PDF téléchargé avec succès !")
- **Messages d'erreur** : Affichés en cas d'échec ("Le formulaire contient des champs invalides")
- **Auto-disparition** : Les messages de succès disparaissent automatiquement après 5 secondes
- **Messages d'erreur** : Restent affichés jusqu'à la prochaine soumission

### Personnalisation des styles

Vous pouvez personnaliser l'apparence des messages dans `css/style.css` :

```css
.message {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
```

## 📝 Formulaire de téléchargement

Le formulaire avec l'ID `downloadForm` est automatiquement connecté à l'API. Vous pouvez ajouter n'importe quels champs de formulaire :

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

**Important :** 
- Les données du formulaire sont automatiquement envoyées à l'API lors de la soumission
- Le serveur retourne un PDF qui sera téléchargé automatiquement sous le nom `rapport-auditcom.pdf`
- Le champ `newsletterAgreement` est automatiquement converti en "true" ou "false"
- Les messages de succès/erreur s'affichent automatiquement dans `#messageContainer`

## 🚀 Démarrage

### ⚠️ Important : Extension Live Server requise

**Le Live Preview intégré de VS Code/Cursor ne fonctionne pas avec les modules JavaScript ES6.** Vous devez installer l'extension **Live Server** pour prévisualiser le projet.

**Installation de Live Server :**
1. Ouvrez VS Code/Cursor
2. Allez dans l'onglet Extensions (ou appuyez sur `Cmd+Shift+X` sur Mac / `Ctrl+Shift+X` sur Windows/Linux)
3. Recherchez "Live Server" par Ritwick Dey
4. Cliquez sur "Installer"

### Servir les fichiers avec un serveur HTTP local

Une fois Live Server installé, vous avez plusieurs options :

**Option 1 : Live Server (recommandé pour VS Code)**
- Clic droit sur `index.html` dans l'explorateur de fichiers
- Sélectionnez **"Open with Live Server"**
- La page s'ouvrira automatiquement dans votre navigateur

**Option 2 : Python**
```bash
python3 -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur

**Option 3 : Node.js (npx)**
```bash
npx serve -p 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur

### Ouvrir dans le navigateur

- Accédez à `http://localhost:8000` (ou le port configuré)
- La page chargera automatiquement les données depuis l'API

## 🔌 API

Le projet se connecte automatiquement à l'API suivante :

- **Base URL :** `https://auditcom.onrender.com/api`
- **Endpoints :**
  - `GET /pdfs` - Récupère la liste des PDFs
  - `POST /submit` - Soumet le formulaire et retourne un PDF

## ⚠️ Points d'attention

1. **Ne modifiez pas les IDs** `teamList`, `messageContainer` et `downloadForm` dans `index.html`
2. **Conservez les attributs `data-bind`** dans les templates avec les noms exacts
3. **Utilisez un serveur HTTP** - Ne pas ouvrir directement `index.html` avec `file://` car les modules ES6 nécessitent un serveur
4. **Les templates doivent contenir une balise `<template>`** à la racine
5. **Le conteneur `messageContainer`** doit être présent pour afficher les messages

## 📚 Système de templating

Le système de templating fonctionne automatiquement :

1. **Chargement** : Les templates `teamItem.html` et `messageItem.html` sont chargés au démarrage
2. **Remplissage global** : `fillGlobals()` remplit les éléments avec `data-bind-global`
3. **Remplissage des items** : `fillTemplate()` remplit chaque élément de la liste avec les données de l'API
4. **Insertion** : Les éléments remplis sont ajoutés dans `#teamList`
5. **Messages** : Les messages sont affichés automatiquement dans `#messageContainer` lors de la soumission du formulaire

Vous n'avez pas besoin de modifier le JavaScript - tout est automatique !

## 💡 Exemples de personnalisation

### Styles pour la liste dans `css/style.css`

```css
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
```

### Styles pour le formulaire dans `css/style.css`

```css
#downloadForm {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

### Styles pour les messages dans `css/style.css`

```css
#messageContainer {
    max-width: 500px;
    margin: 1rem auto;
}

.message {
    padding: 1rem;
    border-radius: 4px;
    font-weight: 500;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
```
