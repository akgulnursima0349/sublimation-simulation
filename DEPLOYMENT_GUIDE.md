# 🚀 GitHub Pages Deployment Rehberi

Bu rehber, süblimleşme simülasyonunu GitHub Pages'e yükleme adımlarını içerir.

## 📋 Ön Gereksinimler

- GitHub hesabı
- Git kurulu
- Node.js 18+ kurulu

## 🔧 Adım Adım Deployment

### 1. GitHub Repository Oluşturma

1. **GitHub'da yeni repository oluşturun:**
   - Repository adı: `sublimation-simulation`
   - Public olarak ayarlayın
   - README.md eklemeyin (zaten var)

### 2. Proje Dosyalarını Hazırlama

1. **Tüm dosyaları bir klasöre kopyalayın:**
```
sublimation-simulation/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── README.md
├── .gitignore
└── sublimation_simulation_enhanced.tsx
```

### 3. Git Repository Başlatma

```bash
# Proje klasörüne gidin
cd sublimation-simulation

# Git repository başlatın
git init

# Remote repository ekleyin (username'i değiştirin)
git remote add origin https://github.com/USERNAME/sublimation-simulation.git

# Tüm dosyaları ekleyin
git add .

# İlk commit yapın
git commit -m "feat: İnteraktif süblimleşme simülasyonu eklendi"

# Main branch'e push yapın
git branch -M main
git push -u origin main
```

### 4. GitHub Pages Ayarları

1. **Repository Settings'e gidin:**
   - GitHub repository sayfasında "Settings" sekmesine tıklayın

2. **Pages sekmesini bulun:**
   - Sol menüden "Pages" seçin

3. **Source ayarlayın:**
   - Source: "GitHub Actions" seçin

4. **Actions'ı etkinleştirin:**
   - "Actions" sekmesine gidin
   - "I understand my workflows, go ahead and enable them" tıklayın

### 5. Otomatik Deployment

GitHub Actions workflow otomatik olarak çalışacak:

1. **Workflow çalışmasını kontrol edin:**
   - "Actions" sekmesinde workflow durumunu görün
   - Yeşil tik = başarılı deployment

2. **Canlı siteyi görün:**
   - URL: `https://USERNAME.github.io/sublimation-simulation`

## 🔄 Manuel Deployment (Alternatif)

Eğer GitHub Actions kullanmak istemiyorsanız:

### 1. Build Yapın
```bash
npm install
npm run build
```

### 2. gh-pages ile Deploy
```bash
# gh-pages paketini global olarak yükleyin
npm install -g gh-pages

# Deploy yapın
npm run deploy
```

### 3. GitHub Pages Ayarları
- Settings > Pages > Source: "Deploy from a branch"
- Branch: "gh-pages" seçin

## 🛠️ Sorun Giderme

### Build Hataları
```bash
# Bağımlılıkları temizleyin
rm -rf node_modules package-lock.json
npm install

# TypeScript hatalarını kontrol edin
npx tsc --noEmit
```

### GitHub Actions Hataları
1. **Workflow dosyasını kontrol edin:**
   - `.github/workflows/deploy.yml` dosyasının doğru olduğundan emin olun

2. **Repository ayarlarını kontrol edin:**
   - Actions'ın etkin olduğundan emin olun
   - Repository'nin public olduğundan emin olun

### 404 Hatası
1. **Base URL'i kontrol edin:**
   - `vite.config.ts` dosyasında `base: '/sublimation-simulation/'` ayarını kontrol edin
   - Repository adıyla eşleştiğinden emin olun

2. **Build çıktısını kontrol edin:**
   - `dist/` klasöründe `index.html` dosyasının olduğundan emin olun

## 📱 Mobil Optimizasyon

Simülasyon mobil cihazlarda da çalışır:
- Responsive tasarım
- Touch-friendly kontroller
- Optimized performance

## 🔒 Güvenlik

- HTTPS otomatik olarak etkin
- Content Security Policy (CSP) headers
- XSS koruması

## 📊 Analytics (Opsiyonel)

Google Analytics eklemek için:

1. **index.html'e ekleyin:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎯 Sonuç

Başarılı deployment sonrası:
- ✅ Canlı demo: `https://USERNAME.github.io/sublimation-simulation`
- ✅ Otomatik güncellemeler (main branch'e push yapınca)
- ✅ HTTPS güvenliği
- ✅ Mobil uyumluluk
- ✅ Hızlı yükleme

## 📞 Destek

Sorun yaşarsanız:
1. GitHub Issues açın
2. README.md'deki iletişim bilgilerini kullanın
3. Workflow loglarını kontrol edin

---

🎉 Tebrikler! Simülasyonunuz artık canlıda!
