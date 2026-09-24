// Libs
import React from "react"

// Imports
import styles from "./GridMap.module.css"

// Types
type MapProps = {
  gameState: {
    map?: { id: string; troops: number; ownerId: string }[]
    players?: { id: string; color: string }[]
  } | null
  playerId: string
  selectedFrom: string | null
  selectedTo: string | null
  onTerritoryClick: (territoryId: string) => void
}

// Consts
const CONTINENTS = [
  {
    name: "América do Norte",
    id: "america_do_norte",
    bonus: 5,
    countries: [
      { id: "alasca", span: 2 },
      { id: "mackenzie", span: 2 },
      { id: "groenlandia", span: 2 },
      { id: "vancouver", span: 2 },
      { id: "ottawa", span: 2 },
      { id: "labrador", span: 2 },
      { id: "california", span: 3 },
      { id: "nova_iorque", span: 3 },
      { id: "mexico", span: 6 }
    ]
  },
  {
    name: "América do Sul",
    id: "america_do_sul",
    bonus: 2,
    countries: [
      { id: "venezuela", span: 6 },
      { id: "peru", span: 3, rowSpan: 6 },
      { id: "brasil", span: 3, rowSpan: 6 },
      { id: "argentina", span: 6 }
    ]
  },
  {
    name: "Europa",
    id: "europa",
    bonus: 5,
    countries: [
      { id: "islandia", span: 2 },
      { id: "suecia", span: 2 },
      { id: "moscou", span: 2, rowSpan: 3 },
      { id: "inglaterra", span: 2 },
      { id: "alemanha", span: 2 },
      { id: "franca", span: 2 },
      { id: "polonia", span: 2 }
    ]
  },
  {
    name: "África",
    id: "africa",
    bonus: 3,
    countries: [
      { id: "argelia", span: 3, rowSpan: 4 },
      { id: "egito", span: 3 },
      { id: "sudao", span: 3, rowSpan: 4 },
      { id: "congo", span: 3 },
      { id: "africa_do_sul", span: 4 },
      { id: "madagascar", span: 2 }
    ]
  },
  {
    name: "Ásia",
    id: "asia",
    bonus: 7,
    countries: [
      { id: "omsk", span: 2 },
      { id: "dudinka", span: 2 },
      { id: "siberia", span: 2 },
      { id: "aral", span: 2 },
      { id: "tchita", span: 2 },
      { id: "mongolia", span: 2 },
      { id: "vladivostok", span: 2 },
      { id: "china", span: 3 },
      { id: "japao", span: 1 },
      { id: "oriente_medio", span: 2 },
      { id: "india", span: 2 },
      { id: "vietna", span: 2 }
    ]
  },
  {
    name: "Oceania",
    id: "oceania",
    bonus: 2,
    countries: [
      { id: "sumatra", span: 3 },
      { id: "borneu", span: 3 },
      { id: "nova_guine", span: 6 },
      { id: "australia", span: 6 }
    ]
  }
]

// Main
export const GridMap: React.FC<MapProps> = ({
  gameState,
  selectedFrom,
  selectedTo,
  onTerritoryClick
}) => {
  return (
    <div className={styles.worldMap}>
      {CONTINENTS.map((continent) => (
        <div key={continent.id} className={`${styles.continent} ${styles[continent.id]}`}>
          <h2 className={styles.continentTitle}>
            <span>{continent.name}</span>
            <span className={styles.continentBonus}>+{continent.bonus} 🎖️</span>
          </h2>
          <div className={styles.continentGrid}>
            {continent.countries.map((country) => {
              const stateData = gameState?.map?.find((t: { id: string }) => t.id === country.id)
              const owner = gameState?.players?.find((p: { id: string, color: string }) => p.id === stateData?.ownerId)
              const isSelected = selectedFrom === country.id || selectedTo === country.id

              // Fallback color if no owner
              const bgColor = owner ? owner.color : "#4a4a4a"
              
              // Name formatting
              const formattedName = country.id
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .replace('Franca', 'França')
                .replace('Argelia', 'Argélia')
                .replace('Polonia', 'Polônia')
                .replace('Oriente Medio', 'Oriente Médio')
                .replace('Africa Do Sul', 'África do Sul')
                .replace('Nova Guine', 'Nova Guiné')
                .replace('Japao', 'Japão')
                .replace('Vietna', 'Vietnã')
                .replace('Siberia', 'Sibéria')
                .replace('Groenlandia', 'Groenlândia')
                .replace('Islandia', 'Islândia')
                .replace('Suecia', 'Suécia')

              return (
                <div
                  key={country.id}
                  className={[styles.territoryCard, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
                  style={{ 
                    backgroundColor: bgColor,
                    gridColumn: `span ${country.span}`,
                    gridRow: (country as any).rowSpan ? `span ${(country as any).rowSpan}` : 'span 1'
                  }}
                  onClick={() => onTerritoryClick(country.id)}
                >
                  <div className={styles.cardIcons}>
                    {selectedFrom === country.id && <span>📍</span>}
                    {selectedTo === country.id && <span>🎯</span>}
                  </div>

                  <h3 className={styles.territoryName}>{formattedName}</h3>

                  <div className={styles.troopsBadge}>
                    {stateData ? stateData.troops : 0}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

