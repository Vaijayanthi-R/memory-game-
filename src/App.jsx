import { useState, useEffect } from 'react'
import { RotateCcw, Trophy, Timer, Sparkles } from 'lucide-react'
import './index.css'

function App() {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [gameStatus, setGameStatus] = useState('playing')
  const [bestScore, setBestScore] = useState(0)

  const symbols = ['🎮', '🎯', '🎨', '🌟', '🚀', '🎪', '🎲', '🎸']

  // Initialize game
  useEffect(() => {
    resetGame()
    
    // Load best score from localStorage
    const savedScore = localStorage.getItem('bestScore')
    if (savedScore) {
      setBestScore(parseInt(savedScore))
    }
  }, [])

  // Game timer
  useEffect(() => {
    if (gameStatus !== 'playing') return
    
    if (timeLeft <= 0) {
      setGameStatus('lost')
      return
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeLeft, gameStatus])

  // Check for win
  useEffect(() => {
    if (matched.length === symbols.length * 2 && gameStatus === 'playing') {
      setGameStatus('won')
      if (score > bestScore) {
        setBestScore(score)
        localStorage.setItem('bestScore', score.toString())
      }
    }
  }, [matched, gameStatus, score, bestScore, symbols.length])

  const resetGame = () => {
    // Create cards
    const cardPairs = [...symbols, ...symbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5)
    
    setCards(cardPairs)
    setFlipped([])
    setMatched([])
    setScore(0)
    setMoves(0)
    setTimeLeft(120)
    setGameStatus('playing')
  }

  const handleCardClick = (index) => {
    if (gameStatus !== 'playing' || 
        cards[index].isMatched || 
        flipped.length === 2 || 
        flipped.includes(index)) {
      return
    }

    // Increment moves
    setMoves(prev => prev + 1)

    // Flip the card
    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped
      
      if (cards[first].symbol === cards[second].symbol) {
        // Match found
        setTimeout(() => {
          const updatedCards = [...newCards]
          updatedCards[first].isMatched = true
          updatedCards[second].isMatched = true
          setCards(updatedCards)
          setFlipped([])
          setMatched(prev => [...prev, first, second])
          setScore(prev => prev + 10)
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          const updatedCards = [...newCards]
          updatedCards[first].isFlipped = false
          updatedCards[second].isFlipped = false
          setCards(updatedCards)
          setFlipped([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft > 60) return '#43e97b'
    if (timeLeft > 30) return '#ffcc00'
    return '#ff6b6b'
  }

  const getProgressClass = () => {
    if (timeLeft > 60) return 'progress-good'
    if (timeLeft > 30) return 'progress-warning'
    return 'progress-critical'
  }

  return (
    <div className="game-container">
      {/* Header */}
      <header className="game-header">
        <h1 className="game-title">🎮 Memory Card Game</h1>
        <p className="game-subtitle">Find matching pairs before time runs out!</p>
      </header>

      {/* Game Stats */}
      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-label">SCORE</div>
          <div className="stat-value">{score}</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">BEST SCORE</div>
          <div className="stat-value">
            <Trophy size={20} style={{ display: 'inline', marginRight: '5px' }} />
            {bestScore}
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">
            <Timer size={16} style={{ display: 'inline', marginRight: '5px' }} />
            TIME LEFT
          </div>
          <div 
            className="stat-value" 
            style={{ 
              color: getTimerColor(),
              transition: 'color 0.3s ease'
            }}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="progress-bar">
            <div 
              className={`progress-fill ${getProgressClass()}`}
              style={{ width: `${(timeLeft / 120) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">MOVES</div>
          <div className="stat-value">{moves}</div>
        </div>
      </div>

      {/* Win/Lose Messages */}
      {gameStatus === 'won' && (
        <div className="message win-message">
          <Sparkles size={24} />
          <h2 style={{ margin: '10px 0' }}>🎉 Congratulations! You Won! 🎉</h2>
          <p>Score: {score} | Moves: {moves} | Time: {formatTime(120 - timeLeft)}</p>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="message lose-message">
          <h2 style={{ margin: '10px 0' }}>⏰ Time's Up!</h2>
          <p>You matched {matched.length / 2} pairs. Try again!</p>
        </div>
      )}

      {/* Game Board */}
      <div className="game-board">
        <div className="cards-grid">
          {cards.map((card, index) => (
            <button
              key={card.id}
              className={`card ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || gameStatus !== 'playing'}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="card-front">
                  {card.symbol}
                </div>
              ) : (
                <div className="card-back">
                  ?
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="reset-btn" onClick={resetGame}>
          <RotateCcw size={20} />
          New Game
        </button>
      </div>

      {/* Footer */}
      <footer className="game-footer">
        <p>Built with React + Vite • Deploy on Vercel</p>
        <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
          Match pairs to score points. Each match = 10 points
        </p>
      </footer>
    </div>
  )
}

export default App
