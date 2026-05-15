import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Trophy, Flag } from 'lucide-react';
import { GameMap } from './components/GameMap';
import { StreetViewPlayer } from './components/StreetViewPlayer';
import { locations, Location } from './locations';
import { calculateDistance, calculateScore } from './utils';
import logo from './assets/logo.png';
import introMusic from './assets/giris-muzigi.mp3';
import backgroundMusic from './assets/background.mp3';
import countdownMusic from './assets/countdown.mp3';

const MAPILLARY_TOKEN =
  typeof import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN === 'string'
    ? import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN.trim() || undefined
    : undefined;

function filterLocationsByMenuDifficulty(level: 1 | 2 | 3): Location[] {
  return locations.filter((l) => {
    if (level === 1) return l.difficulty === 1;
    if (level === 2) return l.difficulty <= 2;
    return true;
  });
}

function App() {
  const [gameLocations, setGameLocations] = useState<Location[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [roundOver, setRoundOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3>(1);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const introAudioRef = React.useRef<HTMLAudioElement>(null);
  const bgAudioRef = React.useRef<HTMLAudioElement>(null);
  const countdownAudioRef = React.useRef<HTMLAudioElement>(null);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationPoolRef = useRef<Location[]>(locations);

  const guessRef = useRef(guess);
  const roundOverRef = useRef(roundOver);
  const gameLocationsRef = useRef<Location[]>(gameLocations);
  const currentRoundRef = useRef(currentRound);
  const timeLeftRef = useRef(timeLeft);

  guessRef.current = guess;
  roundOverRef.current = roundOver;
  gameLocationsRef.current = gameLocations;
  currentRoundRef.current = currentRound;
  timeLeftRef.current = timeLeft;

  const TOTAL_ROUNDS = 10;

  const handleGuess = useCallback(() => {
    if (roundOverRef.current) return;
    const target = gameLocationsRef.current[currentRoundRef.current];
    if (!target) return;

    let distance = 9999;
    let score = 0;
    const g = guessRef.current;

    if (g) {
      distance = calculateDistance(g.lat, g.lng, target.lat, target.lng);
      score = calculateScore(distance);
      if (timeLeftRef.current > 60) {
        score *= 2;
      }
    }

    setLastDistance(distance);
    setLastScore(score);
    setTotalScore((prev) => prev + score);
    setRoundOver(true);
  }, []);

  const handleGuessRef = useRef(handleGuess);
  handleGuessRef.current = handleGuess;

  // Intro music
  useEffect(() => {
    const startIntro = () => {
      if (!gameStarted && introAudioRef.current) {
        introAudioRef.current.volume = 0.6;
        introAudioRef.current.play().catch((e) => console.log('Giriş müziği çalınamadı:', e));
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

  // Round timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (!roundOver && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      if (timeLeft === 20 && countdownAudioRef.current) {
        countdownAudioRef.current.play().catch((e) => console.log('Geri sayım müziği çalınamadı:', e));
      }
    } else if (timeLeft === 0 && !roundOver && !gameOver) {
      handleGuessRef.current();
    }

    if (roundOver && countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0;
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, roundOver, gameOver]);

  // Background music
  useEffect(() => {
    if (gameStarted && !gameOver && !roundOver) {
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.15;
        bgAudioRef.current.play().catch((e) => console.log('Background müzik çalınamadı:', e));
      }
    } else {
      bgAudioRef.current?.pause();
    }
  }, [gameStarted, gameOver, roundOver]);

  // Sokak görünümü çok yavaşsa yükleme ekranını kaldır
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const id = window.setTimeout(() => setLoadingLocation(false), 12000);
    return () => clearTimeout(id);
  }, [currentRound, gameStarted, gameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRound = () => {
    setGuess(null);
    setRoundOver(false);
    setLastScore(0);
    setLastDistance(0);
    setTimeLeft(120);
    setShowSkipBtn(false);
    setLoadingLocation(true);

    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => setShowSkipBtn(true), 4000);
  };

  const startNewGame = () => {
    const pool = filterLocationsByMenuDifficulty(selectedDifficulty);
    const usable = pool.length > 0 ? pool : locations;
    locationPoolRef.current = usable;

    const shuffled = [...usable].sort(() => Math.random() - 0.5);
    setGameLocations(shuffled);
    setTotalScore(0);
    setCurrentRound(0);
    setGameOver(false);
    setGameStarted(true);

    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }

    resetRound();
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
    const pool = locationPoolRef.current;
    const newLoc = pool[Math.floor(Math.random() * pool.length)];
    setGameLocations((prev) => {
      const updated = [...prev];
      updated[currentRound] = newLoc;
      return updated;
    });
    resetRound();
  };

  const handlePanoramaReady = useCallback(() => {
    setLoadingLocation(false);
  }, []);

  const handlePanoramaFailed = useCallback(() => {
    setLoadingLocation(false);
    setShowSkipBtn(true);
  }, []);

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
              <p className="diff-hint">
                Kolay: bilinen merkezler · Orta: + il içi yollar · Zor: tüm Türkiye havuzu
              </p>
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

          {showHowToPlay && (
            <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
                    <p>
                      Hızlı ol! 200 km içinde puan alırsın; ilk 60 saniyede tahmin yaparsan{' '}
                      <strong>2X puan</strong> kazanırsın.
                    </p>
                  </div>
                  <div className="how-step">
                    <span className="step-num">4</span>
                    <p>10 tur sonunda en yüksek skora ulaşmaya çalış!</p>
                  </div>
                </div>
                <button className="btn-modal-close" onClick={() => setShowHowToPlay(false)}>
                  ANLADIM HACI!
                </button>
              </div>
            </div>
          )}
          <div className="landing-footer-new">© 2026</div>
        </div>
      ) : (
        gameLocations.length > 0 &&
        (() => {
          const currentTarget = gameLocations[currentRound];
          const difficultyText =
            currentTarget.difficulty === 1
              ? 'Kolay'
              : currentTarget.difficulty === 2
                ? 'Orta'
                : 'Zor';
          const difficultyColor =
            currentTarget.difficulty === 1 ? '#2a9d8f' : currentTarget.difficulty === 2 ? '#fca311' : '#e63946';

          return (
            <>
              <div className="game-top-bar animate-top">
                <div
                  className="back-btn-wrap"
                  onClick={() => {
                    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
                    setGameStarted(false);
                  }}
                >
                  <Flag size={20} color="var(--neon-yellow)" />
                  <span>MENÜ</span>
                </div>

                {showSkipBtn && !roundOver && !isMapOpen && (
                  <div className="skip-btn-wrap animate-fade" onClick={handleSkipLocation}>
                    <span>📵 ATLA</span>
                  </div>
                )}

                {!gameOver && !roundOver && (
                  <div className={`top-timer-wrap ${timeLeft < 30 ? 'pulse-urgent' : ''}`}>
                    <span className="top-timer-val">{formatTime(timeLeft)}</span>
                    <span className="top-timer-lab">SÜRE</span>
                  </div>
                )}

                <div className="difficulty-tag" style={{ color: difficultyColor }}>
                  {difficultyText}
                </div>
              </div>

              <main className="game-area">
                {!gameOver ? (
                  <>
                    <div className="image-section">
                      {(!currentTarget || loadingLocation) && (
                        <div className="location-loader">
                          <div className="loader-spinner"></div>
                          <p>{!currentTarget ? 'VERİ YÜKLENİYOR...' : 'SOKAK GÖRÜNÜMÜ YÜKLENİYOR...'}</p>
                        </div>
                      )}
                      {currentTarget && (
                        <StreetViewPlayer
                          key={currentTarget.id}
                          lat={currentTarget.lat}
                          lng={currentTarget.lng}
                          locationKey={currentTarget.id}
                          mapillaryAccessToken={MAPILLARY_TOKEN}
                          onReady={handlePanoramaReady}
                          onLoadFailed={handlePanoramaFailed}
                        />
                      )}
                      <div className="blackout-mask-new"></div>
                    </div>

                    <div className={`map-overlay-container ${isMapOpen || roundOver ? 'open' : ''}`}>
                      <div className="map-modal-content">
                        {isMapOpen && !roundOver && (
                          <button className="btn-close-map" onClick={() => setIsMapOpen(false)}>
                            BAKMAYA DEVAM ET
                          </button>
                        )}
                        <GameMap
                          guess={guess}
                          setGuess={(g) => {
                            setGuess(g);
                            if (!roundOver) {
                              setTimeout(() => setIsMapOpen(false), 300);
                            }
                          }}
                          targetLocation={currentTarget}
                          roundOver={roundOver}
                        />
                      </div>
                    </div>

                    {!roundOver && !isMapOpen && (
                      <div className={`map-trigger-icon ${guess ? 'has-pin' : ''}`} onClick={() => setIsMapOpen(true)}>
                        <MapPin size={32} color={guess ? 'var(--neon-yellow)' : '#fff'} />
                        <span className="trigger-label">{guess ? 'PİN KONDU' : 'HARİTAYI AÇ'}</span>
                      </div>
                    )}

                    <div className="game-bottom-bar animate-bottom">
                      <div className="bottom-stat-group">
                        <span className="bottom-stat-lab">TUR</span>
                        <span className="bottom-stat-val">{currentRound + 1}/10</span>
                      </div>

                      {guess && !roundOver && (
                        <div className="guess-confirm-wrap" onClick={handleGuess}>
                          <div className="btn-check-neon">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <span className="confirm-lab">TAHMİN ET</span>
                        </div>
                      )}

                      <div className="bottom-stat-group align-right">
                        <span className="bottom-stat-lab">SKOR</span>
                        <span className="bottom-stat-val" style={{ color: 'var(--neon-yellow)' }}>
                          {totalScore}
                        </span>
                      </div>
                    </div>

                    {roundOver && (
                      <div className="round-result-overlay">
                        <div className="result-panel-glass">
                          <div className="result-header">
                            <div
                              className="result-status-text"
                              style={{
                                color: lastScore > 0 ? 'var(--neon-yellow)' : '#e63946',
                                textShadow: lastScore > 0 ? '0 0 15px var(--neon-yellow)' : 'none',
                              }}
                            >
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
                              <div className="score-note">200 km'den uzaktığın veya tahmin yapmadığın için puan yok.</div>
                            )}
                          </div>

                          <button className="btn-next-round" onClick={handleNextRound}>
                            {currentRound + 1 === TOTAL_ROUNDS ? 'SONUCU GÖR HACI' : 'GEÇ HACI'}
                          </button>
                        </div>
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

      <audio ref={introAudioRef} src={introMusic} loop />
      <audio ref={bgAudioRef} src={backgroundMusic} loop />
      <audio ref={countdownAudioRef} src={countdownMusic} />
    </div>
  );
}

export default App;
