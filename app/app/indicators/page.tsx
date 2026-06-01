"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Monitor } from "lucide-react";

const INDICATORS = [
  {
    id: "ema",
    name: "EMA — Moyenne Mobile Exponentielle",
    emoji: "📈",
    category: "Tendance",
    categoryColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    tagline: "L'outil de base pour lire la tendance",
    description: "L'EMA (Exponential Moving Average) suit le prix en donnant plus de poids aux données récentes. Contrairement à la SMA, elle réagit plus vite aux mouvements de marché.",
    kmm: "KMM utilise 3 EMA combinées : EMA 20 (tendance court terme), EMA 50 (tendance moyen terme), EMA 200 (tendance long terme). Si les 3 sont alignées dans le même sens → signal fort.",
    settings: "EMA 20 · EMA 50 · EMA 200",
    signal: "Prix > EMA 200 → marché haussier. Prix < EMA 200 → marché baissier. Croisement EMA 20/50 → signal d'entrée potentiel.",
    tips: ["Ne pas trader contre l'EMA 200", "Le prix teste souvent les EMA comme support/résistance", "Plus les EMA sont espacées, plus la tendance est forte"],
    mt5: {
      path: "Insérer → Indicateurs → Tendance → Moving Average",
      note: "À ajouter 3 fois avec des périodes différentes",
      steps: [
        { label: "1ère EMA (court terme)", params: "Période : 20 · Méthode : Exponential · Appliquer à : Close · Couleur : jaune" },
        { label: "2ème EMA (moyen terme)", params: "Période : 50 · Méthode : Exponential · Appliquer à : Close · Couleur : orange" },
        { label: "3ème EMA (long terme)",  params: "Période : 200 · Méthode : Exponential · Appliquer à : Close · Couleur : rouge" },
      ],
    },
  },
  {
    id: "rsi",
    name: "RSI — Relative Strength Index",
    emoji: "⚡",
    category: "Momentum",
    categoryColor: "text-gold bg-gold/10 border-gold/20",
    tagline: "Détecter le surachat et la survente",
    description: "Le RSI mesure la vitesse et l'amplitude des variations de prix sur une période (généralement 14 bougies). Il oscille entre 0 et 100.",
    kmm: "KMM utilise le RSI pour valider les entrées : on évite d'acheter quand le RSI est > 70 (surachat) et de vendre quand il est < 30 (survente). Les divergences RSI/prix sont des signaux puissants.",
    settings: "Période 14 · Niveaux 30 / 70",
    signal: "RSI < 30 → survente (potentiel rebond). RSI > 70 → surachat (potentiel retournement). Divergence haussière → prix baisse mais RSI monte = retournement probable.",
    tips: ["Les divergences valent plus que les niveaux seuls", "En tendance forte, le RSI peut rester longtemps en zone extrême", "Combiner avec les supports/résistances pour filtrer les faux signaux"],
    mt5: {
      path: "Insérer → Indicateurs → Oscillateurs → Relative Strength Index",
      note: "S'affiche dans une fenêtre séparée sous le graphique",
      steps: [
        { label: "Paramètres", params: "Période : 14 · Appliquer à : Close" },
        { label: "Niveaux à ajouter", params: 'Onglet \"Niveaux\" → Ajouter 30 et 70 (clic droit → Ajouter niveau)' },
        { label: "Couleur suggérée", params: "Ligne RSI : jaune ou blanc. Fond zones 30/70 : rouge/vert transparent" },
      ],
    },
  },
  {
    id: "macd",
    name: "MACD — Moving Average Convergence Divergence",
    emoji: "🔀",
    category: "Momentum",
    categoryColor: "text-gold bg-gold/10 border-gold/20",
    tagline: "Confirmer la dynamique du mouvement",
    description: "Le MACD est composé de deux lignes (MACD et Signal) et d'un histogramme. Il mesure la relation entre deux EMA pour détecter les changements de dynamique.",
    kmm: "KMM utilise le MACD comme confirmateur : on entre en position quand le MACD confirme la direction de l'EMA. Le croisement des lignes MACD/Signal donne le timing d'entrée.",
    settings: "12 · 26 · 9 (paramètres standard)",
    signal: "Ligne MACD croise Signal vers le haut → signal haussier. Croisement vers le bas → signal baissier. Histogramme qui grandit = momentum qui s'accélère.",
    tips: ["Meilleur en H1 et H4 pour le trading intraday", "Un MACD au-dessus de 0 confirme la tendance haussière", "Attendre le croisement plutôt qu'anticiper"],
    mt5: {
      path: "Insérer → Indicateurs → Oscillateurs → MACD",
      note: "S'affiche dans une fenêtre séparée. Les paramètres par défaut sont déjà les bons.",
      steps: [
        { label: "Paramètres", params: "EMA rapide : 12 · EMA lente : 26 · Ligne de signal : 9 · Appliquer à : Close" },
        { label: "Style visuel", params: "Histogramme : bleu. Ligne signal : rouge. Laisser les valeurs par défaut." },
      ],
    },
  },
  {
    id: "stochastic",
    name: "Stochastique",
    emoji: "🎯",
    category: "Momentum",
    categoryColor: "text-gold bg-gold/10 border-gold/20",
    tagline: "Timing d'entrée précis sur les retournements",
    description: "L'oscillateur stochastique compare le prix de clôture à la fourchette de prix sur une période donnée. Très efficace pour identifier les points de retournement à court terme.",
    kmm: "KMM combine le stochastique avec le RSI pour double confirmation : si RSI < 30 ET Stochastique < 20 avec croisement → signal d'achat fort. Idem à l'inverse pour la vente.",
    settings: "%K 14 · %D 3 · Niveaux 20 / 80",
    signal: "Stochastique < 20 + croisement %K/%D → signal d'achat. Stochastique > 80 + croisement → signal de vente. Divergence = alerte retournement.",
    tips: ["Plus efficace en range qu'en tendance forte", "Attendre le croisement des deux lignes pour confirmer", "Toujours confirmer avec un autre indicateur"],
    mt5: {
      path: "Insérer → Indicateurs → Oscillateurs → Stochastic Oscillator",
      note: "S'affiche sous le graphique. Penser à ajouter les niveaux 20 et 80.",
      steps: [
        { label: "Paramètres", params: "%K : 14 · %D : 3 · Ralentissement : 3 · Méthode MA : Simple · Prix : Low/High" },
        { label: "Niveaux", params: 'Onglet \"Niveaux\" → Ajouter 20 et 80' },
        { label: "Couleurs", params: "%K (ligne principale) : blanc · %D (signal) : rouge" },
      ],
    },
  },
  {
    id: "bollinger",
    name: "Bandes de Bollinger",
    emoji: "🎸",
    category: "Volatilité",
    categoryColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    tagline: "Mesurer la volatilité et les extrêmes de prix",
    description: "Les bandes de Bollinger entourent le prix avec une bande supérieure et inférieure calculées à partir de l'écart-type. Elles s'élargissent quand la volatilité augmente et se resserrent quand elle diminue.",
    kmm: "KMM utilise les Bollinger pour identifier les compressions de volatilité (squeeze) qui précèdent souvent de gros mouvements. Un prix qui touche la bande inférieure en tendance haussière = opportunité d'achat.",
    settings: "Période 20 · Écart-type 2",
    signal: "Prix touche bande supérieure en tendance → continuation. Prix touche bande inférieure en tendance haussière → rebond probable. Squeeze (bandes resserrées) → explosion de volatilité imminente.",
    tips: ["Le Bollinger Squeeze est l'un des setups les plus puissants", "Ne pas shorter systématiquement quand le prix touche la bande haute en tendance", "Combiner avec le RSI pour les retournements"],
    mt5: {
      path: "Insérer → Indicateurs → Tendance → Bollinger Bands",
      note: "S'affiche directement sur le graphique principal, autour des bougies.",
      steps: [
        { label: "Paramètres", params: "Période : 20 · Décalage : 0 · Déviations : 2 · Appliquer à : Close" },
        { label: "Couleurs", params: "Bande haute : bleu · Ligne médiane : gris · Bande basse : bleu" },
      ],
    },
  },
  {
    id: "atr",
    name: "ATR — Average True Range",
    emoji: "📏",
    category: "Volatilité",
    categoryColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    tagline: "Calibrer son stop loss avec précision",
    description: "L'ATR mesure la volatilité moyenne d'un actif sur une période donnée. Il indique l'amplitude moyenne des mouvements de prix, idéal pour placer les stop loss.",
    kmm: "KMM utilise l'ATR pour ne jamais mettre un stop loss trop serré. Règle : stop loss = 1.5× à 2× l'ATR en dessous du point d'entrée. Cela évite d'être sorti prématurément par le bruit du marché.",
    settings: "Période 14",
    signal: "ATR élevé → volatilité forte, élargir les stops. ATR faible → marché calme, stops plus serrés possibles. ATR qui monte = momentum qui s'accélère.",
    tips: ["Ne jamais mettre un stop plus petit que l'ATR actuel", "L'ATR ne donne pas de direction, seulement la volatilité", "Sur XAUUSD, un ATR H1 de 3-5 pips est typique"],
    mt5: {
      path: "Insérer → Indicateurs → Oscillateurs → Average True Range",
      note: "S'affiche sous le graphique. La valeur affichée = volatilité moyenne en points.",
      steps: [
        { label: "Paramètres", params: "Période : 14" },
        { label: "Lecture", params: "La valeur en bas à droite de la fenêtre = ATR actuel. Multiplier par 1.5 ou 2 pour ton stop loss." },
      ],
    },
  },
  {
    id: "volume",
    name: "Volume",
    emoji: "📊",
    category: "Volume",
    categoryColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    tagline: "Confirmer la force des mouvements",
    description: "Le volume mesure le nombre de contrats échangés sur une période. Un mouvement accompagné de volume fort est plus fiable qu'un mouvement sur faible volume.",
    kmm: "KMM vérifie toujours le volume avant d'entrer : un breakout sur fort volume = breakout valide. Un breakout sur faible volume = risque de faux breakout. Volume décroissant en tendance = signe d'essoufflement.",
    settings: "Volume brut · Volume MA 20",
    signal: "Hausse de prix + hausse de volume → tendance haussière confirmée. Hausse de prix + baisse de volume → méfiance, essoufflement. Pic de volume sur support/résistance → niveau important.",
    tips: ["Sur Forex le volume est relatif (pas le volume réel)", "Le volume institutionnel se voit souvent sur les sessions Londres/NY", "Un volume exceptionnel marque souvent un point pivot important"],
    mt5: {
      path: "Insérer → Indicateurs → Volumes → Volumes",
      note: "MT5 affiche le volume en ticks (nombre de changements de prix), pas le volume réel. C'est quand même utile pour comparer.",
      steps: [
        { label: "Paramètres", params: "Aucun réglage nécessaire. Laisser les valeurs par défaut." },
        { label: "Astuce", params: "Ajouter une MA 20 sur le volume : clic droit sur la fenêtre Volume → Indicateurs → Moving Average, période 20" },
        { label: "Lecture", params: "Barres vertes = volume haussier. Barres rouges = volume baissier. Plus la barre est haute, plus l'activité est forte." },
      ],
    },
  },
  {
    id: "sr",
    name: "Supports & Résistances",
    emoji: "🧱",
    category: "Structure",
    categoryColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    tagline: "Les fondations de toute analyse technique",
    description: "Les supports et résistances sont des niveaux de prix où le marché a historiquement réagi. Ce sont les zones où acheteurs et vendeurs se confrontent.",
    kmm: "KMM base toute analyse sur les S/R : on entre toujours en direction de la tendance, depuis un support (achat) ou une résistance (vente). Plus un niveau a été testé, plus il est fort.",
    settings: "Tracé manuel sur les plus hauts/bas significatifs",
    signal: "Prix revient sur support en tendance haussière → achat. Prix revient sur résistance en tendance baissière → vente. Break and retest d'un niveau = entry de haute probabilité.",
    tips: ["Les niveaux ronds (1.2000, 1800$) sont souvent des S/R psychologiques forts", "Un ancien support devient résistance (et vice versa)", "Marquer les S/R sur le plus haut timeframe d'abord"],
    mt5: {
      path: "Insérer → Objets → Lignes → Ligne horizontale  (ou touche H)",
      note: "Les S/R ne sont pas un indicateur automatique — ils se tracent à la main. C'est une compétence clé.",
      steps: [
        { label: "Tracer une ligne horizontale", params: "Appuyer sur H ou aller dans Insérer → Objets → Lignes → Ligne horizontale. Cliquer sur le niveau voulu." },
        { label: "Changer la couleur", params: "Double-cliquer sur la ligne → Propriétés. Support = vert. Résistance = rouge." },
        { label: "Zone plutôt que ligne", params: "Pour une zone : Insérer → Objets → Canaux → Rectangle. Couvrir la zone de consolidation entre deux niveaux." },
        { label: "Astuce template", params: "Une fois ton graphique configuré : clic droit sur le graphique → Template → Enregistrer. Tu retrouveras tous tes indicateurs en 1 clic." },
      ],
    },
  },
];

const CATEGORIES = ["Tous", "Tendance", "Momentum", "Volatilité", "Volume", "Structure"];

const MT5_STEPS = [
  { step: "1", title: "Ouvrir MT5", desc: "Lance MetaTrader 5 et ouvre un graphique (ex: XAUUSD en H1)" },
  { step: "2", title: "Accéder aux indicateurs", desc: "Menu Insérer → Indicateurs, ou clic sur l'icône indicateur dans la barre d'outils" },
  { step: "3", title: "Choisir l'indicateur", desc: "Naviguer dans les dossiers (Tendance, Oscillateurs, Volumes) et double-cliquer sur l'indicateur" },
  { step: "4", title: "Régler les paramètres", desc: "Entrer les valeurs KMM recommandées dans la fenêtre de configuration" },
  { step: "5", title: "Valider", desc: "Cliquer OK — l'indicateur s'affiche sur le graphique ou dans une fenêtre en dessous" },
  { step: "6", title: "Sauvegarder en template", desc: "Clic droit sur le graphique → Template → Enregistrer sous. Tu charges tout d'un coup au prochain démarrage." },
];

export default function IndicatorsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [mt5Open, setMt5Open] = useState(false);

  const filtered = filter === "Tous" ? INDICATORS : INDICATORS.filter((i) => i.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-cream text-2xl font-bold">Indicateurs</h1>
        <p className="text-muted text-sm mt-0.5">Les indicateurs de la méthode KMM — comment les lire, les régler et les installer sur MT5.</p>
      </div>

      {/* Bloc installation MT5 général */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          onClick={() => setMt5Open((v) => !v)}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Monitor size={17} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-sm font-semibold">Installation sur MetaTrader 5</p>
            <p className="text-muted text-xs">Guide étape par étape pour ajouter les indicateurs sur MT5</p>
          </div>
          <span className="text-muted shrink-0">
            {mt5Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {mt5Open && (
          <div className="border-t border-white/[0.05] px-4 pb-5 pt-4 space-y-3">
            <p className="text-muted/70 text-xs">Tous les indicateurs ci-dessous sont <span className="text-cream font-semibold">déjà inclus dans MT5</span> — aucun téléchargement nécessaire. Voici comment les activer :</p>
            <div className="space-y-2">
              {MT5_STEPS.map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-[10px] font-black">{step}</span>
                  </div>
                  <div>
                    <p className="text-cream text-xs font-semibold">{title}</p>
                    <p className="text-muted text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gold/5 border border-gold/15 rounded-xl px-3 py-2.5">
              <p className="text-gold text-xs font-semibold mb-0.5">💡 Astuce template KMM</p>
              <p className="text-cream/70 text-xs">Configure une fois tous tes indicateurs → clic droit sur le graphique → Template → Enregistrer. Tu pourras charger toute la configuration en 2 clics sur n'importe quel graphique.</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === cat
                ? "bg-gold/15 border-gold/30 text-gold"
                : "bg-surface-2 border-white/[0.07] text-muted hover:text-cream hover:border-white/[0.15]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((ind) => {
          const isOpen = expanded === ind.id;
          return (
            <div
              key={ind.id}
              className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : ind.id)}
              >
                <span className="text-2xl shrink-0">{ind.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-cream text-sm font-semibold">{ind.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ind.categoryColor}`}>
                      {ind.category}
                    </span>
                  </div>
                  <p className="text-muted text-xs">{ind.tagline}</p>
                </div>
                <span className="text-muted shrink-0">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {/* Detail */}
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 border-t border-white/[0.05]">
                  <p className="text-muted text-sm leading-relaxed pt-4">{ind.description}</p>

                  {/* Réglages */}
                  <div className="flex items-start gap-3 bg-surface-3 rounded-xl p-3">
                    <span className="text-lg shrink-0">⚙️</span>
                    <div>
                      <p className="text-cream text-xs font-semibold mb-0.5">Réglages recommandés</p>
                      <p className="text-gold text-xs font-mono">{ind.settings}</p>
                    </div>
                  </div>

                  {/* Méthode KMM */}
                  <div className="flex items-start gap-3 bg-gold/5 border border-gold/15 rounded-xl p-3">
                    <span className="text-lg shrink-0">🎯</span>
                    <div>
                      <p className="text-gold text-xs font-semibold mb-1">Comment KMM l'utilise</p>
                      <p className="text-cream/80 text-xs leading-relaxed">{ind.kmm}</p>
                    </div>
                  </div>

                  {/* Signaux */}
                  <div className="flex items-start gap-3 bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-3">
                    <span className="text-lg shrink-0">📡</span>
                    <div>
                      <p className="text-emerald-400 text-xs font-semibold mb-1">Signaux à surveiller</p>
                      <p className="text-cream/80 text-xs leading-relaxed">{ind.signal}</p>
                    </div>
                  </div>

                  {/* Installation MT5 */}
                  <div className="bg-blue-400/5 border border-blue-400/15 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Monitor size={14} className="text-blue-400 shrink-0" />
                      <p className="text-blue-400 text-xs font-semibold">Installation MT5</p>
                    </div>
                    <p className="text-cream/70 text-xs font-mono bg-black/20 rounded-lg px-3 py-2">{ind.mt5.path}</p>
                    {ind.mt5.note && (
                      <p className="text-muted/70 text-xs italic">{ind.mt5.note}</p>
                    )}
                    <div className="space-y-2">
                      {ind.mt5.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-blue-400/60 text-[10px] font-bold mt-0.5 shrink-0 w-4">{i + 1}.</span>
                          <div>
                            <p className="text-cream text-[11px] font-semibold">{s.label}</p>
                            <p className="text-muted/80 text-[11px]">{s.params}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <p className="text-muted text-xs uppercase tracking-widest font-semibold mb-2">💡 Conseils</p>
                    <ul className="space-y-1.5">
                      {ind.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted/80">
                          <span className="text-gold mt-0.5 shrink-0">→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
