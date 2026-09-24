// Libs
import { useEffect, useRef, useState, useCallback } from "react"

// Types
type ActionPayload = {
  action: "START_GAME" | "ATTACK" | "MOVE" | "REINFORCE" | "END_PHASE" | "RESET_GAME" | "TRANSFER_CONQUEST"
  from?: string
  to?: string
  playerId?: string
  amount?: number
}

// Funcs
export function useGameSocket(roomId: string, playerId: string) {
  const [gameState, setGameState] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<any>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!roomId) return

    // TODO: move URL to environment variable
    let wsUrl = `ws://localhost:3000/ws/${roomId}`
    if (playerId) {
      wsUrl += `?playerId=${playerId}`
    }
    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log("Connected to game room:", roomId)
    }

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          setError(data.error)
        } else if (data.type === "GAME_UPDATED") {
          setGameState(data.gameState)
          setError(null)

          if (data.lastAction) {
            setLastEvent(data.lastAction)
          } else {
            setLastEvent(null)
          }
        } else {
          setLastEvent(data)
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err)
      }
    }

    socketRef.current.onclose = () => {
      setIsConnected(false)
      console.log("Disconnected from game room:", roomId)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [roomId, playerId])

  const sendAction = useCallback((payload: ActionPayload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ ...payload, playerId }))
    } else {
      setError("Not connected to server")
    }
  }, [playerId])

  return { gameState, isConnected, error, sendAction, lastEvent }
}
