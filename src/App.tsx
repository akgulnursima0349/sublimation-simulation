import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Thermometer, Eye, BookOpen, AlertTriangle, Settings, BarChart3, Trophy, ChevronRight, ChevronLeft, Timer } from 'lucide-react';

interface ObservationRecord {
  stage: string;
  time: string;
  temperature: number;
  observation: string;
  explanation: string;
}

interface ExperimentState {
  currentPhase: 'theory' | 'materials' | 'safety' | 'variables' | 'setup' | 'hypothesis' | 'experiment' | 'observation' | 'analysis' | 'errors' | 'evaluation';
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
  hypothesis: 'melt_then_evaporate' | 'sublimation' | 'no_change' | null;
}

interface Equipment {
  beaker: boolean;
  naftalin: boolean;
  watchGlass: boolean;
  tripod: boolean;
  burner: boolean;
  ice: boolean;
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
    hypothesis: null
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
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [experimentPhase, setExperimentPhase] = useState<'heating' | 'sublimation' | 'cooling' | 'crystallization' | 'complete'>('heating');

  // Fazlar tanımlaması
  const phases = [
    { id: 'theory', label: 'Kazanım ve Amaç', icon: BookOpen },
    { id: 'materials', label: 'Malzemeler', icon: Settings },
    { id: 'safety', label: 'Güvenlik', icon: AlertTriangle },
    { id: 'variables', label: 'Değişkenler', icon: BarChart3 },
    { id: 'setup', label: 'Düzenek Kurma', icon: Eye },
    { id: 'hypothesis', label: 'Hipotez', icon: BookOpen },
    { id: 'experiment', label: 'Deney Prosedürü', icon: Play },
    { id: 'observation', label: 'Gözlemler', icon: Eye },
    { id: 'analysis', label: 'Veri Analizi', icon: BarChart3 },
    { id: 'errors', label: 'Hata Kaynakları', icon: AlertTriangle },
    { id: 'evaluation', label: 'Değerlendirme', icon: Trophy }
  ];

  // Gerçek zamanlı simülasyon hesaplamaları
  useEffect(() => {
    let interval: number;
    
    if (state.heatingActive && state.currentPhase === 'experiment') {
      interval = setInterval(() => {
        setState(prev => {
          let newTemp = prev.temperature;
          let newSublimation = prev.sublimationLevel;
          let newMass = prev.naphthaleneMass;
          
          // Sıcaklık artışı (daha gerçekçi)
          if (prev.heatingActive) {
            const heatRate = (prev.flameIntensity / 100) * 0.8;
            newTemp = Math.min(prev.temperature + heatRate, 200);
          }
          
          // Süblimleşme (80°C'den sonra başlar)
          if (newTemp > 80 && prev.naphthaleneMass > 0) {
            const sublimationRate = Math.max(0, (newTemp - 80) * 0.015);
            newSublimation = Math.min(100, prev.sublimationLevel + sublimationRate);
            newMass = Math.max(0, prev.naphthaleneMass - sublimationRate * 0.8);
          }
          
          return {
            ...prev,
            temperature: newTemp,
            sublimationLevel: newSublimation,
            naphthaleneMass: newMass,
            experimentTime: prev.experimentTime + 1
          };
        });
      }, 200);
    }

    // Soğutma ve kristalleşme
    if (state.iceAdded && state.sublimationLevel > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const crystallizationRate = Math.min(prev.sublimationLevel * 0.025, 2);
          const newCrystallization = Math.min(prev.sublimationLevel, prev.crystallizationLevel + crystallizationRate);
          
          return {
            ...prev,
            crystallizationLevel: newCrystallization
          };
        });
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.heatingActive, state.iceAdded, state.currentPhase, state.sublimationLevel]);

  // Otomatik gözlem kaydı
  const addObservation = useCallback((stage: string, observation: string, explanation: string) => {
    const newObservation: ObservationRecord = {
      stage,
      time: `${Math.floor(state.experimentTime / 50)}s`,
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
    
    if (state.crystallizationLevel > 5 && state.crystallizationLevel < 10 && !observations.some(o => o.stage === 'Kristalleşme Başlangıcı')) {
      addObservation('Kristalleşme Başlangıcı', 'Saat camında beyaz kristaller oluşmaya başladı', 'Gaz → Katı hal değişimi');
      setExperimentPhase('crystallization');
    }
    
    if (state.crystallizationLevel > 30 && !observations.some(o => o.stage === 'Belirgin Kristalleşme')) {
      addObservation('Belirgin Kristalleşme', 'Saat camında belirgin kristal yapıları görülüyor', 'Kırağılaşma tamamlanıyor');
    }
  }, [state.temperature, state.sublimationLevel, state.crystallizationLevel, state.heatingActive, state.iceAdded, addObservation, observations]);

  // Ekipman yerleştirme
  const placeEquipment = (item: keyof Equipment) => {
    setEquipment(prev => ({ ...prev, [item]: true }));
    
    // Tüm ekipman yerleştirildi mi kontrol et
    const updatedEquipment = { ...equipment, [item]: true };
    const isComplete = updatedEquipment.beaker && updatedEquipment.naftalin && 
                      updatedEquipment.watchGlass && updatedEquipment.tripod && 
                      updatedEquipment.burner;
    
    if (isComplete) {
      setState(prev => ({ ...prev, setupComplete: true }));
    }
  };

  // Deney kontrolleri
  const startHeating = () => {
    if (state.setupComplete) {
      setState(prev => ({ ...prev, heatingActive: true, experimentStarted: true }));
      setExperimentPhase('heating');
    }
  };

  const stopHeating = () => {
    setState(prev => ({ ...prev, heatingActive: false }));
  };

  const addIce = () => {
    setState(prev => ({ ...prev, iceAdded: true, coolingActive: true }));
    setEquipment(prev => ({ ...prev, ice: true }));
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
      hypothesis: null
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
    setShowResults(false);
    setExperimentPhase('heating');
  };

  // Navigasyon
  const goToPhase = (phaseId: string) => {
    setState(prev => ({ ...prev, currentPhase: phaseId as any }));
  };

  const nextPhase = () => {
    const currentIndex = phases.findIndex(p => p.id === state.currentPhase);
    if (currentIndex < phases.length - 1) {
      // Hipotez seçimi zorunlu: hypothesis aşamasından experiment'e geçmeden önce kontrol
      const nextId = phases[currentIndex + 1].id as string;
      if (state.currentPhase === 'hypothesis' && nextId === 'experiment' && !state.hypothesis) {
        alert('Lütfen hipotezinizi seçiniz.');
        return;
      }
      goToPhase(nextId);
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

  // İçerik render fonksiyonları
  const TheoryPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Kazanım ve Amaç</h2>
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
              Naftalin örneğini ısıtarak süblimleşmesini, üstteki soğuk cam yüzeyinde 
              ise kırağılaşmasını gözlemek.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );

  const MaterialsPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Malzemeler</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Temel Malzemeler</h3>
            <div className="space-y-3">
              {[
                { name: 'Naftalin parçası', desc: 'Süblimleşecek madde' },
                { name: 'Beher (250 mL)', desc: 'Ana deney kabı' },
                { name: 'Saat camı', desc: 'Kristalleşme yüzeyi' },
                { name: 'İspirto ocağı', desc: 'Isıtma kaynağı' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Yardımcı Malzemeler</h3>
            <div className="space-y-3">
              {[
                { name: 'Üçayak + tel ızgara', desc: 'Beher desteği' },
                { name: 'Maşa', desc: 'Güvenli tutma' },
                { name: 'Buz parçaları', desc: 'Soğutma için' },
                { name: 'Güvenlik ekipmanları', desc: 'Gözlük, eldiven, önlük' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SafetyPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-600" />
          Güvenlik Kuralları
        </h2>
        <div className="grid gap-4">
          {[
            { 
              icon: '🚫', 
              title: 'Naftalin Güvenliği',
              text: 'Naftalin uçucu ve sağlığa zararlı olabilir; koklamayın, ağza götürmeyin.',
              level: 'critical'
            },
            { 
              icon: '🔥', 
              title: 'Alev Güvenliği',
              text: 'Açık alev kullanıldığı için yanıcı maddelerden uzak çalışın.',
              level: 'high'
            },
            { 
              icon: '🥽', 
              title: 'Koruyucu Ekipman',
              text: 'Gözlük, önlük ve eldiven takın.',
              level: 'medium'
            },
            { 
              icon: '🌡️', 
              title: 'Sıcaklık Uyarısı',
              text: 'Sıcak cam soğuk görünebilir, maşa ile tutulmalı.',
              level: 'medium'
            },
            { 
              icon: '🧹', 
              title: 'Temizlik',
              text: 'Deney bitince ocağı söndürün, alanı temizleyin.',
              level: 'low'
            }
          ].map((rule, index) => (
            <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${
              rule.level === 'critical' ? 'bg-red-50 border-red-500' :
              rule.level === 'high' ? 'bg-orange-50 border-orange-500' :
              rule.level === 'medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <span className="text-2xl">{rule.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">{rule.title}</h4>
                <p className="text-gray-700">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const VariablesPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Değişkenler</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Bağımsız Değişken</h3>
            <p className="text-gray-700 mb-2">Isıtma süresi / alev şiddeti</p>
            <p className="text-sm text-blue-600">Bizim kontrol ettiğimiz faktör</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Bağımlı Değişken</h3>
            <p className="text-gray-700 mb-2">Maddede gözlenen hal değişimleri</p>
            <p className="text-sm text-green-600">Ölçtüğümüz sonuç</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">Kontrol Değişkenleri</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Madde miktarı</p>
              <p>• Camların mesafesi</p>
              <p>• Ortam sıcaklığı</p>
            </div>
            <p className="text-sm text-purple-600 mt-2">Sabit tuttuğumuz faktörler</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SetupPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">Düzenek Kurulumu</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-amber-700 mb-4">Kurulum Adımları</h3>
            <div className="space-y-3">
              {[
                'Beheri üçayak üzerine yerleştirin',
                'Beherin tabanına küçük bir naftalin parçası koyun',
                'Beherin ağzını saat camıyla kapatın',
                'İspirto ocağını beherin altına alın',
                'Güvenlik ekipmanlarını takın'
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">İnteraktif Kurulum</h3>
            <div className="space-y-2">
              {Object.entries({
                tripod: 'Üçayak yerleştir',
                beaker: 'Beher koy',
                naftalin: 'Naftalin ekle',
                watchGlass: 'Saat camı kapat',
                burner: 'İspirto ocağı al'
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => placeEquipment(key as keyof Equipment)}
                  disabled={equipment[key as keyof Equipment]}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    equipment[key as keyof Equipment]
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <span className="mr-2">
                    {equipment[key as keyof Equipment] ? '✓' : '○'}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            
            {state.setupComplete && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800 font-medium">✓ Düzenek kurulumu tamamlandı!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Hipotez fazı
  const HypothesisPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-indigo-800 mb-2">Hipotez Oluşturma</h2>
        <p className="text-gray-700 mb-4">Sizce naftalin ısıtıldığında ne olur?</p>

        <div className="space-y-3">
          {[{key:'melt_then_evaporate',label:'Önce eriyecek, sonra buharlaşacak'},
            {key:'sublimation',label:'Doğrudan katıdan gaza geçecek (süblimleşecek)'},
            {key:'no_change',label:'Hiçbir değişiklik olmayacak'}].map(opt => (
            <label key={opt.key} className={`block border rounded-lg px-4 py-3 cursor-pointer ${state.hypothesis===opt.key as any ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <input
                type="radio"
                name="hypothesis"
                className="mr-2"
                checked={state.hypothesis === (opt.key as any)}
                onChange={() => setState(prev => ({ ...prev, hypothesis: opt.key as any }))}
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={prevPhase}
            className="px-4 py-2 border rounded-lg"
          >Geri</button>
          <button
            onClick={() => {
              if (!state.hypothesis) { alert('Lütfen hipotezinizi seçiniz.'); return; }
              goToPhase('experiment');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >Devam Et →</button>
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
              <div>Süre: {Math.floor(state.experimentTime / 50)}s</div>
              <div>Naftalin: {state.naphthaleneMass.toFixed(1)}%</div>
              <div>Faz: {experimentPhase}</div>
            </div>
          </div>
        </div>

        {/* Görsel Simülasyon */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Deney Düzeneği - Gerçek Zamanlı Simülasyon</h3>
          <div className="relative mx-auto" style={{ width: '350px', height: '450px' }}>
            
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
                
                {/* Buhar Efekti */}
                {state.sublimationLevel > 5 && (
                  <div className="absolute top-0 w-full h-full overflow-hidden">
                    {[...Array(Math.min(6, Math.floor(state.sublimationLevel / 15)))].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-bounce bg-gray-400 rounded-full opacity-70"
                        style={{
                          left: `${15 + i * 12}%`,
                          bottom: `${20 + (i % 3) * 15}px`,
                          width: `${6 + (i % 2) * 2}px`,
                          height: `${6 + (i % 2) * 2}px`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: `${2 + (i % 2)}s`
                        }}
                      />
                    ))}
                    
                    {/* Yoğun buhar efekti */}
                    {state.sublimationLevel > 30 && (
                      <div className="absolute top-2 w-full h-16 bg-gradient-to-t from-gray-300 to-transparent opacity-40 animate-pulse"></div>
                    )}
                  </div>
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
                {state.crystallizationLevel > 0 && (
                  <div className="absolute -bottom-1 w-full flex justify-center space-x-1">
                    {[...Array(Math.min(8, Math.floor(state.crystallizationLevel / 8)))].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-full animate-pulse shadow-sm border border-gray-200"
                        style={{
                          width: `${2 + (i % 2)}px`,
                          height: `${2 + (i % 2)}px`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '2s'
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
                
                {/* Alev Efekti */}
                {state.heatingActive && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-t-full animate-pulse shadow-lg"
                      style={{ 
                        width: `${8 + (state.flameIntensity / 100) * 4}px`,
                        height: `${(state.flameIntensity / 100) * 25 + 10}px`
                      }}
                    />
                    
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-blue-500 to-transparent rounded-t-full opacity-60"
                      style={{ 
                        width: `${4 + (state.flameIntensity / 100) * 2}px`,
                        height: `${(state.flameIntensity / 100) * 15 + 8}px`
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Gerçek Zamanlı Ölçümler */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Kristalleşme İlerlemesi</h4>
              <div className="flex justify-between text-sm mb-1">
                <span>İlerleme</span>
                <span>{state.crystallizationLevel.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${state.crystallizationLevel}%` }}
                >
                  {state.crystallizationLevel > 0 && (
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Kalan fazlar (kısaltılmış)
  const ObservationPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-orange-800 mb-4">Gözlem ve Kayıt Tablosu</h2>
        
        {observations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz gözlem kaydı bulunmuyor</p>
            <p className="text-gray-400 text-sm mt-2">Deney bölümünden deneyi başlatın!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-100 to-yellow-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-orange-800">Aşama</th>
                  <th className="px-4 py-3 text-left font-semibold text-orange-800">Zaman</th>
                  <th className="px-4 py-3 text-left font-semibold text-orange-800">Sıcaklık</th>
                  <th className="px-4 py-3 text-left font-semibold text-orange-800">Gözlem</th>
                  <th className="px-4 py-3 text-left font-semibold text-orange-800">Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-orange-25' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{obs.stage}</td>
                    <td className="px-4 py-3 text-gray-700">{obs.time}</td>
                    <td className="px-4 py-3 text-gray-700">{obs.temperature}°C</td>
                    <td className="px-4 py-3 text-gray-700">{obs.observation}</td>
                    <td className="px-4 py-3 text-blue-700 font-medium">{obs.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const AnalysisPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Veri Analizi ve Sonuç</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Süblimleşme Analizi
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-orange-800">
                  <span className="font-medium">Gözlenen Süblimleşme:</span> {state.sublimationLevel.toFixed(1)}%
                </p>
                <p className="text-orange-700 text-sm mt-1">
                  Maksimum sıcaklık: {Math.max(...observations.map(o => o.temperature), state.temperature)}°C
                </p>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Açıklama:</span> Naftalin 80°C'nin üzerinde ısıtıldığında 
                erime aşamasını atlayarak doğrudan gaz haline geçti.
              </p>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg">
                <span className="font-medium text-orange-800">Sonuç:</span>
                <span className="text-orange-700 ml-2">Katı → Gaz (Süblimleşme) gerçekleşti</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Kırağılaşma Analizi
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">
                  <span className="font-medium">Gözlenen Kristalleşme:</span> {state.crystallizationLevel.toFixed(1)}%
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Buz eklenme durumu: {state.iceAdded ? 'Eklendi' : 'Eklenmedi'}
                </p>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Açıklama:</span> Gaz halindeki naftalin soğuk saat camı 
                yüzeyinde doğrudan katılaşarak kristaller oluşturdu.
              </p>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg">
                <span className="font-medium text-blue-800">Sonuç:</span>
                <span className="text-blue-700 ml-2">Gaz → Katı (Kırağılaşma) gerçekleşti</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hipotez kontrolü */}
        {state.hypothesis && (
          <div className="mt-6 p-4 rounded-lg border bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Hipotez Kontrolü</h3>
            <p className="text-green-700 text-sm">
              {state.hypothesis === 'sublimation' 
                ? 'Tebrikler! Hipoteziniz doğru: Naftalin doğrudan katıdan gaza geçti (süblimleşme).'
                : 'Gözlemler, naftalinin 80°C üzerinde süblimleştiğini gösteriyor. Doğru cevap: Doğrudan katıdan gaza geçer (süblimleşme).'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ErrorsPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-red-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Hata Kaynakları ve İyileştirme</h2>
        
        <div className="grid gap-4">
          {[
            {
              error: "Saat camı yeterince soğuk değilse kristaller az oluşur",
              solution: "Daha fazla buz kullanın veya saat camını önceden soğutun",
              prevention: "Buz eklemeyi süblimleşme başladıktan sonra yapın",
              color: "blue"
            },
            {
              error: "Alev çok yüksekse buhar hızlı kaçar ve gözlem zorlaşır",
              solution: "Orta şiddette alev kullanın (%40-60 arası)",
              prevention: "Isıtmayı kademeli olarak artırın",
              color: "red"
            }
          ].map((item, index) => (
            <div key={index} className={`bg-${item.color}-50 border border-${item.color}-200 p-4 rounded-lg`}>
              <div className="mb-3">
                <h4 className={`font-semibold text-${item.color}-800 mb-2`}>Hata {index + 1}</h4>
                <p className={`text-${item.color}-700`}>{item.error}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className={`bg-${item.color}-100 p-3 rounded`}>
                  <h5 className={`font-medium text-${item.color}-800 mb-1`}>Çözüm</h5>
                  <p className={`text-${item.color}-700 text-sm`}>{item.solution}</p>
                </div>
                <div className={`bg-${item.color}-100 p-3 rounded`}>
                  <h5 className={`font-medium text-${item.color}-800 mb-1`}>Önleme</h5>
                  <p className={`text-${item.color}-700 text-sm`}>{item.prevention}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EvaluationPhase = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Değerlendirme ve Test</h2>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">Anlayış Kontrol Soruları</h3>
          <div className="space-y-4">
            {[
              {
                question: "Süblimleşme nedir? Tanımlayınız.",
                key: "q1",
                hint: "Hal değişimi türünü düşünün"
              },
              {
                question: "Günlük hayattan süblimleşme örneği veriniz.",
                key: "q2", 
                hint: "Evde kullandığınız maddeler"
              }
            ].map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium mb-2">{index + 1}. {item.question}</p>
                <textarea
                  value={userAnswers[item.key] || ''}
                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  placeholder="Cevabınızı yazın..."
                  rows={2}
                />
                <p className="text-sm text-gray-500 mt-1">İpucu: {item.hint}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowResults(true)}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Cevapları Kontrol Et
          </button>

          {showResults && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">Örnek Cevaplar</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-green-700">1. Süblimleşme:</p>
                  <p className="text-green-600">Katı maddelerin sıvı fazını atlayarak doğrudan gaz haline geçmesi olayıdır.</p>
                </div>
                <div>
                  <p className="font-medium text-green-700">2. Günlük hayat örneği:</p>
                  <p className="text-green-600">Naftalin topları, kuru buz, iyot kristalleri, kar tanelerinin buharlaşması.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Temel Kavramlar */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Temel Kavramlar</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Süblimleşme</h4>
              <p className="text-orange-700">Katı → Gaz (sıvı fazını atlayarak)</p>
              <p className="text-sm text-orange-600 mt-1">Örnek: Naftalin, kuru buz, iyot</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Kırağılaşma (Depozisyon)</h4>
              <p className="text-blue-700">Gaz → Katı (sıvı fazını atlayarak)</p>
              <p className="text-sm text-blue-600 mt-1">Örnek: Kristal oluşumu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Ana render fonksiyonu
  const renderCurrentPhase = () => {
    switch (state.currentPhase) {
      case 'theory': return <TheoryPhase />;
      case 'materials': return <MaterialsPhase />;
      case 'safety': return <SafetyPhase />;
      case 'variables': return <VariablesPhase />;
      case 'setup': return <SetupPhase />;
      case 'hypothesis': return <HypothesisPhase />;
      case 'experiment': return <ExperimentPhase />;
      case 'observation': return <ObservationPhase />;
      case 'analysis': return <AnalysisPhase />;
      case 'errors': return <ErrorsPhase />;
      case 'evaluation': return <EvaluationPhase />;
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
                  Süblimleşme ve Kırağılaşma Deney Simülasyonu
                </h1>
                <p className="text-gray-600 mt-1">5. Sınıf Fen Bilimleri - İnteraktif Deney Uygulaması</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span>Gerçek Zamanlı</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>İnteraktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Eğitsel</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Phase Navigation */}
        <PhaseNavigation />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(phases.find(p => p.id === state.currentPhase)?.icon || BookOpen, 
                  { className: "w-6 h-6 text-blue-600" })}
                <h2 className="text-2xl font-bold text-gray-900">
                  {phases.find(p => p.id === state.currentPhase)?.label}
                </h2>
              </div>
              
              {/* Navigation Buttons */}
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

          {/* Tab Content */}
          <div className="p-6">
            {renderCurrentPhase()}
          </div>
        </div>

        {/* Reset Button */}
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

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>5. Sınıf Fen Bilimleri - Süblimleşme ve Kırağılaşma Deney Simülasyonu</p>
              <p className="mt-1">Bu simülasyon React + TypeScript ile geliştirilmiştir.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div>Toplam Süre: ~45 dakika</div>
              <div>Yaş Grubu: 10-11 yaş</div>
              <div>Eğitim Seviyesi: 5. Sınıf</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SublimationExperiment;
