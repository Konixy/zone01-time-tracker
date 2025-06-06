# Zone01 Time Tracker - Guide d'Installation

## 📦 Méthodes d'Installation

### Méthode 1 : Charger l'Extension Non Empaquetée (Recommandée)

1. **Télécharger les Fichiers de l'Extension**

   - Téléchargez tous les fichiers : `manifest.json`, `content.js`, `README.md`
   - Placez-les dans un dossier (ex: `zone01-time-tracker`)

2. **Activer le Mode Développeur**

   - Ouvrez Chrome et allez sur `chrome://extensions/`
   - Activez "Mode développeur" (coin supérieur droit)

3. **Charger l'Extension**
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier contenant les fichiers de l'extension
   - L'extension devrait apparaître dans votre liste d'extensions

### Méthode 2 : Créer et Installer un Fichier .crx

1. **Empaqueter l'Extension**

   - Allez sur `chrome://extensions/`
   - Activez "Mode développeur"
   - Cliquez sur "Empaqueter l'extension"
   - Sélectionnez le dossier de l'extension
   - Cliquez sur "Empaqueter l'extension" (laissez le champ clé privée vide)
   - Cela crée un fichier `.crx`

2. **Installer le Fichier .crx**
   - Glissez le fichier `.crx` dans la page `chrome://extensions/`
   - Cliquez sur "Ajouter l'extension" quand demandé

## 🔧 Résolution des Problèmes Courants

### Problème 1 : Chrome Bloque les Téléchargements

**Solution :**

1. **Désactiver temporairement l'antivirus/sécurité**
2. **Télécharger depuis une source fiable** (GitHub, partage direct)
3. **Utiliser un autre navigateur** temporairement (Edge, Firefox) pour télécharger
4. **Compresser les fichiers** en .zip et télécharger ça à la place

### Problème 2 : "Cette extension pourrait être corrompue"

**Solution :**

1. **Vérifier l'intégrité des fichiers :**

   - S'assurer que `manifest.json` est un JSON valide
   - Vérifier que tous les fichiers sont présents
   - Vérifier l'encodage des fichiers (doit être UTF-8)

2. **Retélécharger les fichiers :**
   - Obtenir de nouvelles copies de tous les fichiers de l'extension
   - S'assurer qu'aucun fichier n'est tronqué ou corrompu

### Problème 3 : "Échec du chargement de l'extension"

**Solution :**

1. **Vérifier la structure du dossier :**

   ```
   zone01-time-tracker/
   ├── manifest.json
   ├── content.js
   └── README.md
   ```

2. **Vérifier la validité de manifest.json :**
   - Utiliser un validateur JSON (jsonlint.com)
   - S'assurer du bon formatage

### Problème 4 : Chrome N'Autorise Pas l'Installation

**Solutions :**

1. **Chrome Entreprise/Géré :**

   - Contacter l'administrateur IT
   - Demander l'autorisation d'installer des extensions
   - Utiliser Chrome Canary ou Chromium à la place

2. **Politiques Chrome :**

   - Vérifier `chrome://policy/` pour les restrictions
   - Essayer Chrome en mode incognito (ne marchera pas mais confirme les politiques)

3. **Installation Alternative :**
   - Utiliser Microsoft Edge (basé sur Chromium, même extension fonctionne)
   - Essayer Chrome Beta ou Chrome Canary

## 🛡️ Considérations de Sécurité

### Pourquoi Chrome Pourrait la Bloquer

1. **Extension Non Signée :** Pas du Chrome Web Store
2. **Éditeur Inconnu :** Pas de signature de développeur vérifiée
3. **Permissions :** L'extension demande la permission activeTab

### Vérification d'Installation Sûre

1. **Examiner le Code :** Tout le code est visible dans `content.js`
2. **Permissions Limitées :** Seule la permission `activeTab` est demandée
3. **Pas d'Accès Réseau :** L'extension n'envoie aucune donnée nulle part
4. **Domaine Spécifique :** Ne fonctionne que sur `hub.zone01normandie.org`

## 📝 Étapes Détaillées pour les Amis

### Pour l'Ami qui Installe :

1. **Télécharger les Fichiers :**

   - Demander à l'expéditeur de compresser les fichiers en .zip
   - Télécharger et extraire dans un dossier

2. **Configuration Chrome :**

   ```
   1. Ouvrir Chrome
   2. Taper : chrome://extensions/
   3. Activer "Mode développeur" (en haut à droite)
   4. Cliquer "Charger l'extension non empaquetée"
   5. Sélectionner le dossier avec les fichiers de l'extension
   6. Cliquer "Sélectionner le dossier"
   ```

3. **Vérifier l'Installation :**
   - L'extension apparaît dans la liste des extensions
   - Naviguer vers la page d'émargement Zone01
   - Chercher le badge vert "✓ Extension Temps Réel Active"

## 🔍 Méthodes de Distribution Alternatives

### Méthode 1 : Dépôt GitHub

1. Créer un dépôt GitHub
2. Téléverser les fichiers de l'extension
3. Partager le lien du dépôt
4. L'ami peut télécharger en ZIP

### Méthode 2 : Stockage Cloud

1. Téléverser les fichiers sur Google Drive/Dropbox
2. Partager le lien du dossier
3. L'ami télécharge et installe

### Méthode 3 : Email avec Instructions

1. Joindre les fichiers en format .zip
2. Inclure ce guide d'installation
3. Fournir un support étape par étape

## ⚡ Commandes de Réparation Rapide

Si l'installation échoue, essayez ceci dans l'ordre :

1. **Réinitialiser les Extensions Chrome :**

   ```
   chrome://settings/resetProfileSettings
   ```

2. **Vider le Cache Chrome :**

   ```
   chrome://settings/clearBrowserData
   ```

3. **Redémarrer Chrome** complètement

4. **Essayer le Mode Incognito** pour tester

## 📞 Support

Si les problèmes persistent :

1. **Vérifier la Version Chrome :** Doit être récente (v88+)
2. **Essayer un Autre Ordinateur :** Tester si le problème est spécifique au système
3. **Utiliser un Navigateur Alternatif :** Edge, Brave, ou autre basé sur Chromium
4. **Contacter le Support IT :** Si sur un ordinateur géré/entreprise

## ✅ Indicateurs de Succès

L'extension fonctionne quand vous voyez :

- Badge vert "✓ Extension Temps Réel Active"
- Texte "Mises à jour toutes les 10s" sous le badge
- Valeurs de temps vertes dans le tableau d'émargement
- Calculs de temps en direct mis à jour toutes les 10 secondes

---

# Zone01 Time Tracker - Installation Guide (English)

## 📦 Installation Methods

### Method 1: Load Unpacked Extension (Recommended)

1. **Download the Extension Files**

   - Download all files: `manifest.json`, `content.js`, `README.md`
   - Place them in a folder (e.g., `zone01-time-tracker`)

2. **Enable Developer Mode**

   - Open Chrome and go to `chrome://extensions/`
   - Toggle ON "Developer mode" (top right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should appear in your extensions list

### Method 2: Create and Install .crx File

1. **Pack the Extension**

   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Pack extension"
   - Select the extension folder
   - Click "Pack extension" (leave private key field empty)
   - This creates a `.crx` file

2. **Install the .crx File**
   - Drag the `.crx` file into the `chrome://extensions/` page
   - Click "Add extension" when prompted

## 🔧 Troubleshooting Common Issues

### Issue 1: Chrome Blocks Downloads

**Solution:**

1. **Temporarily disable antivirus/security software**
2. **Download from a trusted source** (GitHub, direct share)
3. **Use alternative browsers** temporarily (Edge, Firefox) to download
4. **Compress files** into a .zip and download that instead

### Issue 2: "This extension may be corrupted"

**Solution:**

1. **Check file integrity:**

   - Ensure `manifest.json` is valid JSON
   - Verify all files are present
   - Check file encoding (should be UTF-8)

2. **Re-download files:**
   - Get fresh copies of all extension files
   - Ensure no files are truncated or corrupted

### Issue 3: "Failed to load extension"

**Solution:**

1. **Verify folder structure:**

   ```
   zone01-time-tracker/
   ├── manifest.json
   ├── content.js
   └── README.md
   ```

2. **Check manifest.json validity:**
   - Use JSON validator (jsonlint.com)
   - Ensure proper formatting

### Issue 4: Chrome Won't Allow Installation

**Solutions:**

1. **Enterprise/Managed Chrome:**

   - Contact IT administrator
   - Request permission to install extensions
   - Use Chrome Canary or Chromium instead

2. **Chrome Policies:**

   - Check `chrome://policy/` for restrictions
   - Try Chrome in incognito mode (won't help but confirms policies)

3. **Alternative Installation:**
   - Use Microsoft Edge (Chromium-based, same extension works)
   - Try Chrome Beta or Chrome Canary

## 🛡️ Security Considerations

### Why Chrome Might Block It

1. **Unsigned Extension:** Not from Chrome Web Store
2. **Unknown Publisher:** No verified developer signature
3. **Permissions:** Extension requests activeTab permission

### Safe Installation Verification

1. **Review Code:** All code is visible in `content.js`
2. **Limited Permissions:** Only `activeTab` permission requested
3. **No Network Access:** Extension doesn't send data anywhere
4. **Specific Domain:** Only runs on `hub.zone01normandie.org`

## 📝 Step-by-Step for Friends

### For the Friend Installing:

1. **Download Files:**

   - Ask sender to compress files into .zip
   - Download and extract to a folder

2. **Chrome Setup:**

   ```
   1. Open Chrome
   2. Type: chrome://extensions/
   3. Toggle ON "Developer mode" (top right)
   4. Click "Load unpacked"
   5. Select the folder with extension files
   6. Click "Select Folder"
   ```

3. **Verify Installation:**
   - Extension appears in extensions list
   - Navigate to Zone01 emargement page
   - Look for green "✓ Real-time Extension Active" badge

## 🔍 Alternative Distribution Methods

### Method 1: GitHub Repository

1. Create a GitHub repository
2. Upload extension files
3. Share repository link
4. Friend can download as ZIP

### Method 2: Cloud Storage

1. Upload files to Google Drive/Dropbox
2. Share folder link
3. Friend downloads and installs

### Method 3: Email with Instructions

1. Attach files in .zip format
2. Include this installation guide
3. Provide step-by-step support

## ⚡ Quick Fix Commands

If installation fails, try these in order:

1. **Reset Chrome Extensions:**

   ```
   chrome://settings/resetProfileSettings
   ```

2. **Clear Chrome Cache:**

   ```
   chrome://settings/clearBrowserData
   ```

3. **Restart Chrome** completely

4. **Try Incognito Mode** for testing

## 📞 Support

If issues persist:

1. **Check Chrome Version:** Must be recent (v88+)
2. **Try Different Computer:** Test if issue is system-specific
3. **Use Alternative Browser:** Edge, Brave, or other Chromium-based
4. **Contact IT Support:** If on managed/enterprise computer

## ✅ Success Indicators

Extension is working when you see:

- Green "✓ Real-time Extension Active" badge
- "Updates every 10s" text below badge
- Green time values in the emargement table
- Live time calculations updating every 10 seconds

---

**Besoin d'Aide ?** / **Need Help?** Cette extension ne fait que modifier l'affichage de la page d'émargement Zone01 et n'envoie aucune donnée à l'extérieur. Elle est complètement sûre à utiliser. / This extension only modifies the display of the Zone01 emargement page and doesn't send any data externally. It's completely safe to use.
