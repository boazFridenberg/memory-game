import { useEffect, useMemo, useRef, useState } from 'react'
import { Container, AppBar, Toolbar, Typography, Select, MenuItem, Chip, Stack, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import Board from './components/Board'
import type { CardType } from './types'
import { ToastContainer, toast } from 'react-toastify'

const EMOJI_SET = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐙', '🦄', '🐝', '🐢', '🦋', '🐞', '🌸', '🍀', '🍎', '🍌', '🍇', '🍉', '⚽', '🏀', '🎲', '🎧', '🎹', '🚗', '✈️']
const STORAGE_KEY = 'memoryGame:history'

interface HistoryItem {
  id: string
  date: string
  grid: string
  attempts: number
  timeMs: number
}

function makeDeck(size: number): CardType[] {
  const pairsCount = (size * size) / 2
  const symbols = EMOJI_SET.slice(0, pairsCount)
  const base = symbols.flatMap((s, i) => ([
    { id: `${i}-a`, content: s, matched: false },
    { id: `${i}-b`, content: s, matched: false }
  ]))
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = base[i]; base[i] = base[j]; base[j] = t
  }
  return base
}

function useTimer(running: boolean): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [ms, setMs] = useState(0)
  const ref = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setMs(prev => prev + 100), 100)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])
  return [ms, setMs]
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function App() {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const gridSize = useMemo(() => difficulty === 'easy' ? 4 : 6, [difficulty])

  const [deck, setDeck] = useState<CardType[]>([])
  const [choice1, setChoice1] = useState<CardType | null>(null)
  const [choice2, setChoice2] = useState<CardType | null>(null)
  const [locked, setLocked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [running, setRunning] = useState(false)
  const [timeMs, setTimeMs] = useTimer(running)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    if (choice1 && choice2) {
      setLocked(true)
      setAttempts(a => a + 1)
      if (choice1.content === choice2.content) {
        setDeck(d => d.map(c => (c.content === choice1.content ? { ...c, matched: true } : c)))
        toast.success('Match!')
        setTimeout(() => resetChoices(), 300)
      } else {
        toast.info('Try again')
        setTimeout(() => resetChoices(), 800)
      }
    }
  }, [choice1, choice2])

  useEffect(() => {
    if (deck.length > 0 && deck.every(c => c.matched)) {
      setRunning(false)
      const record: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString(),
        grid: `${gridSize}x${gridSize}`,
        attempts,
        timeMs
      }
      const next = [record, ...history].slice(0, 50)
      setHistory(next)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      toast.success('You won! Saved to history.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck])

  function resetChoices() {
    setChoice1(null)
    setChoice2(null)
    setLocked(false)
  }

  function startNewGame(nextDifficulty: 'easy' | 'hard' = difficulty) {
    const size = nextDifficulty === 'easy' ? 4 : 6
    setDifficulty(nextDifficulty)
    setDeck(makeDeck(size))
    setChoice1(null)
    setChoice2(null)
    setLocked(false)
    setAttempts(0)
    setTimeMs(0)
    setRunning(true)
    toast('New game started')
  }

  function handleSelect(card: CardType) {
    if (locked || card.matched) return
    if (!running) setRunning(true)
    if (choice1 && card.id === choice1.id) return
    if (!choice1) setChoice1(card)
    else if (!choice2) setChoice2(card)
  }

  useEffect(() => {
    startNewGame('easy')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container sx={{ mt: 2 }}>
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Memory Game</Typography>
          <Stack direction="row" spacing={2}>
            <Chip label={`Time: ${formatTime(timeMs)}`} />
            <Chip label={`Attempts: ${attempts}`} />
            <Select
              size="small"
              value={difficulty}
              onChange={(e) => startNewGame(e.target.value as 'easy' | 'hard')}
              sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
            >
              <MenuItem value="easy">Easy (4x4)</MenuItem>
              <MenuItem value="hard">Hard (6x6)</MenuItem>
            </Select>
            <Chip label="History" onClick={() => setHistoryOpen(true)} clickable />
          </Stack>
        </Toolbar>
      </AppBar>

      <Board cards={deck} onSelect={handleSelect} choice1={choice1} choice2={choice2} />

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Game History</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Grid</TableCell>
                <TableCell>Attempts</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.id}>
                  <TableCell>{h.date}</TableCell>
                  <TableCell>{h.grid}</TableCell>
                  <TableCell>{h.attempts}</TableCell>
                  <TableCell>{formatTime(h.timeMs)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Container>
  )
}
