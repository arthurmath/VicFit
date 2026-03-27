import React from 'react'

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
