


Setup : npm run dev

Local : http://localhost:5173/

Prod : https://vicfitvic.vercel.app/

Vercel : https://vercel.com/arthurmaths-projects/vicfit

Supabase : https://supabase.com/dashboard/project/




# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```



Done :
	◦	Jauge de motivation : qui augmente avec le nombre de jours sans craquage et diminue en fonction du type de craquage (ex: -5 points si un dessert en trop et +1 point par jour nickel)
	◦	Jauge objectif poids : à placer à côté de la jauge motivation
	◦	Tracking alimentation simplifiée : repas sain, repas calorique, dessert, alcool
	◦	Semainier avec indicateur de performance : vert si que des repas sains, jaune avec emoji alcool pour le jour de soirée, rouge si craquage
	◦	Poids à renseigner manuellement 
  ◦	Page de suivi par graphique : poids
  ◦	Mensurations : bras taille hanche cuisse molet

To do:
	◦	Notification motivation + rappel saisie 
	◦	Page de conseils nutrition de Claude + regles
	◦	Tracking conso eau (non)
	◦	Photos avant/après (non)

Règles alimentation :
	⁃	1 dessert par semaine
	⁃	1 repas cheatmeal par semaine
	⁃	1 soirée alcoolisée par semaine
	⁃	Zéro pain
	⁃	Zéro entrée
	⁃	Zéro fromage en dehors des plats
	⁃	Zéro grignotage
	⁃	Dessert : fruits illimités ou 1 morceau de chocolat
	⁃	Petit déjeuner avant 9H