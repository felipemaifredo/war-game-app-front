"use client"

// Libs
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Imports
import styles from "./Home.module.css"

// Main
export function Home() {
  const router = useRouter()

  const [playerName, setPlayerName] = useState("")
  const [playerAvatar, setPlayerAvatar] = useState("🥷")
  const [roomIdInput, setRoomIdInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem("war_player_name")
    const savedAvatar = localStorage.getItem("war_player_avatar")
    if (savedName) setPlayerName(savedName)
    if (savedAvatar) setPlayerAvatar(savedAvatar)
  }, [])

  function saveProfile() {
    localStorage.setItem("war_player_name", playerName)
    localStorage.setItem("war_player_avatar", playerAvatar)
  }

  async function joinRoom(roomId: string, name: string, avatar: string) {
    try {
      const res = await fetch("http://localhost:3000/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, name, avatar })
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.playerId) {
        sessionStorage.setItem(`war_player_${roomId}`, data.playerId)
        router.push(`/room/${roomId}`)
      }
    } catch (err) {
      setError("Falha ao entrar na sala")
    }
  }

  async function handleCreateRoom() {
    if (!playerName.trim()) {
      setError("Digite seu nome primeiro!")
      return
    }
    saveProfile()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3000/rooms/create", {
        method: "POST"
      })
      const data = await res.json()

      if (data.roomId) {
        await joinRoom(data.roomId, playerName, playerAvatar)
      } else {
        setError("Erro ao criar sala")
      }
    } catch (err) {
      setError("Falha na conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinRoom() {
    if (!playerName.trim() || !roomIdInput.trim()) {
      setError("Digite seu nome e o ID da sala!")
      return
    }
    saveProfile()
    setLoading(true)
    await joinRoom(roomIdInput, playerName, playerAvatar)
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>War Game</h1>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formGroup}>
          <label className={styles.label}>Seu Nome</label>
          <input
            className={styles.input}
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Digite seu nome..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Seu Personagem</label>
          <div className={styles.avatarContainer}>
            {["🥷", "🧙", "🧛"].map(av => (
              <div
                key={av}
                className={`${styles.avatarOption} ${playerAvatar === av ? styles.selectedAvatar : ""}`}
                onClick={() => setPlayerAvatar(av)}
              >
                {av}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actionGroup}>
          <button
            className={styles.buttonPrimary}
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? "Aguarde..." : "Criar Nova Sala"}
          </button>
        </div>

        <div className={styles.divider}>OU</div>

        <div className={styles.actionGroup}>
          <input
            className={styles.input}
            value={roomIdInput}
            onChange={e => setRoomIdInput(e.target.value)}
            placeholder="ID da Sala"
          />
          <button
            className={styles.buttonSecondary}
            onClick={handleJoinRoom}
            disabled={loading}
          >
            {loading ? "Aguarde..." : "Entrar em Sala"}
          </button>
        </div>
      </div>
    </div>
  )
}
