# `/public/brand/` — assets brand TalentRank

## Fichiers attendus

| Fichier | Usage | Format requis |
|---|---|---|
| `figure.png` | Silhouette officielle (tête + 2 ailes) | PNG transparent, min 512×512, ratio ~1:1.05 |
| `figure-light.png` | Variante blanche+orange pour fond bleu/sombre | idem |
| `figure-on-orange.png` | Variante blanche+bleue pour fond orange | idem |

Tous les fichiers PNG **doivent avoir un fond transparent**.

## Comment ajouter ton vrai logo

### Étape 1 — Récupérer l'image

Depuis la charte officielle générée par Nadia/ChatGPT, télécharge l'image du logo principal en haute résolution (clic-droit → Enregistrer l'image).

### Étape 2 — Isoler la silhouette (sans le texte)

Si l'image téléchargée contient le wordmark "TalentRank" et la baseline, il faut les retirer pour ne garder QUE la silhouette (tête + 2 ailes).

Outils gratuits qui font ça en 1 minute :
- [Photopea](https://www.photopea.com/) (Photoshop en ligne, gratuit)
- [remove.bg](https://www.remove.bg/) (automatique mais peut être imprécis)
- Paint.NET / GIMP (logiciel local)

### Étape 3 — Sauvegarder dans le bon chemin

Renomme l'image en `figure.png` et place-la dans ce dossier :

```
C:\Users\jeank\source\repos\talentrank\public\brand\figure.png
```

### Étape 4 — Activer le PNG dans le code

Une fois le fichier sauvegardé, ouvre `components/ui/BrandLogo.tsx` et modifie la ligne ~48 :

```ts
// Avant
"/brand/figure.svg"

// Après
"/brand/figure.png"
```

Puis commit + push.

## En attendant

Un SVG placeholder (`figure.svg`) est en place avec une **approximation aux courbes Bezier** du vrai logo. Pas pixel-perfect mais reconnaissable. Le code BrandLogo pointe par défaut vers ce SVG pour ne pas casser le build.

## Versions skin

- `figure.png` → silhouette bicolore (orange + bleu) sur fond clair ou neutre
- `figure-light.png` → silhouette blanche + orange (pour usage sur fond bleu profond)
- `figure-on-orange.png` → silhouette blanche + bleue (pour usage sur fond orange)

Les variantes `-light` et `-on-orange` sont **optionnelles** — si elles n'existent pas, BrandLogo retombera sur `figure.png` (à toi de gérer la visibilité via le fond ou de désactiver les skins non-supportés).
