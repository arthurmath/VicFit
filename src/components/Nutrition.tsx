import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Ingredient {
  name: string
  amount: number
  unit: string
}

interface Recipe {
  name: string
  category: string
  servings: number
  ingredients: Ingredient[]
}

interface ShoppingItem {
  name: string
  display: string
}

type Selected = Record<string, boolean>
type Portions = Record<string, number>

// ─── Data ────────────────────────────────────────────────────────────────────

const recipes: Recipe[] = [
  {
    name: "Overnight oats chocolat-banane",
    category: "🌅 Petit déjeuner",
    servings: 1,
    ingredients: [
      { name: "Flocons d'avoine", amount: 40, unit: "g" },
      { name: "Lait végétal non sucré", amount: 150, unit: "g" },
      { name: "Yaourt grec 0%", amount: 80, unit: "g" },
      { name: "Cacao en poudre non sucré", amount: 8, unit: "g" },
      { name: "Banane", amount: 0.5, unit: "unité" },
      { name: "Graines de chia", amount: 8, unit: "g" },
    ],
  },
  {
    name: "Muffins avoine-chocolat cœur fondant",
    category: "🌅 Petit déjeuner",
    servings: 4,
    ingredients: [
      { name: "Œufs entiers", amount: 2, unit: "unité" },
      { name: "Blancs d'œufs", amount: 3, unit: "unité" },
      { name: "Flocons d'avoine", amount: 120, unit: "g" },
      { name: "Pomme", amount: 1, unit: "unité" },
      { name: "Cacao non sucré", amount: 15, unit: "g" },
      { name: "Miel", amount: 10, unit: "g" },
      { name: "Carrés chocolat noir 70%", amount: 4, unit: "unité" },
      { name: "Levure chimique", amount: 3, unit: "g" },
    ],
  },
  {
    name: "Parfait yaourt fruits rouges & chia",
    category: "🌅 Petit déjeuner",
    servings: 1,
    ingredients: [
      { name: "Yaourt grec 0%", amount: 150, unit: "g" },
      { name: "Fruits rouges surgelés", amount: 100, unit: "g" },
      { name: "Graines de chia", amount: 10, unit: "g" },
      { name: "Flocons d'avoine", amount: 15, unit: "g" },
      { name: "Amandes effilées", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Barres muesli chocolat no-bake",
    category: "🌅 Petit déjeuner",
    servings: 5,
    ingredients: [
      { name: "Flocons d'avoine", amount: 200, unit: "g" },
      { name: "Huile de coco", amount: 60, unit: "g" },
      { name: "Miel", amount: 30, unit: "g" },
      { name: "Cacao non sucré", amount: 30, unit: "g" },
      { name: "Pépites de chocolat noir 70%", amount: 30, unit: "g" },
    ],
  },
  {
    name: "Smoothie mocha protéiné",
    category: "🌅 Petit déjeuner",
    servings: 1,
    ingredients: [
      { name: "Lait végétal non sucré", amount: 200, unit: "g" },
      { name: "Yaourt grec 0%", amount: 100, unit: "g" },
      { name: "Banane congelée", amount: 0.5, unit: "unité" },
      { name: "Cacao non sucré", amount: 10, unit: "g" },
      { name: "Graines de chia", amount: 10, unit: "g" },
      { name: "Café soluble", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Gâteau fromage blanc fruits rouges",
    category: "🌅 Petit déjeuner",
    servings: 4,
    ingredients: [
      { name: "Fromage blanc 0%", amount: 250, unit: "g" },
      { name: "Œufs entiers", amount: 3, unit: "unité" },
      { name: "Farine complète", amount: 40, unit: "g" },
      { name: "Fruits rouges", amount: 80, unit: "g" },
      { name: "Sucre de coco", amount: 10, unit: "g" },
      { name: "Levure chimique", amount: 3, unit: "g" },
    ],
  },
  {
    name: "Dhal de lentilles corail au curry",
    category: "🥘 Batch cooking",
    servings: 4,
    ingredients: [
      { name: "Lentilles corail sèches", amount: 400, unit: "g" },
      { name: "Tomates concassées en boîte", amount: 400, unit: "g" },
      { name: "Lait de coco allégé", amount: 200, unit: "g" },
      { name: "Oignon", amount: 1, unit: "unité" },
      { name: "Gousses d'ail", amount: 2, unit: "unité" },
      { name: "Curry en poudre", amount: 10, unit: "g" },
      { name: "Curcuma", amount: 5, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Ratatouille de pois chiches façon chermoula",
    category: "🥘 Batch cooking",
    servings: 4,
    ingredients: [
      { name: "Pois chiches cuits", amount: 300, unit: "g" },
      { name: "Poivrons", amount: 400, unit: "g" },
      { name: "Courgettes", amount: 300, unit: "g" },
      { name: "Tomates cerise", amount: 200, unit: "g" },
      { name: "Oignon rouge", amount: 1, unit: "unité" },
      { name: "Tomates concassées en boîte", amount: 400, unit: "g" },
      { name: "Ras el hanout", amount: 10, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
      { name: "Olives noires dénoyautées", amount: 30, unit: "g" },
    ],
  },
  {
    name: "Chili sin carne haricots noirs & maïs",
    category: "🥘 Batch cooking",
    servings: 4,
    ingredients: [
      { name: "Haricots noirs cuits", amount: 300, unit: "g" },
      { name: "Maïs en boîte", amount: 300, unit: "g" },
      { name: "Poivrons rouges", amount: 2, unit: "unité" },
      { name: "Tomates concassées en boîte", amount: 400, unit: "g" },
      { name: "Oignon", amount: 1, unit: "unité" },
      { name: "Gousses d'ail", amount: 2, unit: "unité" },
      { name: "Cumin en poudre", amount: 10, unit: "g" },
      { name: "Paprika fumé", amount: 5, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Blanquette de champignons & haricots blancs",
    category: "🥘 Batch cooking",
    servings: 4,
    ingredients: [
      { name: "Champignons de Paris", amount: 500, unit: "g" },
      { name: "Haricots blancs cuits", amount: 300, unit: "g" },
      { name: "Lait de soja non sucré", amount: 200, unit: "g" },
      { name: "Oignon", amount: 1, unit: "unité" },
      { name: "Gousses d'ail", amount: 3, unit: "unité" },
      { name: "Moutarde de Dijon", amount: 10, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
      { name: "Persil frais", amount: 1, unit: "bouquet" },
      { name: "Maïzena", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Wok tofu & légumes croquants au gingembre",
    category: "🥘 Batch cooking",
    servings: 4,
    ingredients: [
      { name: "Tofu ferme", amount: 400, unit: "g" },
      { name: "Brocoli", amount: 300, unit: "g" },
      { name: "Carottes", amount: 200, unit: "g" },
      { name: "Chou chinois", amount: 200, unit: "g" },
      { name: "Sauce soja allégée", amount: 20, unit: "g" },
      { name: "Gingembre frais râpé", amount: 10, unit: "g" },
      { name: "Huile de sésame", amount: 5, unit: "g" },
      { name: "Graines de sésame", amount: 10, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Taboulé libanais pois chiches rôtis",
    category: "🥗 Salades",
    servings: 1,
    ingredients: [
      { name: "Boulgour cuit", amount: 70, unit: "g" },
      { name: "Tomates cerise", amount: 100, unit: "g" },
      { name: "Concombre", amount: 0.5, unit: "unité" },
      { name: "Oignon rouge", amount: 30, unit: "g" },
      { name: "Menthe fraîche", amount: 15, unit: "g" },
      { name: "Persil frais", amount: 15, unit: "g" },
      { name: "Pois chiches rôtis", amount: 80, unit: "g" },
      { name: "Huile d'olive", amount: 10, unit: "g" },
      { name: "Jus de citron", amount: 20, unit: "g" },
    ],
  },
  {
    name: "Salade lentilles, betterave & chèvre",
    category: "🥗 Salades",
    servings: 1,
    ingredients: [
      { name: "Lentilles vertes cuites", amount: 80, unit: "g" },
      { name: "Betterave cuite", amount: 60, unit: "g" },
      { name: "Fromage de chèvre frais", amount: 50, unit: "g" },
      { name: "Roquette ou mâche", amount: 40, unit: "g" },
      { name: "Noix", amount: 30, unit: "g" },
      { name: "Vinaigre balsamique", amount: 10, unit: "g" },
      { name: "Moutarde", amount: 5, unit: "g" },
      { name: "Huile d'olive", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Buddha bowl quinoa-avocat façon japonaise",
    category: "🥗 Salades",
    servings: 1,
    ingredients: [
      { name: "Quinoa cuit", amount: 80, unit: "g" },
      { name: "Tomates cerise", amount: 100, unit: "g" },
      { name: "Avocat", amount: 0.5, unit: "unité" },
      { name: "Concombre", amount: 0.5, unit: "unité" },
      { name: "Edamames", amount: 50, unit: "g" },
      { name: "Sauce soja allégée", amount: 10, unit: "g" },
      { name: "Huile de sésame", amount: 5, unit: "g" },
      { name: "Jus de citron vert", amount: 5, unit: "g" },
      { name: "Graines de sésame", amount: 5, unit: "g" },
    ],
  },
  {
    name: "Salade épinards-fraises & Happivore grillé",
    category: "🥗 Salades",
    servings: 1,
    ingredients: [
      { name: "Pousses d'épinards", amount: 120, unit: "g" },
      { name: "Fraises", amount: 80, unit: "g" },
      { name: "Amandes effilées", amount: 30, unit: "g" },
      { name: "Substitut Happivore (poulet végétal)", amount: 80, unit: "g" },
      { name: "Fromage blanc 0%", amount: 30, unit: "g" },
      { name: "Vinaigre de cidre", amount: 10, unit: "g" },
      { name: "Miel", amount: 5, unit: "g" },
      { name: "Huile d'olive", amount: 3, unit: "g" },
    ],
  },
  {
    name: "Salade thaï chou-carottes & Happivore",
    category: "🥗 Salades",
    servings: 1,
    ingredients: [
      { name: "Chou blanc émincé", amount: 150, unit: "g" },
      { name: "Carottes râpées", amount: 100, unit: "g" },
      { name: "Substitut Happivore (boulettes)", amount: 80, unit: "g" },
      { name: "Cacahuètes non salées", amount: 30, unit: "g" },
      { name: "Coriandre fraîche", amount: 15, unit: "g" },
      { name: "Sauce soja allégée", amount: 15, unit: "g" },
      { name: "Jus de citron vert", amount: 10, unit: "g" },
      { name: "Gingembre râpé", amount: 5, unit: "g" },
      { name: "Huile de sésame", amount: 5, unit: "g" },
    ],
  },
]

const CATEGORY_ORDER = ["🌅 Petit déjeuner", "🥘 Batch cooking", "🥗 Salades"]

const SIMILAR: Record<string, string[]> = {
  "flocons d'avoine": ["flocons d'avoine"],
  "yaourt grec 0%": ["yaourt grec 0%"],
  "cacao non sucré": ["cacao en poudre non sucré", "cacao non sucré"],
  "huile d'olive": ["huile d'olive"],
  "graines de chia": ["graines de chia"],
  "lait végétal non sucré": ["lait végétal non sucré", "lait de soja non sucré"],
  "fromage blanc 0%": ["fromage blanc 0%"],
  "tomates concassées en boîte": ["tomates concassées en boîte", "tomates concassées"],
  "oignon": ["oignon", "oignon rouge"],
  "gousses d'ail": ["gousses d'ail"],
  "miel": ["miel"],
  "levure chimique": ["levure chimique"],
  "œufs": ["œufs entiers", "blancs d'œufs"],
  "sauce soja allégée": ["sauce soja allégée"],
  "huile de sésame": ["huile de sésame"],
  "graines de sésame": ["graines de sésame"],
  "carottes": ["carottes", "carottes râpées"],
  "tomates cerise": ["tomates cerise"],
  "pois chiches": ["pois chiches cuits", "pois chiches rôtis"],
  "concombre": ["concombre"],
  "banane": ["banane", "banane congelée"],
  "fruits rouges": ["fruits rouges surgelés", "fruits rouges"],
  "amandes effilées": ["amandes effilées"],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeIngredient(name: string): string {
  const lower = name.toLowerCase()
  for (const [canonical, variants] of Object.entries(SIMILAR)) {
    if (variants.some(v => lower.includes(v.toLowerCase()) || v.toLowerCase().includes(lower))) {
      return canonical.charAt(0).toUpperCase() + canonical.slice(1)
    }
  }
  return name
}

function formatAmount(amount: number, unit: string): string {
  if (unit === "unité") {
    if (amount === 0.5) return "½"
    return `${amount}`
  }
  return `${Math.round(amount)} ${unit}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NutritionPage() {
  const [selected, setSelected] = useState<Selected>({})
  const [portions, setPortions] = useState<Portions>({})
  const [copied, setCopied] = useState(false)

  const categories = CATEGORY_ORDER.map(cat => ({
    name: cat,
    recipes: recipes.filter(r => r.category === cat),
  }))

  const toggle = (name: string, defaultServings: number) => {
    setSelected(prev => {
      const next = { ...prev }
      if (next[name]) {
        delete next[name]
        setPortions(p => {
          const updated = { ...p }
          delete updated[name]
          return updated
        })
      } else {
        next[name] = true
        setPortions(p => ({ ...p, [name]: defaultServings }))
      }
      return next
    })
  }

  const shoppingList = useMemo<ShoppingItem[]>(() => {
    const map: Record<string, { amounts: { amount: number; unit: string }[]; unit: string }> = {}
    for (const recipe of recipes) {
      if (!selected[recipe.name]) continue
      const multiplier = (portions[recipe.name] ?? recipe.servings) / recipe.servings
      for (const ing of recipe.ingredients) {
        const key = normalizeIngredient(ing.name)
        if (!map[key]) map[key] = { amounts: [], unit: ing.unit }
        map[key].amounts.push({ amount: ing.amount * multiplier, unit: ing.unit })
      }
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([name, { amounts }]) => {
        const totalG = amounts.reduce((s, a) => s + (a.unit === 'g' ? a.amount : 0), 0)
        const totalUnit = amounts.reduce((s, a) => s + (a.unit === 'unité' ? a.amount : 0), 0)
        const totalOther = amounts.filter(a => a.unit !== 'g' && a.unit !== 'unité')
        let display = ''
        if (totalG > 0 && totalUnit > 0) display = `${Math.round(totalG)} g + ${totalUnit === 0.5 ? '½' : totalUnit}`
        else if (totalG > 0) display = `${Math.round(totalG)} g`
        else if (totalUnit > 0) display = totalUnit === 0.5 ? '½' : `${Number.isInteger(totalUnit) ? totalUnit : totalUnit}`
        else if (totalOther.length > 0) display = totalOther.map(a => formatAmount(a.amount, a.unit)).join(' + ')
        return { name, display }
      })
  }, [selected, portions])

  const selectedCount = Object.keys(selected).length

  const copyList = () => {
    const text = shoppingList.map(i => `• ${i.name} — ${i.display}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+6.5rem)] space-y-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md mt-0.5">
              Liste de courses 🛒
            </h1>
            <p className="text-white/70 text-sm font-medium drop-shadow mt-0.5">
              Sélectionne tes recettes et ajuste les portions
            </p>
          </div>
          {selectedCount > 0 && (
            <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {selectedCount} recette{selectedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Recipe selector ─────────────────────────────────────────── */}
        {categories.map(cat => (
          <div key={cat.name} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              {cat.name}
            </p>
            <div className="flex flex-col gap-2">
              {cat.recipes.map(recipe => {
                const isSelected = !!selected[recipe.name]
                const currentPortions = portions[recipe.name] ?? recipe.servings
                return (
                  <div
                    key={recipe.name}
                    onClick={() => toggle(recipe.name, recipe.servings)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all active:scale-[0.98] border',
                      isSelected
                        ? 'bg-teal-50 border-teal-300'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200',
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-teal-500 border-teal-500'
                          : 'bg-white border-gray-300',
                      )}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Name */}
                    <span className={cn(
                      'flex-1 text-sm leading-snug',
                      isSelected ? 'font-semibold text-gray-800' : 'text-gray-600',
                    )}>
                      {recipe.name}
                    </span>

                    {/* Portion stepper */}
                    {isSelected && (
                      <div
                        className="flex items-center gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setPortions(p => ({ ...p, [recipe.name]: Math.max(1, (p[recipe.name] ?? recipe.servings) - 1) }))}
                          className="w-7 h-7 rounded-full border-2 border-teal-400 text-teal-500 flex items-center justify-center font-bold text-base leading-none active:scale-90 transition-transform bg-white"
                        >
                          −
                        </button>
                        <span className="text-xs font-semibold text-gray-700 min-w-[56px] text-center">
                          {currentPortions} portion{currentPortions > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => setPortions(p => ({ ...p, [recipe.name]: (p[recipe.name] ?? recipe.servings) + 1 }))}
                          className="w-7 h-7 rounded-full border-2 border-teal-400 text-teal-500 flex items-center justify-center font-bold text-base leading-none active:scale-90 transition-transform bg-white"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {selectedCount === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <p className="text-3xl mb-3">👆</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sélectionne une ou plusieurs recettes<br />pour générer ta liste de courses
            </p>
          </div>
        )}

        {/* ── Shopping list ───────────────────────────────────────────── */}
        {shoppingList.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-teal-50/60">
              <div>
                <p className="text-sm font-semibold text-gray-800">🛒 Liste de courses</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {shoppingList.length} ingrédient{shoppingList.length > 1 ? 's' : ''} · quantités cumulées
                </p>
              </div>
              <button
                onClick={copyList}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95',
                  copied
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25',
                )}
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </button>
            </div>

            {/* List items */}
            <div>
              {shoppingList.map((item, i) => (
                <div
                  key={item.name}
                  className={cn(
                    'flex items-baseline justify-between px-4 py-2.5 gap-3',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
                  )}
                >
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-xs font-semibold text-teal-600 whitespace-nowrap flex-shrink-0">
                    {item.display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
