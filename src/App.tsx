import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Flag } from 'lucide-react';
import { GameMap } from './components/GameMap';
import { locations, Location } from './locations';
import { calculateDistance, calculateScore } from './utils';
import logo from './assets/logo.png';

function App() {
  const [gameLocations, setGameLocations] = useState<Location[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [roundOver, setRoundOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [gameStarted, setGameStarted] = useState(false);

  const TOTAL_ROUNDS = 10;

  // Initialize game
  useEffect(() => {
    // startNewGame removed from here to allow landing page
  }, []);

  useEffect(() => {
    let timer: any;
    if (!roundOver && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !roundOver) {
      handleGuess();
    }
    return () => clearInterval(timer);
  }, [timeLeft, roundOver, gameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startNewGame = () => {
    // 3 kolay, 4 orta, 3 zor lokasyon seç
    const level1 = locations.filter(l => l.difficulty === 1).sort(() => 0.5 - Math.random()).slice(0, 3);
    const level2 = locations.filter(l => l.difficulty === 2).sort(() => 0.5 - Math.random()).slice(0, 4);
    const level3 = locations.filter(l => l.difficulty === 3).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    setGameLocations([...level1, ...level2, ...level3]);
    setCurrentRound(0);
    setTotalScore(0);
    setGameOver(false);
    setFailed(false);
    setGameStarted(true);
    resetRound();
  };

  const resetRound = () => {
    setGuess(null);
    setRoundOver(false);
    setLastScore(0);
    setLastDistance(0);
    setTimeLeft(120);
  };

  const handleGuess = () => {
    if (roundOver) return;

    const target = gameLocations[currentRound];
    let distance = 9999;
    let score = 0;

    if (guess) {
      distance = calculateDistance(guess.lat, guess.lng, target.lat, target.lng);
      score = calculateScore(distance);
    }

    setLastDistance(distance);
    setLastScore(score);
    setTotalScore((prev) => prev + score);
    setRoundOver(true);
    
    if (distance > 200) {
      setFailed(true);
    }
  };

  const handleNextRound = () => {
    if (failed) {
      startNewGame();
      return;
    }
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setGameOver(true);
    } else {
      setCurrentRound((prev) => prev + 1);
      resetRound();
    }
  };

  return (
    <div className="app-container">
      {!gameStarted ? (
        <div className="landing-page">
          <div className="landing-content">
            <img src={logo} alt="HERRY TÜRKİYE" className="logo-img-large" />
            <h1 className="landing-title">HERRY TÜRKİYE</h1>
            <p className="by-dagli">BY Dagli</p>
            <p className="landing-subtitle">Türkiye'yi ne kadar iyi tanıyorsun? Sokak sokak gez, keşfet ve tahmin et!</p>
            
            <div className="landing-buttons">
              <button className="btn btn-primary btn-huge" onClick={startNewGame}>
                <Flag size={20} style={{ marginRight: '10px' }} />
                MACERAYA BAŞLA
              </button>
              <button className="btn btn-secondary btn-huge" onClick={() => alert('Sokak görünümünde nerede olduğunuzu tahmin edin. Merkeze ne kadar yakınsanız o kadar çok puan kazanırsınız!')}>
                NASIL OYNANIR?
              </button>
            </div>
          </div>
          <div className="landing-footer">
            © 2024 HERRY-TÜRKİYE | Türkiye Kâşifi
          </div>
        </div>
      ) : (
        gameLocations.length > 0 && (() => {
          const currentTarget = gameLocations[currentRound];
          const difficultyText = currentTarget.difficulty === 1 ? 'Kolay' : currentTarget.difficulty === 2 ? 'Orta' : 'Zor';
          const difficultyColor = currentTarget.difficulty === 1 ? '#2a9d8f' : currentTarget.difficulty === 2 ? '#fca311' : '#e63946';
          
          return (
            <>
              <header>
                <div className="logo" onClick={() => setGameStarted(false)} style={{ cursor: 'pointer' }}>
                  <img src={logo} alt="HERRY TÜRKİYE" className="logo-img" />
                </div>
                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-label">ZORLUK</span>
                    <span style={{ color: difficultyColor, fontWeight: 'bold' }}>{difficultyText}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">TUR</span>
                    <span>{currentRound + 1} / {TOTAL_ROUNDS}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">SÜRE</span>
                    <span style={{ color: timeLeft < 30 ? '#e63946' : 'var(--text-main)', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
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
                      {/* Google Haritalar'in konum adini gizlemek icin sol ust koseteki ortu */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(to bottom, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0) 100%)', zIndex: 40, pointerEvents: 'none' }}></div>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', maxWidth: '400px', height: '90px', backgroundColor: 'var(--bg-dark)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: '16px', borderRight: '2px solid var(--primary-color)', borderBottom: '2px solid var(--primary-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center', padding: '0 15px' }}>👀 <span style={{color: 'var(--primary-color)'}}>Neresi Burası?</span><br/>Etrafına bak ve tahmin et!</span>
                      </div>
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
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: failed ? '#e63946' : '#2a9d8f', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '10px' }}>
                              {failed ? 'ÇUVALLADIN!' : 'MANIAAAAC'}
                            </div>
                            {!failed && (
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca311' }}>
                                +{lastScore} Puan
                              </div>
                            )}
                            <div style={{ fontSize: '1.2rem' }}>Mesafe: {lastDistance.toFixed(1)} km</div>
                            <div style={{ fontSize: '1rem', color: '#ccc', marginTop: '5px' }}>
                              Hedef: {currentTarget.name}
                            </div>
                          </div>
                          <button className="btn" onClick={handleNextRound} style={{ backgroundColor: failed ? '#e63946' : 'var(--primary-color)' }}>
                            {failed ? 'BAŞTAN BAŞLA' : (currentRound + 1 === TOTAL_ROUNDS ? 'BİTİR HACI' : 'GEÇ HACI')}
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
            </>
          );
        })()
      )}
    </div>
  );
}

export default App;
