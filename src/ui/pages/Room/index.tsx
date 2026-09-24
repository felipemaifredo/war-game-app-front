"use client"

// Libs
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGameSocket } from "@/lib/hooks/useGameSocket"

// Imports
import styles from "./Room.module.css"
import { GridMap } from "@/ui/components/GridMap"

// Types
type RoomProps = {
  roomId: string
}

const TURN_DURATION_MS = 60000;

// Subcomponente de Timer
function TimerBar({ turnEndsAt }: { turnEndsAt?: number }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!turnEndsAt) {
      setProgress(100);
      return;
    }
    
    const update = () => {
      const now = Date.now();
      const remaining = turnEndsAt - now;
      if (remaining <= 0) {
        setProgress(0);
      } else {
        setProgress((remaining / TURN_DURATION_MS) * 100);
      }
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [turnEndsAt]);

  if (!turnEndsAt) return null;

  let color = "var(--color-primary)";
  if (progress < 25) color = "var(--color-danger)";
  else if (progress < 50) color = "orange";

  return (
    <div style={{
      width: "100%",
      height: "6px",
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      bottom: 0, // Fica na base da bottomBar (colado no rodapé da tela)
      left: 0
    }}>
      <div style={{
        height: "100%",
        width: `${Math.max(0, progress)}%`,
        backgroundColor: color,
        transition: "width 0.1s linear, background-color 0.5s ease",
        boxShadow: "0 0 8px " + color
      }} />
    </div>
  );
};

// Subcomponente de Transferência de Tropas
const TroopTransferModal = ({ 
  modalData, 
  onConfirm, 
  onCancel 
}: { 
  modalData: any, 
  onConfirm: (amount: number) => void, 
  onCancel: () => void 
}) => {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (modalData) setAmount(modalData.minAmount || 0);
  }, [modalData])

  if (!modalData?.isOpen) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: "140px", // Acima da bottomBar
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      backgroundColor: "#111111", // BG sólido e escuro
      padding: "1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
      border: "1px solid #333",
      textAlign: "center",
      minWidth: "280px",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
      animation: "slideUp 0.2s ease-out"
    }}>
      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{modalData.action === "REINFORCE" ? "Posicionar Tropas" : "Transferir Tropas"}</h3>
      <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>
        Selecione ({modalData.minAmount} a {modalData.maxAmount})
      </p>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "0.5rem 0" }}>
        <input 
          type="range" 
          min={modalData.minAmount} 
          max={modalData.maxAmount} 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ flex: 1, accentColor: "var(--color-primary)" }}
        />
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-primary)", minWidth: "40px", textAlign: "right" }}>
          {amount}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
        {modalData.action !== "TRANSFER_CONQUEST" && (
          <button className={styles.buttonSecondary} onClick={onCancel} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>Cancelar</button>
        )}
        <button className={styles.buttonPrimary} onClick={() => onConfirm(amount)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", flex: 1 }}>Confirmar</button>
      </div>
    </div>
  )
}

// Main
export const Room: React.FC<RoomProps> = ({ roomId }) => {
  const router = useRouter()
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    // Get playerId from session storage
    const savedPlayerId = sessionStorage.getItem(`war_player_${roomId}`)
    if (!savedPlayerId) {
      router.push("/")
    } else {
      setPlayerId(savedPlayerId)
    }
  }, [roomId, router])

  const { gameState, isConnected, error, sendAction, lastEvent } = useGameSocket(
    roomId, 
    playerId || ""
  )

  const [selectedFrom, setSelectedFrom] = useState<string | null>(null)
  const [selectedTo, setSelectedTo] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<"victory" | "defeat" | "ended" | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean,
    action: "REINFORCE" | "MOVE" | "TRANSFER_CONQUEST",
    from?: string,
    to?: string,
    minAmount: number,
    maxAmount: number
  } | null>(null)

  const myTerritoriesCount = gameState?.map?.filter((t: any) => t.ownerId === playerId).length ?? -1

  const activePlayers = new Set(
    gameState?.map?.filter((t: any) => t.ownerId !== "neutral").map((t: any) => t.ownerId)
  )
  const activePlayersCount = activePlayers.size
  const winnerId = activePlayersCount === 1 ? Array.from(activePlayers)[0] : null

  useEffect(() => {
    if (gameState?.status === "playing") {
      if (activePlayersCount === 1) {
        if (myTerritoriesCount > 0) {
          setGameResult("victory")
        } else {
          setGameResult("ended")
          setIsWatching(false)
        }
      } else if (myTerritoriesCount === 0) {
        setGameResult("defeat")
      } else {
        setGameResult(null)
      }
    } else if (gameState?.status === "waiting") {
      setGameResult(null)
      setIsWatching(false)
    }
  }, [gameState?.status, myTerritoriesCount, activePlayersCount])

  useEffect(() => {
    if (lastEvent?.type === "ATTACK_RESULT" && lastEvent.result?.conquered) {
      const fromT = gameState?.map?.find((t: any) => t.id === selectedFrom);
      // Se a origem tiver mais tropas que o mínimo (1), e for o atacante original, abre HUD de passagem
      if (fromT && fromT.troops > 1 && isMyTurn) {
        setTransferModal({
          isOpen: true,
          action: "TRANSFER_CONQUEST",
          from: selectedFrom || undefined,
          to: selectedTo || undefined,
          minAmount: 0,
          maxAmount: Math.min(3, fromT.troops - 1) // Move até 3 tropas
        });
      } else {
        // Se não conquistou ou não pode mover mais nada, limpa
        setSelectedFrom(null)
        setSelectedTo(null)
      }
    } else if (lastEvent?.type === "ATTACK_RESULT" && !lastEvent.result?.conquered) {
      // NÃO LIMPA AS TROPAS AQUI. MANTÉM SELECIONADO PARA REATACAR!
    } else if (lastEvent?.type === "TRANSFER_CONQUEST_RESULT") {
      setSelectedFrom(null)
      setSelectedTo(null)
    }
  }, [lastEvent])

  // Se não tem playerId ainda (está lendo), retorna um estado vazio
  if (!playerId) {
    return <div className={styles.container}>Carregando...</div>
  }

  const isMyTurn = gameState?.currentPlayer === playerId

  function getPhaseName(phase: string) {
    if (phase === "reinforce") return "Posicionamento"
    if (phase === "attack") return "Ataque"
    if (phase === "move") return "Remanejamento"
    return phase
  }

  function handleTerritoryClick(territoryId: string) {
    if (!isMyTurn) return

    const territory = gameState?.map?.find((t: any) => t.id === territoryId)
    const isMine = territory?.ownerId === playerId

    if (gameState?.phase === "reinforce") {
      // Posicionamento só nos próprios territórios
      if (!isMine) return
      if (gameState.troopsToDeploy > 0) {
        setTransferModal({
          isOpen: true,
          action: "REINFORCE",
          to: territoryId,
          minAmount: 1,
          maxAmount: gameState.troopsToDeploy
        });
      }
      return
    }

    if (gameState?.phase === "move") {
      // Remanejamento só nos próprios territórios
      if (!isMine) return
    }

    // Ataque ou Remanejamento (precisam de origem e destino)
    if (!selectedFrom) {
      // Origem sempre deve ser do jogador
      if (!isMine) return
      setSelectedFrom(territoryId)
    } else if (selectedFrom === territoryId) {
      setSelectedFrom(null) // deselect
    } else if (!selectedTo) {
      if (gameState?.phase === "attack" && isMine) return
      if (gameState?.phase === "move" && !isMine) return
      setSelectedTo(territoryId)
    } else if (selectedTo === territoryId) {
      setSelectedTo(null) // deselect
    } else {
      // both selected, change target
      if (gameState?.phase === "attack" && isMine) return
      if (gameState?.phase === "move" && !isMine) return
      setSelectedTo(territoryId)
    }
  }

  function handleAction() {
    if (selectedFrom && selectedTo) {
      if (gameState?.phase === "attack") {
        sendAction({
          action: "ATTACK",
          from: selectedFrom || undefined,
          to: selectedTo || undefined,
        })
        // NÃO LIMPA AS VARIÁVEIS AQUI PRA FACILITAR SPAM DE ATAQUE
      } else if (gameState?.phase === "move") {
        const fromT = gameState?.map?.find((t: any) => t.id === selectedFrom);
        if (fromT && fromT.troops > 1) {
          setTransferModal({
            isOpen: true,
            action: "MOVE",
            from: selectedFrom || undefined,
            to: selectedTo || undefined,
            minAmount: 1,
            maxAmount: fromT.troops - 1
          });
        }
      }
    }
  }

  function handleModalConfirm(amount: number) {
    if (transferModal) {
      sendAction({
        action: transferModal.action,
        from: transferModal.from,
        to: transferModal.to,
        amount
      });
      if (transferModal.action === "MOVE" || transferModal.action === "TRANSFER_CONQUEST") {
        setSelectedFrom(null);
        setSelectedTo(null);
      }
    }
    setTransferModal(null);
  }

  function handleModalCancel() {
    setTransferModal(null);
    if (transferModal?.action === "MOVE" || transferModal?.action === "TRANSFER_CONQUEST") {
      setSelectedFrom(null);
      setSelectedTo(null);
    }
  }

  function handleEndPhase() {
    setSelectedFrom(null)
    setSelectedTo(null)
    sendAction({ action: "END_PHASE", playerId: playerId || undefined })
  }

  function renderGameOverModal () {
    if (!gameResult || isWatching) return null

    let title = ""
    let desc = ""
    let color = ""

    if (gameResult === "victory") {
      title = "👑 Você Ganhou!"
      desc = "Parabéns general, o mundo é seu."
      color = "green"
    } else if (gameResult === "defeat") {
      title = "💀 Você foi Derrotado!"
      desc = "Suas tropas foram dizimadas."
      color = "red"
    } else if (gameResult === "ended") {
      const winnerName = gameState?.players?.find((p: any) => p.id === winnerId)?.name || "Alguém"
      title = "🎌 Fim de Jogo!"
      desc = `${winnerName} dominou o mundo.`
      color = "var(--color-primary)"
    }

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color }}>
            {title}
          </h1>
          <p style={{ marginBottom: "2rem", fontSize: "1.2rem" }}>
            {desc}
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            {gameResult === "defeat" && (
              <button className={styles.buttonSecondary} onClick={() => setIsWatching(true)}>
                Assistir Jogo
              </button>
            )}
            <button className={styles.buttonSecondary} onClick={() => router.push("/")}>
              Voltar ao Início
            </button>
            {gameState?.ownerId === playerId ? (
              <button 
                className={styles.button} 
                onClick={() => sendAction({ action: "RESET_GAME", playerId: playerId || undefined })}
              >
                Jogar Novamente
              </button>
            ) : (
              <p style={{ alignSelf: "center", fontStyle: "italic", color: "var(--color-text-muted)" }}>
                Aguardando criador resetar a sala...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderWaitingRoom = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Sala de Espera: {roomId}</h1>
      <div className={styles.status}>
        <h3>Jogadores na Sala ({gameState?.players?.length || 0}/6)</h3>
        <ul style={{ marginTop: "1rem", listStyle: "none" }}>
          {gameState?.players?.map((p: any) => (
            <li key={p.id} style={{ color: p.color, fontWeight: "bold" }}>
              {p.name} {p.id === playerId ? "(Você)" : ""}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "2rem" }}>
          {gameState?.ownerId === playerId ? (
            <div>
              <button
                className={styles.button}
                onClick={() => sendAction({ action: "START_GAME", playerId })}
                disabled={gameState?.players?.length < 2}
              >
                Iniciar Jogo
              </button>
              {gameState?.players?.length < 2 && (
                <p style={{ fontSize: "0.875rem", color: "gray", marginTop: "0.5rem" }}>
                  Aguarde pelo menos mais 1 jogador entrar...
                </p>
              )}
            </div>
          ) : (
            <p>Aguardando o criador iniciar a partida...</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderGame = () => {
    const currentPlayer = gameState?.players?.find((p: any) => p.id === gameState.currentPlayer)
    const myPlayer = gameState?.players?.find((p: any) => p.id === playerId)

    const colorNameMap: any = { blue: "azul", red: "vermelha", green: "verde", black: "preta", yellow: "amarela", purple: "roxa" };
    const myColorName = colorNameMap[myPlayer?.color] || myPlayer?.color;

    return (
      <div className={styles.container}>
        
        {/* Top HUD with online status and player's color info */}
        <div style={{ alignSelf: "flex-end", textAlign: "right", marginBottom: "1.5rem", paddingRight: "1rem" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: myPlayer?.color }}>Você é a tropa {myColorName}</p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: isConnected ? "green" : "red" }}>
            {isConnected ? "Conectado" : "Desconectado"}
          </p>
        </div>

        {gameState?.phase === "reinforce" && isMyTurn && (
          <div style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-bg)",
            padding: "0.5rem 1.5rem",
            borderRadius: "2rem",
            fontWeight: "bold",
            fontSize: "1.1rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            📍 Você tem {gameState.troopsToDeploy} tropas para distribuir
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <GridMap 
          gameState={gameState} 
          playerId={playerId} 
          selectedFrom={selectedFrom} 
          selectedTo={selectedTo} 
          onTerritoryClick={handleTerritoryClick} 
        />

        <div className={styles.bottomBar} style={{ borderTop: `4px solid ${currentPlayer?.color || "gray"}` }}>
          
          <TimerBar turnEndsAt={gameState?.turnEndsAt} />

          <div className={styles.bottomBarLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ 
                fontSize: "2.5rem", 
                backgroundColor: "var(--color-surface)", 
                padding: "0.5rem", 
                borderRadius: "50%",
                border: `2px solid ${currentPlayer?.color || "transparent"}`
              }}>
                {currentPlayer?.avatar || "🥷"}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>Vez de: {currentPlayer?.name} {isMyTurn && "(Sua Vez!)"}</h2>
                <h3 style={{ margin: 0, color: "var(--color-text-muted)" }}>Fase Atual: {getPhaseName(gameState?.phase)}</h3>
              </div>
            </div>
          </div>
          
          <div className={styles.bottomBarRight}>
            {isMyTurn && gameState?.phase !== "reinforce" && (
              <button 
                className={styles.button}
                onClick={handleAction} 
                disabled={!selectedFrom || !selectedTo}
              >
                {gameState?.phase === "move" ? "Remanejar Tropas" : "Atacar"}
              </button>
            )}

            {isMyTurn && gameState?.phase !== "reinforce" && (
              <button 
                className={styles.buttonSecondary} 
                onClick={handleEndPhase}
              >
                Passar Fase
              </button>
            )}
          </div>
        </div>
        {renderGameOverModal()}
        <TroopTransferModal 
          modalData={transferModal} 
          onConfirm={handleModalConfirm} 
          onCancel={handleModalCancel} 
        />
      </div>
    )
  }

  if (gameState?.status === "waiting") {
    return renderWaitingRoom()
  }

  if (gameState?.status === "playing") {
    return renderGame()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Conectando à Sala {roomId}...</h1>
    </div>
  )
}
