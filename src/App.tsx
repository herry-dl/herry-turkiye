import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Flag } from 'lucide-react';
import { GameMap } from './components/GameMap';
import { locations, Location } from './locations';
import { calculateDistance, calculateScore } from './utils';
import logo from './assets/logo.png';
import bannerDesktop from './assets/banner-desktop.webp';
import bannerMobile from './assets/banner-mobile.webp';
import introMusic from './assets/giris-muzigi.mp3';
import backgroundMusic from './assets/background.mp3';
import countdownMusic from './assets/countdown.mp3';

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
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const introAudioRef = React.useRef<HTMLAudioElement>(null);
  const bgAudioRef = React.useRef<HTMLAudioElement>(null);
  const countdownAudioRef = React.useRef<HTMLAudioElement>(null);
  const skipTimerRef = React.useRef<any>(null);

  const TOTAL_ROUNDS = 10;

  // Initialize game and handle intro music
  useEffect(() => {
    if (!gameStarted && introAudioRef.current) {
      introAudioRef.current.volume = 0.6;
      introAudioRef.current.play().catch(e => console.log("Giriş müziği çalınamadı:", e));
    }
  }, [gameStarted]);

  useEffect(() => {
    let timer: any;
    if (!roundOver && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      
      // Son 20 saniye kala müziği başlat
      if (timeLeft === 20 && countdownAudioRef.current) {
        countdownAudioRef.current.play().catch(e => console.log("Geri sayım müziği çalınamadı:", e));
      }
    } else if (timeLeft === 0 && !roundOver) {
      handleGuess();
    }
    
    // Tur bittiyse müziği durdur
    if (roundOver && countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0;
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, roundOver, gameOver]);

  // Handle background music
  useEffect(() => {
    if (gameStarted && !gameOver && !roundOver) {
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.15; // Kısık ses
        bgAudioRef.current.play().catch(e => console.log("Background müzik çalınamadı:", e));
      }
    } else {
      bgAudioRef.current?.pause();
    }
  }, [gameStarted, gameOver, roundOver]);

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
    
    // Stop intro music when game starts
    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
    
    resetRound();
  };

  const resetRound = () => {
    setGuess(null);
    setRoundOver(false);
    setLastScore(0);
    setLastDistance(0);
    setTimeLeft(120);
    setShowSkipBtn(false);
    // Show skip button after 4 seconds in case of blackout
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => setShowSkipBtn(true), 4000);
  };

  const handleGuess = () => {
    if (roundOver) return;

    const target = gameLocations[currentRound];
    let distance = 9999;
    let score = 0;

    if (guess) {
      distance = calculateDistance(guess.lat, guess.lng, target.lat, target.lng);
      score = calculateScore(distance);
      
      // 1 dakikadan az sürede bulursa (timeLeft > 60) puan 2 katı
      if (timeLeft > 60) {
        score = score * 2;
      }
    }

    setLastDistance(distance);
    setLastScore(score);
    setTotalScore((prev) => prev + score);
    setRoundOver(true);
    setFailed(false);
  };

  const handleNextRound = () => {
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setGameOver(true);
    } else {
      setCurrentRound((prev) => prev + 1);
      resetRound();
    }
  };

  const handleSkipLocation = () => {
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    // Pick a new random location, replacing current blackout spot
    const newLoc = locations[Math.floor(Math.random() * locations.length)];
    setGameLocations(prev => {
      const updated = [...prev];
      updated[currentRound] = newLoc;
      return updated;
    });
    resetRound();
  };

  return (
    <div className="app-container">
      {!gameStarted ? (
        <div className="landing-page">
          <div className="landing-content">
            <div className="banner-container">
              <img src={bannerMobile} alt="Türkiye Kâşifi" className="landing-banner" />
            </div>
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
                        src={`https://maps.google.com/maps?layer=c&cbll=${currentTarget.lat},${currentTarget.lng}&cbp=12,0,0,0,0&output=svembed&hl=tr`} 
                        allowFullScreen
                      ></iframe>
                      {/* Google Haritalar'in konum adini gizlemek icin sol ust koseteki ortu */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(to bottom, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0) 100%)', zIndex: 40, pointerEvents: 'none' }}></div>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', maxWidth: '400px', height: '90px', backgroundColor: 'var(--bg-dark)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: '16px', borderRight: '2px solid var(--primary-color)', borderBottom: '2px solid var(--primary-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center', padding: '0 15px' }}>👀 <span style={{color: 'var(--primary-color)'}}>Neresi Burası?</span><br/>Etrafına bak ve tahmin et!</span>
                      </div>
                      {/* Skip button - appears after 4s if blackout */}
                      {showSkipBtn && !roundOver && (
                        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
                          <button
                            onClick={handleSkipLocation}
                            style={{
                              background: 'rgba(230,57,70,0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '30px',
                              padding: '10px 24px',
                              fontSize: '0.95rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              backdropFilter: 'blur(4px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}
                          >
                            📵 Görüntü Yok — Atla
                          </button>
                        </div>
                      )}
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
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: lastScore > 0 ? '#2a9d8f' : '#e63946', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '10px' }}>
                          {lastScore > 0 ? (timeLeft > 60 ? 'SÜPER HIZLI MANIAAAAC!' : 'MANIAAAAC') : 'COK UZAKTASIN HACI!'}
                        </div>
                        {lastScore > 0 && (
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca311' }}>
                            +{lastScore} Puan {timeLeft > 60 && <span style={{fontSize: '1rem', display: 'block'}}>(Hız Bonusu: 2x)</span>}
                          </div>
                        )}
                        <div style={{ fontSize: '1.2rem' }}>Mesafe: {lastDistance.toFixed(1)} km</div>
                        <div style={{ fontSize: '1rem', color: '#ccc', marginTop: '5px' }}>
                          Hedef: {currentTarget.name}
                        </div>
                          </div>
                          <button className="btn" onClick={handleNextRound} style={{ backgroundColor: 'var(--primary-color)' }}>
                            {currentRound + 1 === TOTAL_ROUNDS ? 'BİTİR HACI' : 'GEÇ HACI'}
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
                      <p style={{ color: 'var(--text-muted)' }}>Maksimum: {TOTAL_ROUNDS * 200}</p>
                      
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
      
      {/* Müzikler */}
      <audio ref={introAudioRef} src={introMusic} loop />
      <audio ref={bgAudioRef} src={backgroundMusic} loop />
      <audio ref={countdownAudioRef} src={countdownMusic} />
    </div>
  );
}

export default App;
