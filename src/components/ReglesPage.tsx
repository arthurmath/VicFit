
export default function ReglesPage() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-14 safe-top space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">
          Mes Règles 📖
        </h1>
        <p className="text-white/80 text-sm font-medium drop-shadow mt-1">
          L'équilibre au quotidien
        </p>
      </div>

      {/* Plate Layout - Reconstructing the screenshot */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6 border border-white/50 flex flex-col items-center">
        <div className="aspect-square w-full max-w-[280px] flex flex-col border-2 border-gray-800 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Top: Légumes (1/2) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-b-2 border-gray-800 bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">LÉGUMES (1/2)</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
              brocolis, courgettes,<br />
              salade, tomates...
            </p>
          </div>
          
          {/* Bottom Row */}
          <div className="flex-1 flex">
            {/* Bottom Left: Protéines (1/4) */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-r-2 border-gray-800">
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">PROTÉINES (1/4)</h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-snug">
                poulet, œufs,<br />
                poisson...
              </p>
            </div>
            {/* Bottom Right: Féculents (1/4) */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">FÉCULENTS (1/4)</h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-snug">
                riz, patate<br />
                douce, pâtes...
              </p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-gray-600 font-bold italic text-sm tracking-wide">
          + un filet d'huile d'olive
        </p>
      </div>

      {/* À privilégier */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
        <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">✅</div>
          <div>
            <div className="text-base font-bold text-green-700">À privilégier</div>
            <div className="text-xs text-gray-500 mt-0.5">Rassasiant · Nutritif · Peu calorique</div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { emoji: '🥦', name: 'Légumes', badge: 'Illimité', items: [
              { label: 'Légumes feuilles', note: 'Épinards, roquette, mâche, chou frisé' },
              { label: 'Légumes crucifères', note: 'Brocoli, chou-fleur, chou de Bruxelles' },
              { label: 'Légumes aqueux', note: 'Concombre, courgette, céleri, radis' },
              { label: 'Tomates, poivrons, aubergines', note: 'Riches en antioxydants, très peu caloriques' },
            ]},
            { emoji: '🫘', name: 'Protéines végétales', badge: 'Prioritaire', items: [
              { label: 'Légumineuses', note: 'Lentilles, pois chiches, haricots rouges/blancs' },
              { label: 'Tofu & tempeh', note: 'Protéines complètes, peu de calories si non frit' },
              { label: 'Edamame & seitan', note: 'Haute densité protéique, texture rassasiante' },
            ]},
            { emoji: '🥚', name: 'Œufs & laitages allégés', badge: 'Quotidien', items: [
              { label: 'Œufs entiers', note: 'Protéines complètes, très rassasiants' },
              { label: 'Skyr & fromage blanc 0%', note: 'Riche en protéines, faible en calories' },
              { label: 'Yaourt nature (sans sucre)', note: 'Bon pour le microbiome, faible IG' },
            ]},
            { emoji: '🌾', name: 'Féculents & céréales', badge: 'Avec modération', items: [
              { label: 'Flocons d\'avoine', note: 'Index glycémique bas, fibres, rassasiants' },
              { label: 'Quinoa & sarrasin', note: 'Protéines + fibres, alternatives complètes' },
              { label: 'Patate douce', note: 'Plus nutritive que la pomme de terre classique' },
              { label: 'Pain complet / seigle', note: 'Fibres, IG modéré — max 1–2 tranches/jour' },
            ]},
            { emoji: '🍓', name: 'Fruits', badge: '2 portions/jour', items: [
              { label: 'Fruits rouges', note: 'Fraises, framboises, myrtilles — faibles en sucres' },
              { label: 'Pomme, poire, pamplemousse', note: 'Index glycémique modéré, riches en fibres' },
              { label: 'Kiwi, orange', note: 'Vitamine C, bonne satiété' },
            ]},
            { emoji: '🥑', name: 'Bonnes graisses', badge: 'Petites quantités', items: [
              { label: 'Huile d\'olive vierge extra', note: '1 cs/repas max — anti-inflammatoire' },
              { label: 'Avocat', note: '½ avocat max par jour — riche en bonnes graisses' },
              { label: 'Noix, amandes, graines', note: 'Petite poignée/jour — oméga-3, zinc, magnésium' },
            ]},
          ].map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-100">
                <span className="text-base">{cat.emoji}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">{cat.name}</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide bg-green-100 text-green-700 rounded-full px-2.5 py-0.5">{cat.badge}</span>
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-1.5">
                {cat.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-gray-800 leading-snug">{item.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* À éliminer */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50">
        <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">🚫</div>
          <div>
            <div className="text-base font-bold text-red-700">À éliminer</div>
            <div className="text-xs text-gray-500 mt-0.5">Calories vides · Pics glycémiques · Inflammation</div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { emoji: '🍬', name: 'Sucres & sucreries', badge: 'À supprimer', items: [
              { label: 'Confiseries & bonbons', note: 'Sucre pur, zéro nutriment, pic glycémique brutal' },
              { label: 'Viennoiseries & pâtisseries', note: 'Croissants, pain au chocolat, éclairs…' },
              { label: 'Céréales petit-déj sucrées', note: 'Corn flakes, muesli industriel, granola sucré' },
              { label: 'Chocolat au lait / blanc', note: 'Sucre + graisses saturées — éviter en déficit' },
            ]},
            { emoji: '🥤', name: 'Boissons caloriques', badge: 'À supprimer', items: [
              { label: 'Sodas & limonades', note: 'Coca, Fanta, Sprite — jusqu\'à 35g sucre/canette' },
              { label: 'Jus de fruits industriels', note: 'Autant de sucre qu\'un soda, sans les fibres' },
              { label: 'Alcool', note: 'Bloque la lipolyse, 7 kcal/g — vin, bière, spiritueux' },
              { label: 'Boissons sucrées chaudes', note: 'Café sucré, thé sucré, chocolat chaud industriel' },
            ]},
            { emoji: '🍟', name: 'Produits ultra-transformés', badge: 'À supprimer', items: [
              { label: 'Chips & snacks salés', note: 'Chips, crackers, popcorn au beurre, bretzels' },
              { label: 'Plats préparés industriels', note: 'Conservateurs, sel, sucres cachés, graisses trans' },
              { label: 'Biscuits & gâteaux industriels', note: 'Oreo, BN, LU — graisses hydrogénées + sucre' },
            ]},
            { emoji: '🥖', name: 'Céréales & féculents raffinés', badge: 'À limiter', items: [
              { label: 'Pain blanc & baguette', note: 'IG très élevé, peu de fibres, peu rassasiant' },
              { label: 'Riz blanc en excès', note: 'Préférer le riz complet ou basmati en petite quantité' },
              { label: 'Pâtes blanches en excès', note: 'Opter pour les pâtes complètes ou de légumineuses' },
            ]},
            { emoji: '🧀', name: 'Fromages & laitages gras', badge: 'À limiter', items: [
              { label: 'Fromages à pâte molle', note: 'Brie, camembert, chèvre — très denses en calories' },
              { label: 'Fromages à pâte dure', note: 'Gruyère, comté, parmesan — max 20–30g/jour' },
              { label: 'Crème fraîche & beurre', note: 'À remplacer par yaourt grec, huile d\'olive' },
            ]},
            { emoji: '🥫', name: 'Sauces & condiments riches', badge: 'À supprimer', items: [
              { label: 'Mayonnaise & aïoli', note: '~700 kcal/100g — à remplacer par moutarde ou houmous' },
              { label: 'Sauces industrielles', note: 'Ketchup, sauce barbecue — sucre caché' },
              { label: 'Vinaigrettes industrielles', note: 'Préférer citron + huile d\'olive maison' },
            ]},
          ].map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-100">
                <span className="text-base">{cat.emoji}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">{cat.name}</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-600 rounded-full px-2.5 py-0.5">{cat.badge}</span>
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-1.5">
                {cat.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-gray-800 leading-snug">{item.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Widget */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
          Règles alimentation
        </h2>
        <ul className="space-y-3">
          {[
            '1 dessert par semaine',
            '1 repas cheatmeal par semaine',
            '1 soirée alcoolisée par semaine',
            'Zéro pain',
            'Zéro entrée',
            'Zéro fromage en dehors des plats',
            'Zéro grignotage',
            'Dessert : fruits illimités ou 1 morceau de chocolat',
            'Petit déjeuner avant 9H',
          ].map((rule, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 group-hover:bg-teal-500 transition-colors shrink-0" />
              <span className="text-gray-700 font-medium leading-snug">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
