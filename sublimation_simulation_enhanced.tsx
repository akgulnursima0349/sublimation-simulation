import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Thermometer, Eye, BookOpen, AlertTriangle, Settings, BarChart3, Trophy, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';

interface ObservationRecord {
  stage: string;
  time: string;
  temperature: number;
  observation: string;
  explanation: string;
}

interface ExperimentState {
  currentPhase: 'theory' | 'materials' | 'safety' | 'variables' | 'setup' | 'experiment' | 'observation' | 'analysis' | 'errors' | 'evaluation';
  temperature: number;
  heatingActive: boolean;
  coolingActive: boolean;
  sublimationLevel: number;
  crystallizationLevel: number;
  experimentTime: number;
  naphthaleneMass: number;
  flameIntensity: number;
  iceAdded: boolean;
  setupComplete: boolean;
  experimentStarted: boolean;
  // Yeni gerçekçi parametreler
  ambientTemperature: number;
  pressure: number;
  humidity: number;
  vaporDensity: number;
  crystalSize: number;
  heatConduction: number;
}

interface Equipment {
  beaker: boolean;
  naftalin: boolean;
  watchGlass: boolean;
  tripod: boolean;
  burner: boolean;
  ice: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'vapor' | 'crystal' | 'heat';
}

const SublimationExperiment: React.FC = () => {
  const [state, setState] = useState<ExperimentState>({
    currentPhase: 'theory',
    temperature: 25,
    heatingActive: false,
    coolingActive: false,
    sublimationLevel: 0,
    crystallizationLevel: 0,
    experimentTime: 0,
    naphthaleneMass: 100,
    flameIntensity: 50,
    iceAdded: false,
    setupComplete: false,
    experimentStarted: false,
    ambientTemperature: 25,
    pressure: 1013.25, // hPa
    humidity: 60,
    vaporDensity: 0,
    crystalSize: 0,
    heatConduction: 0.5
  });

  const [equipment, setEquipment] = useState<Equipment>({
    beaker: false,
    naftalin: false,
    watchGlass: false,
    tripod: false,
    burner: false,
    ice: false
  });

  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  // const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  // const [showResults, setShowResults] = useState(false);
  const [experimentPhase, setExperimentPhase] = useState<'heating' | 'sublimation' | 'cooling' | 'crystallization' | 'complete'>('heating');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particleId, setParticleId] = useState(0);

  // const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  // Ses efektleri
  const playSound = useCallback((soundType: 'heating' | 'crystallization' | 'success' | 'error') => {
    if (!soundEnabled) return;
    
    // Web Audio API ile basit ses efektleri
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (soundType) {
      case 'heating':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'crystallization':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);
        break;
    }
  }, [soundEnabled]);

  // Parçacık sistemi
  const createParticle = useCallback((type: 'vapor' | 'crystal' | 'heat', x: number, y: number) => {
    const newParticle: Particle = {
      id: particleId,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: type === 'vapor' ? -Math.random() * 3 - 1 : type === 'crystal' ? 0 : Math.random() * 2,
      life: 0,
      maxLife: type === 'vapor' ? 120 : type === 'crystal' ? 200 : 60,
      type
    };
    setParticleId(prev => prev + 1);
    return newParticle;
  }, [particleId]);

  // Gerçekçi fizik hesaplamaları
  const calculateRealisticPhysics = useCallback((prevState: ExperimentState) => {
    const dt = 0.1; // Zaman adımı
    let newTemp = prevState.temperature;
    let newSublimation = prevState.sublimationLevel;
    let newMass = prevState.naphthaleneMass;
    let newVaporDensity = prevState.vaporDensity;
    let newCrystalSize = prevState.crystalSize;
    let newHeatConduction = prevState.heatConduction;

    // Isıtma hesaplaması (Fourier yasası)
    if (prevState.heatingActive) {
      const heatInput = (prevState.flameIntensity / 100) * 50; // W/m²
      const heatLoss = 0.1 * (newTemp - prevState.ambientTemperature); // Çevreye ısı kaybı
      const netHeat = heatInput - heatLoss;
      newTemp = Math.min(prevState.temperature + netHeat * dt, 250);
    } else {
      // Doğal soğuma
      const coolingRate = 0.05 * (newTemp - prevState.ambientTemperature);
      newTemp = Math.max(prevState.ambientTemperature, newTemp - coolingRate * dt);
    }

    // Süblimleşme hesaplaması (Clausius-Clapeyron denklemi)
    if (newTemp > 80 && prevState.naphthaleneMass > 0) {
      const sublimationPressure = 0.001 * Math.exp((newTemp - 80) / 20); // Basitleştirilmiş
      const sublimationRate = sublimationPressure * (prevState.pressure / 1013.25) * dt;
      newSublimation = Math.min(100, prevState.sublimationLevel + sublimationRate * 100);
      newMass = Math.max(0, prevState.naphthaleneMass - sublimationRate * 100);
      newVaporDensity = Math.min(1, prevState.vaporDensity + sublimationRate * 50);
    }

    // Kristalleşme hesaplaması
    if (prevState.iceAdded && prevState.sublimationLevel > 0) {
      const coolingRate = 0.02 * (prevState.sublimationLevel / 100);
      const crystallizationRate = coolingRate * dt * 100;
      newCrystalSize = Math.min(prevState.sublimationLevel, prevState.crystalSize + crystallizationRate);
    }

    // Isı iletimi
    newHeatConduction = Math.min(1, prevState.heatConduction + (newTemp - prevState.temperature) * 0.01);

    return {
      ...prevState,
      temperature: newTemp,
      sublimationLevel: newSublimation,
      naphthaleneMass: newMass,
      vaporDensity: newVaporDensity,
      crystalSize: newCrystalSize,
      heatConduction: newHeatConduction
    };
  }, []);

  // Ana simülasyon döngüsü
  useEffect(() => {
    let interval: number;
    
    if (state.currentPhase === 'experiment') {
      interval = setInterval(() => {
        setState(prev => {
          const newState = calculateRealisticPhysics(prev);
          
          // Parçacık oluşturma
          if (newState.heatingActive && newState.temperature > 50) {
            const newParticles = [...particles];
            if (Math.random() < 0.3) {
              newParticles.push(createParticle('heat', 175 + Math.random() * 20, 200));
            }
            if (newState.sublimationLevel > 5 && Math.random() < 0.4) {
              newParticles.push(createParticle('vapor', 175 + Math.random() * 20, 150));
            }
            setParticles(newParticles);
          }
          
          if (newState.iceAdded && newState.crystalSize > 0 && Math.random() < 0.2) {
            const newParticles = [...particles];
            newParticles.push(createParticle('crystal', 175 + Math.random() * 20, 100));
            setParticles(newParticles);
          }
          
          return {
            ...newState,
            experimentTime: prev.experimentTime + 1
          };
        });
      }, 100); // Daha hızlı güncelleme
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.currentPhase, state.heatingActive, state.iceAdded, calculateRealisticPhysics, createParticle, particles]);

  // Parçacık animasyonu
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life + 1,
            vx: particle.vx + (Math.random() - 0.5) * 0.1,
            vy: particle.vy + (particle.type === 'vapor' ? -0.01 : 0.01)
          }))
          .filter(particle => particle.life < particle.maxLife)
      );
      
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };

    if (state.currentPhase === 'experiment') {
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.currentPhase]);

  // Otomatik gözlem kaydı
  const addObservation = useCallback((stage: string, observation: string, explanation: string) => {
    const newObservation: ObservationRecord = {
      stage,
      time: `${Math.floor(state.experimentTime / 10)}s`,
      temperature: Math.round(state.temperature),
      observation,
      explanation
    };
    setObservations(prev => [...prev, newObservation]);
  }, [state.experimentTime, state.temperature]);

  // Otomatik faz geçişleri ve gözlemler
  useEffect(() => {
    if (state.temperature > 25 && state.temperature < 30 && state.heatingActive && !observations.some(o => o.stage === 'Isıtma Başı')) {
      addObservation('Isıtma Başı', 'Naftalin katı halde, ısıtma başladı', 'Başlangıç durumu');
      playSound('heating');
    }
    
    if (state.sublimationLevel > 5 && state.sublimationLevel < 10 && !observations.some(o => o.stage === 'Süblimleşme Başlangıcı')) {
      addObservation('Süblimleşme Başlangıcı', 'Naftalin erimeden buharlaşmaya başladı', 'Katı → Gaz hal değişimi');
      setExperimentPhase('sublimation');
    }
    
    if (state.sublimationLevel > 50 && !observations.some(o => o.stage === 'Yoğun Süblimleşme')) {
      addObservation('Yoğun Süblimleşme', 'Naftalin hızla buharlaşıyor, yoğun buhar görülüyor', 'Süblimleşme hızlandı');
    }
    
    if (state.iceAdded && !observations.some(o => o.stage === 'Buz Eklendi')) {
      addObservation('Buz Eklendi', 'Saat camına buz eklendi, soğutma başladı', 'Kristalleşme için hazırlık');
      setExperimentPhase('cooling');
    }
    
    if (state.crystalSize > 5 && state.crystalSize < 10 && !observations.some(o => o.stage === 'Kristalleşme Başlangıcı')) {
      addObservation('Kristalleşme Başlangıcı', 'Saat camında beyaz kristaller oluşmaya başladı', 'Gaz → Katı hal değişimi');
      setExperimentPhase('crystallization');
      playSound('crystallization');
    }
    
    if (state.crystalSize > 30 && !observations.some(o => o.stage === 'Belirgin Kristalleşme')) {
      addObservation('Belirgin Kristalleşme', 'Saat camında belirgin kristal yapıları görülüyor', 'Kırağılaşma tamamlanıyor');
      playSound('success');
    }
  }, [state.temperature, state.sublimationLevel, state.crystalSize, state.heatingActive, state.iceAdded, addObservation, observations, playSound]);

  // Ekipman yerleştirme
  // const placeEquipment = (item: keyof Equipment) => {
  //   setEquipment(prev => ({ ...prev, [item]: true }));
  //   
  //   const updatedEquipment = { ...equipment, [item]: true };
  //   const isComplete = updatedEquipment.beaker && updatedEquipment.naftalin && 
  //                     updatedEquipment.watchGlass && updatedEquipment.tripod && 
  //                     updatedEquipment.burner;
  //   
  //   if (isComplete) {
  //     setState(prev => ({ ...prev, setupComplete: true }));
  //     playSound('success');
  //   }
  // };

  // Deney kontrolleri
  const startHeating = () => {
    if (state.setupComplete) {
      setState(prev => ({ ...prev, heatingActive: true, experimentStarted: true }));
      setExperimentPhase('heating');
      playSound('heating');
    }
  };

  const stopHeating = () => {
    setState(prev => ({ ...prev, heatingActive: false }));
  };

  const addIce = () => {
    setState(prev => ({ ...prev, iceAdded: true, coolingActive: true }));
    setEquipment(prev => ({ ...prev, ice: true }));
    playSound('crystallization');
  };

  const resetExperiment = () => {
    setState({
      currentPhase: 'theory',
      temperature: 25,
      heatingActive: false,
      coolingActive: false,
      sublimationLevel: 0,
      crystallizationLevel: 0,
      experimentTime: 0,
      naphthaleneMass: 100,
      flameIntensity: 50,
      iceAdded: false,
      setupComplete: false,
      experimentStarted: false,
      ambientTemperature: 25,
      pressure: 1013.25,
      humidity: 60,
      vaporDensity: 0,
      crystalSize: 0,
      heatConduction: 0.5
    });
    setEquipment({
      beaker: false,
      naftalin: false,
      watchGlass: false,
      tripod: false,
      burner: false,
      ice: false
    });
    setObservations([]);
    // setShowResults(false);
    setExperimentPhase('heating');
    setParticles([]);
  };

  // Fazlar tanımlaması
  const phases = [
    { id: 'theory', label: 'Öğrenme Çıktısı ve Amaç', icon: BookOpen },
    { id: 'materials', label: 'Malzemeler', icon: Settings },
    { id: 'safety', label: 'Güvenlik', icon: AlertTriangle },
    { id: 'variables', label: 'Değişkenler', icon: BarChart3 },
    { id: 'setup', label: 'Düzenek Kurma', icon: Eye },
    { id: 'experiment', label: 'Deney Prosedürü', icon: Play },
    { id: 'observation', label: 'Gözlemler', icon: Eye },
    { id: 'analysis', label: 'Veri Analizi', icon: BarChart3 },
    { id: 'errors', label: 'Hata Kaynakları', icon: AlertTriangle },
    { id: 'evaluation', label: 'Değerlendirme', icon: Trophy }
  ];

  // Navigasyon
  const goToPhase = (phaseId: string) => {
    setState(prev => ({ ...prev, currentPhase: phaseId as any }));
  };

  const nextPhase = () => {
    const currentIndex = phases.findIndex(p => p.id === state.currentPhase);
    if (currentIndex < phases.length - 1) {
      goToPhase(phases[currentIndex + 1].id);
    }
  };

  const prevPhase = () => {
    const currentIndex = phases.findIndex(p => p.id === state.currentPhase);
    if (currentIndex > 0) {
      goToPhase(phases[currentIndex - 1].id);
    }
  };

  // Faz navigasyonu
  const PhaseNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
      {phases.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => goToPhase(id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            state.currentPhase === id 
              ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
              : 'bg-white text-blue-600 hover:bg-blue-100 shadow-sm'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );

  // Gelişmiş görsel simülasyon
  const EnhancedExperimentVisualization = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center">Gerçek Zamanlı Fizik Simülasyonu</h3>
      <div className="relative mx-auto" style={{ width: '400px', height: '500px' }}>
        
        {/* Üçayak */}
        {equipment.tripod && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-8">
            <div className="absolute bottom-0 left-2 w-1 h-6 bg-gray-700 transform rotate-12"></div>
            <div className="absolute bottom-0 right-2 w-1 h-6 bg-gray-700 transform -rotate-12"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gray-700"></div>
            <div className="absolute top-0 w-full h-1 bg-gray-700 rounded"></div>
          </div>
        )}
        
        {/* Beher */}
        {equipment.beaker && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-28 h-36 border-4 border-gray-600 rounded-b-2xl bg-gradient-to-t from-gray-100 to-transparent">
            
            {/* Naftalin */}
            {equipment.naftalin && (
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-b-2xl transition-all duration-1000"
                style={{ 
                  height: `${Math.max(8, (state.naphthaleneMass / 100) * 30)}px`,
                  opacity: Math.max(0.3, state.naphthaleneMass / 100)
                }}
              >
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border border-yellow-400 rounded opacity-80"></div>
              </div>
            )}
            
            {/* Isı iletimi efekti */}
            {state.heatConduction > 0 && (
              <div 
                className="absolute inset-0 rounded-b-2xl transition-all duration-1000"
                style={{
                  background: `linear-gradient(to top, rgba(255,100,0,${state.heatConduction * 0.3}), transparent)`
                }}
              ></div>
            )}
          </div>
        )}
        
        {/* Saat Camı */}
        {equipment.watchGlass && (
          <div className="absolute bottom-52 left-1/2 transform -translate-x-1/2 w-32 h-3 bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-200 rounded-full shadow-lg border border-blue-300">
            
            {/* Buz Efekti */}
            {equipment.ice && (
              <div className="absolute -top-3 w-full h-5 bg-gradient-to-b from-blue-300 via-blue-200 to-transparent rounded-full opacity-90">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${2 + (i % 2)}px`
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Kristalleşme Efekti */}
            {state.crystalSize > 0 && (
              <div className="absolute -bottom-1 w-full flex justify-center space-x-1">
                {[...Array(Math.min(12, Math.floor(state.crystalSize / 5)))].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full animate-pulse shadow-sm border border-gray-200"
                    style={{
                      width: `${2 + (i % 3)}px`,
                      height: `${2 + (i % 3)}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* İspirto Ocağı */}
        {equipment.burner && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-800 rounded shadow-lg">
            
            {/* Gelişmiş Alev Efekti */}
            {state.heatingActive && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div 
                  className="bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-t-full animate-pulse shadow-lg"
                  style={{ 
                    width: `${8 + (state.flameIntensity / 100) * 6}px`,
                    height: `${(state.flameIntensity / 100) * 30 + 15}px`
                  }}
                />
                
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-blue-500 to-transparent rounded-t-full opacity-60"
                  style={{ 
                    width: `${4 + (state.flameIntensity / 100) * 3}px`,
                    height: `${(state.flameIntensity / 100) * 20 + 10}px`
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Parçacık Sistemi */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${
              particle.type === 'vapor' ? 'bg-gray-400' :
              particle.type === 'crystal' ? 'bg-white' : 'bg-red-400'
            }`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.type === 'crystal' ? 2 : 3}px`,
              height: `${particle.type === 'crystal' ? 2 : 3}px`,
              opacity: 1 - (particle.life / particle.maxLife),
              transform: `scale(${1 - (particle.life / particle.maxLife) * 0.5})`
            }}
          />
        ))}
        
        {/* Sıcaklık Dalgaları */}
        {state.temperature > 50 && (
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-20 h-8 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-1 bg-red-300 rounded animate-pulse"
                style={{
                  bottom: `${i * 6}px`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.4 - i * 0.08
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Gelişmiş Ölçümler */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Süblimleşme İlerlemesi</h4>
          <div className="flex justify-between text-sm mb-1">
            <span>İlerleme</span>
            <span>{state.sublimationLevel.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${state.sublimationLevel}%` }}
            >
              {state.sublimationLevel > 0 && (
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Buhar Yoğunluğu: {(state.vaporDensity * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Kristalleşme İlerlemesi</h4>
          <div className="flex justify-between text-sm mb-1">
            <span>İlerleme</span>
            <span>{state.crystalSize.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${state.crystalSize}%` }}
            >
              {state.crystalSize > 0 && (
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Kristal Boyutu: {(state.crystalSize * 0.1).toFixed(2)}mm
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Fizik Parametreleri</h4>
          <div className="space-y-1 text-xs">
            <div>Sıcaklık: {state.temperature.toFixed(1)}°C</div>
            <div>Basınç: {state.pressure.toFixed(1)} hPa</div>
            <div>Nem: {state.humidity}%</div>
            <div>Isı İletimi: {(state.heatConduction * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );

  // İçerik render fonksiyonları (kısaltılmış)
  const TheoryPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Öğrenme Çıktısı ve Amaç</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Kazanım
            </h3>
            <p className="text-gray-700">
              Bazı katı maddelerin ısıtıldığında doğrudan gaza geçebildiğini (süblimleşme) ve 
              bu gazın soğuk yüzeyde doğrudan katılaşabildiğini (kırağılaşma/depozisyon) gözlemler ve açıklar.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Amaç
            </h3>
            <p className="text-gray-700">
              Noctelin (naftalin) örneğini ısıtarak süblimleşmesini, üstteki soğuk cam yüzeyinde 
              ise kırağılaşmasını gözlemek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ExperimentPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Deney Prosedürü</h2>
        
        {/* Kontrol Paneli */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Isıtma Kontrolü
            </h3>
            <div className="space-y-2">
              <button
                onClick={startHeating}
                disabled={!state.setupComplete || state.heatingActive}
                className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Isıtmayı Başlat
              </button>
              <button
                onClick={stopHeating}
                disabled={!state.heatingActive}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
              >
                Isıtmayı Durdur
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Alev Şiddeti</h3>
            <input
              type="range"
              min="20"
              max="100"
              value={state.flameIntensity}
              onChange={(e) => setState(prev => ({ ...prev, flameIntensity: parseInt(e.target.value) }))}
              className="w-full mb-2"
              disabled={!state.heatingActive}
            />
            <p className="text-sm text-gray-600">{state.flameIntensity}%</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Soğutma</h3>
            <button
              onClick={addIce}
              disabled={state.iceAdded || state.sublimationLevel < 10}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50 mb-2"
            >
              Buz Ekle
            </button>
            <p className="text-xs text-gray-600">
              {state.sublimationLevel < 10 ? 'Önce süblimleşmeyi bekleyin' : 
               state.iceAdded ? 'Buz eklendi' : 'Buz ekleyebilirsiniz'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Ölçümler
            </h3>
            <div className="space-y-1 text-sm">
              <div>Sıcaklık: {state.temperature.toFixed(1)}°C</div>
              <div>Süre: {Math.floor(state.experimentTime / 10)}s</div>
              <div>Naftalin: {state.naphthaleneMass.toFixed(1)}%</div>
              <div>Faz: {experimentPhase}</div>
            </div>
          </div>
        </div>

        {/* Gelişmiş Görsel Simülasyon */}
        <EnhancedExperimentVisualization />
      </div>
    </div>
  );

  // Ana render fonksiyonu
  const renderCurrentPhase = () => {
    switch (state.currentPhase) {
      case 'theory': return <TheoryPhase />;
      case 'experiment': return <ExperimentPhase />;
      default: return <TheoryPhase />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gelişmiş Süblimleşme Simülasyonu
                </h1>
                <p className="text-gray-600 mt-1">Gerçek Fizik Hesaplamaları ile İnteraktif Deney</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {soundEnabled ? 'Ses Açık' : 'Ses Kapalı'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PhaseNavigation />
        
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(phases.find(p => p.id === state.currentPhase)?.icon || BookOpen, 
                  { className: "w-6 h-6 text-blue-600" })}
                <h2 className="text-2xl font-bold text-gray-900">
                  {phases.find(p => p.id === state.currentPhase)?.label}
                </h2>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={prevPhase}
                  disabled={phases.findIndex(p => p.id === state.currentPhase) === 0}
                  className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Önceki</span>
                </button>
                <button
                  onClick={nextPhase}
                  disabled={phases.findIndex(p => p.id === state.currentPhase) === phases.length - 1}
                  className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {renderCurrentPhase()}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={resetExperiment}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Deneyi Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

export default SublimationExperiment;
