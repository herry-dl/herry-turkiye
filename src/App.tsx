import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Flag } from 'lucide-react';
import { GameMap } from './components/GameMap';
import { locations, Location } from './locations';
import { calculateDistance, calculateScore } from './utils';

function App() {
  const [gameLocations, setGameLocations] = useState<Location[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [roundOver, setRoundOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const TOTAL_ROUNDS = 5;

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Shuffle locations and pick 5
    const shuffled = [...locations].sort(() => 0.5 - Math.random());
    setGameLocations(shuffled.slice(0, TOTAL_ROUNDS));
    setCurrentRound(0);
    setTotalScore(0);
    setGameOver(false);
    resetRound();
  };

  const resetRound = () => {
    setGuess(null);
    setRoundOver(false);
    setLastScore(0);
    setLastDistance(0);
  };

  const handleGuess = () => {
    if (!guess) return;

    const target = gameLocations[currentRound];
    const distance = calculateDistance(guess.lat, guess.lng, target.lat, target.lng);
    const score = calculateScore(distance);

    setLastDistance(distance);
    setLastScore(score);
    setTotalScore((prev) => prev + score);
    setRoundOver(true);
  };

  const handleNextRound = () => {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setGameOver(true);
    } else {
      setCurrentRound((prev) => prev + 1);
      resetRound();
    }
  };

  if (gameLocations.length === 0) return null;

  const currentTarget = gameLocations[currentRound];

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <MapPin size={28} color="#e63946" />
          <span>HERRY</span>-TURKIYE
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">TUR</span>
            <span>{currentRound + 1} / {TOTAL_ROUNDS}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SKOR</span>
            <span>{totalScore}</span>
          </div>
        </div>
      </header>

      <main className="game-area">
        {!gameOver ? (
          <>
            <div className="image-section">
              <iframe 
                title="Street View"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                src={`https://maps.google.com/maps?q=&layer=c&cbll=${currentTarget.lat},${currentTarget.lng}&cbp=11,0,0,0,0&output=svembed`} 
                allowFullScreen
              ></iframe>
            </div>
            
            <GameMap 
              guess={guess} 
              setGuess={setGuess} 
              targetLocation={currentTarget} 
              roundOver={roundOver} 
            />

            <div className="controls-overlay">
              {!roundOver ? (
                <button 
                  className="btn" 
                  onClick={handleGuess} 
                  disabled={!guess}
                >
                  Tahmin Et
                </button>
              ) : (
                <>
                  <div style={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca311' }}>
                      +{lastScore} Puan
                    </div>
                    <div>Mesafe: {lastDistance.toFixed(1)} km</div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                      Hedef: {currentTarget.name}
                    </div>
                  </div>
                  <button className="btn" onClick={handleNextRound}>
                    {currentRound + 1 === TOTAL_ROUNDS ? 'Sonuçları Gör' : 'Sonraki Tur'}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="overlay-screen">
            <Trophy size={80} color="#fca311" style={{ marginBottom: '20px' }} />
            <h1 className="title-huge">Oyun Bitti!</h1>
            
            <div className="result-card">
              <h3>Toplam Skor</h3>
              <div className="score-display">{totalScore}</div>
              <p style={{ color: 'var(--text-muted)' }}>Maksimum: {TOTAL_ROUNDS * 5000}</p>
              
              <button className="btn" style={{ marginTop: '30px', width: '100%' }} onClick={startNewGame}>
                Tekrar Oyna
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
