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
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3>(1);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const introAudioRef = React.useRef<HTMLAudioElement>(null);
  const bgAudioRef = React.useRef<HTMLAudioElement>(null);
  const countdownAudioRef = React.useRef<HTMLAudioElement>(null);
  const skipTimerRef = React.useRef<any>(null);

  const TOTAL_ROUNDS = 10;

  // Initialize game and handle intro music
  useEffect(() => {
    const startIntro = () => {
      if (!gameStarted && introAudioRef.current) {
        introAudioRef.current.volume = 0.6;
        introAudioRef.current.play().catch(e => console.log("Giriş müziği çalınamadı:", e));
        // Remove listener after first interaction
        document.removeEventListener('click', startIntro);
        document.removeEventListener('touchstart', startIntro);
      }
    };

    document.addEventListener('click', startIntro);
    document.addEventListener('touchstart', startIntro);

    return () => {
      document.removeEventListener('click', startIntro);
      document.removeEventListener('touchstart', startIntro);
    };
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
    // Seçilen zorluğa göre lokasyonları filtrele
    const filtered = locations.filter(l => l.difficulty === selectedDifficulty);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, TOTAL_ROUNDS);
    
    setGameLocations(selected);
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
    setLoadingLocation(true);
    // Hide loading screen after 1.5s
    setTimeout(() => setLoadingLocation(false), 1500);

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
          <div className="landing-content-card">
            <div className="landing-logo-container">
              <img src={logo} alt="HERRY TÜRKİYE" className="landing-logo-img" />
            </div>
            <h1 className="landing-title-main">TÜRKİYE KÂŞİFİ</h1>
            <p className="by-dagli-new">BY Dagli</p>
            <div className="difficulty-selector">
              <span className="diff-label">ZORLUK SEÇ:</span>
              <div className="diff-buttons">
                <button 
                  className={`diff-btn ${selectedDifficulty === 1 ? 'active easy' : ''}`}
                  onClick={() => setSelectedDifficulty(1)}
                >
                  Kolay
                </button>
                <button 
                  className={`diff-btn ${selectedDifficulty === 2 ? 'active medium' : ''}`}
                  onClick={() => setSelectedDifficulty(2)}
                >
                  Orta
                </button>
                <button 
                  className={`diff-btn ${selectedDifficulty === 3 ? 'active hard' : ''}`}
                  onClick={() => setSelectedDifficulty(3)}
                >
                  Zor
                </button>
              </div>
            </div>
            
            <div className="landing-buttons-new">
              <button className="btn-play-new" onClick={startNewGame}>
                <Flag size={24} />
                MACERAYA BAŞLA
              </button>
              <button className="btn-how-new" onClick={() => setShowHowToPlay(true)}>
                NASIL OYNANIR?
              </button>
            </div>
          </div>

          {/* Nasıl Oynanır Modalı */}
          {showHowToPlay && (
            <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
              <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">NASIL OYNANIR?</h2>
                <div className="modal-body">
                  <div className="how-step">
                    <span className="step-num">1</span>
                    <p>Etrafına bakarak Türkiye'nin neresinde olduğunu tahmin etmeye çalış.</p>
                  </div>
                  <div className="how-step">
                    <span className="step-num">2</span>
                    <p>Haritaya tıkla ve yerini işaretle. Merkeze ne kadar yakınsan o kadar çok puan!</p>
                  </div>
                  <div className="how-step">
                    <span className="step-num">3</span>
                    <p>Hızlı ol! İlk 60 saniyede tahmin yaparsan <strong>2X puan</strong> kazanırsın.</p>
                  </div>
                  <div className="how-step">
                    <span className="step-num">4</span>
                    <p>10 tur sonunda en yüksek skora ulaşmaya çalış!</p>
                  </div>
                </div>
                <button className="btn-modal-close" onClick={() => setShowHowToPlay(false)}>ANLADIM HACI!</button>
              </div>
            </div>
          )}
          <div className="landing-footer-new">
            © 2026
          </div>
        </div>
      ) : (
        gameLocations.length > 0 && (() => {
          const currentTarget = gameLocations[currentRound];
          const difficultyText = currentTarget.difficulty === 1 ? 'Kolay' : currentTarget.difficulty === 2 ? 'Orta' : 'Zor';
          const difficultyColor = currentTarget.difficulty === 1 ? '#2a9d8f' : currentTarget.difficulty === 2 ? '#fca311' : '#e63946';
          
          return (
            <>
              {/* Sol Üst: Büyük Logo */}
              <div className="floating-logo" onClick={() => setGameStarted(false)}>
                <img src={logo} alt="HERRY TÜRKİYE" className="logo-img-floating" />
              </div>

              {/* Sağ Üst: Yüzen Dairesel İstatistikler */}
              <div className="floating-stats-container">
                <div className="stat-circle-new">
                  <span className="stat-label-mini">ZORLUK</span>
                  <span className="stat-value-mini" style={{ color: difficultyColor }}>{difficultyText}</span>
                </div>
                <div className="stat-circle-new">
                  <span className="stat-label-mini">TUR</span>
                  <span className="stat-value-mini">{currentRound + 1}/10</span>
                </div>
                <div className="stat-circle-new">
                  <span className="stat-label-mini">SKOR</span>
                  <span className="stat-value-mini" style={{ color: '#fca311' }}>{totalScore}</span>
                </div>
                
                {/* Dairesel Süre Paneli */}
                {!gameOver && !roundOver && (
                  <div className={`stat-circle-new timer-circle-wrap ${timeLeft < 30 ? 'pulse-urgent' : ''}`}>
                    <svg viewBox="0 0 100 100" className="timer-svg-mini">
                      <circle className="timer-bg" cx="50" cy="50" r="45" />
                      <circle 
                        className="timer-progress" 
                        cx="50" cy="50" r="45" 
                        style={{ strokeDashoffset: (1 - timeLeft / 120) * 283 }}
                      />
                    </svg>
                    <div className="timer-text-mini">
                      <span className="timer-val">{formatTime(timeLeft)}</span>
                      <span className="timer-lab">SÜRE</span>
                    </div>
                  </div>
                )}
              </div>

              <main className="game-area">
                {!gameOver ? (
                  <>
                    <div className="image-section">
                      {loadingLocation && (
                        <div className="location-loader">
                          <div className="loader-spinner"></div>
                          <p>LOKASYON HAZIRLANIYOR...</p>
                        </div>
                      )}
                      <iframe 
                        title="Street View"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: loadingLocation ? 0 : 1 }} 
                        src={`https://maps.google.com/maps?layer=c&cbll=${currentTarget.lat},${currentTarget.lng}&cbp=12,0,0,0,0&output=svembed&hl=tr`} 
                        allowFullScreen
                      ></iframe>
                      {/* Google Haritalar'in konum adini gizlemek icin sol ust koseteki ortu */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(to bottom, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0) 100%)', zIndex: 40, pointerEvents: 'none' }}></div>
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

                    {(guess || roundOver) && (
                      <div className="controls-overlay">
                        {!roundOver ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <button 
                              className="btn" 
                              onClick={handleGuess}
                            >
                              Tahmin Et
                            </button>
                          </div>
                        ) : (
                          <div className="result-panel-glass">
                            <div className="result-header">
                              <div className="result-status-text" style={{ color: lastScore > 0 ? 'var(--neon-yellow)' : '#e63946', textShadow: lastScore > 0 ? '0 0 15px var(--neon-yellow)' : 'none' }}>
                                {lastScore > 0 ? 'MANIAAAC!' : 'ÇOK UZAKTASIN!'}
                              </div>
                              <div className="result-location-name">{currentTarget.name}</div>
                            </div>
                            
                            <div className="score-breakdown">
                              <div className="score-row">
                                <span>MESAFE</span>
                                <span>{lastDistance.toFixed(1)} km</span>
                              </div>
                              <div className="score-row">
                                <span>PUAN</span>
                                <span>{Math.floor(lastScore / (timeLeft > 60 && lastScore > 0 ? 2 : 1))}</span>
                              </div>
                              {timeLeft > 60 && lastScore > 0 && (
                                <div className="score-row bonus">
                                  <span>HIZ BONUSU</span>
                                  <span>2X 🔥</span>
                                </div>
                              )}
                              <div className="score-total-row">
                                <span>TOPLAM</span>
                                <span>{lastScore} PUAN</span>
                              </div>
                              {lastScore === 0 && (
                                <div className="score-note">1000km'den uzak olduğun için puan alamadın.</div>
                              )}
                            </div>

                            <button className="btn-next-round" onClick={handleNextRound}>
                              {currentRound + 1 === TOTAL_ROUNDS ? 'SONUCU GÖR HACI' : 'GEÇ HACI'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
