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
const COUNTRIES = [
  "brasil", "argentina", "peru", "venezuela", "colombia", "uruguai",
  "chile", "bolivia", "paraguai", "equador", "guiana", "suriname", "guiana_francesa"
]

// Main
export const GridMap: React.FC<MapProps> = ({
  gameState,
  selectedFrom,
  selectedTo,
  onTerritoryClick
}) => {
  return (
    <div className={styles.mapGrid}>
      {COUNTRIES.map((countryId) => {
        const stateData = gameState?.map?.find((t: { id: string }) => t.id === countryId)
        const owner = gameState?.players?.find((p: { id: string, color: string }) => p.id === stateData?.ownerId)
        const isSelected = selectedFrom === countryId || selectedTo === countryId

        // Fallback color if no owner
        const bgColor = owner ? owner.color : "#4a4a4a"

        return (
          <div
            key={countryId}
            className={[styles.territoryCard, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
            style={{ backgroundColor: bgColor }}
            onClick={() => onTerritoryClick(countryId)}
          >
            <div className={styles.cardIcons}>
              {selectedFrom === countryId && <span>📍</span>}
              {selectedTo === countryId && <span>🎯</span>}
            </div>

            <h3 className={styles.territoryName}>{countryId.replace('_', ' ')}</h3>

            <div className={styles.troopsBadge}>
              {stateData ? stateData.troops : 0}
            </div>
          </div>
        )
      })}
    </div>
  )
}
