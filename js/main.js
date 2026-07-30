const certData = {
  'it-bootcamp': {
    img: 'assets/images/it-bootcamp-cert.png',
    title: 'AI Learning Series I.T. Boot Camp',
    issuer: 'Cathedral of Praise',
    date: 'March 14, 2026',
    type: 'Certificate of Participation'
  },
  'ymih': {
    img: 'assets/images/ymih-cert.jpg',
    title: 'Youth Can Make It Happen: Academic Roadshow',
    issuer: 'BOI, ACPI & DepEd',
    date: 'October 23, 2025',
    type: 'Certificate'
  }
};

const projectData = {
  'dewy': {
    title: 'Dewy: An AI-Powered Study Companion Bot for Preschool Children',
    desc: 'Interactive companion robot with localized hardware controls and ML models for early-childhood cognitive development. Designed to engage preschool children through adaptive learning routines, voice interaction, and responsive behaviors powered by on-device AI inference.',
    tags: ['Raspberry Pi', 'Python', 'AI', 'Machine Learning', 'Robotics', 'Speech Recognition'],
    status: 'in development',
    images: ['assets/images/dewy/1.jpg', 'assets/images/dewy/2.jpg', 'assets/images/dewy/3.jpg', 'assets/images/dewy/4.jpg']
  },
  'liwanav': {
    title: 'LiwaNav: GPS-Powered Stopover Notification System and Voice Announcement System',
    desc: 'Hardware-software ecosystem aiding low-vision individuals navigating public transit through passive signal processing. Combines GPS tracking, BLE beacons, and IoT mesh networking to deliver real-time stopover notifications and voice-guided announcements.',
    tags: ['Arduino', 'IoT Mesh', 'BLE', 'GPS', 'Voice System', 'Embedded C'],
    status: 'in development',
    images: ['assets/images/liwanav/1.jpg', 'assets/images/liwanav/2.jpg']
  }
};

function openCert(id) {
  const cert = certData[id];
  if (!cert) return;
  document.getElementById('certImage').src = cert.img;
  document.getElementById('certTitle').textContent = cert.title;
  document.getElementById('certIssuer').textContent = cert.issuer;
  document.getElementById('certDate').textContent = cert.date;
  document.getElementById('certType').textContent = cert.type;
  const modal = document.getElementById('certModal');
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeCert(e) {
  const modal = document.getElementById('certModal');
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

let currentSlide = 0;
let slideImages = [];

function openProject(id) {
  const project = projectData[id];
  if (!project) return;
  document.getElementById('projectTitle').textContent = project.title;
  document.getElementById('projectDesc').textContent = project.desc;
  document.getElementById('projectStatus').textContent = project.status;
  const tagsContainer = document.getElementById('projectTags');
  tagsContainer.innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
  const imagesContainer = document.getElementById('projectImages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');
  currentSlide = 0;
  if (project.images && project.images.length > 0) {
    slideImages = project.images;
    imagesContainer.innerHTML = project.images.map((img, i) => `<div class="slide ${i === 0 ? 'active' : ''}"><img src="${img}" alt="Project image"></div>`).join('');
    dotsContainer.innerHTML = project.images.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i}, event)"></div>`).join('');
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    dotsContainer.style.display = 'flex';
  } else {
    slideImages = [];
    imagesContainer.innerHTML = `
      <div class="project-placeholder">
        <svg class="w-16 h-16 dark:text-white/10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p class="text-[13px] dark:text-white/20 text-zinc-400 font-geist-mono mt-3">image coming soon</p>
      </div>`;
    dotsContainer.innerHTML = '';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    dotsContainer.style.display = 'none';
  }
  const modal = document.getElementById('projectModal');
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function nextSlide(e) {
  e.stopPropagation();
  if (slideImages.length <= 1) return;
  const slides = document.querySelectorAll('#projectImages .slide');
  const dots = document.querySelectorAll('#sliderDots .slider-dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slideImages.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function prevSlide(e) {
  e.stopPropagation();
  if (slideImages.length <= 1) return;
  const slides = document.querySelectorAll('#projectImages .slide');
  const dots = document.querySelectorAll('#sliderDots .slider-dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (currentSlide - 1 + slideImages.length) % slideImages.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function goToSlide(index, e) {
  e.stopPropagation();
  if (slideImages.length <= 1) return;
  const slides = document.querySelectorAll('#projectImages .slide');
  const dots = document.querySelectorAll('#sliderDots .slider-dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = index;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function closeProject(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('projectModal');
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

// Audio context for UI sounds
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTick() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 4800;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

function playClick() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 6000;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

// Add hover tick to interactive elements
document.querySelectorAll('a, button, .tech-tag, .interactive-card, .cert-card, .project-card, .gallery-item, .social-icon').forEach(el => {
  el.addEventListener('mouseenter', playTick);
});

// Add click sound to all clickable elements
document.addEventListener('click', (e) => {
  if (e.target.closest('a, button, .interactive-card, .cert-card, .project-card, .gallery-item, .social-icon, .tech-tag')) {
    playClick();
  }
});

const html = document.documentElement;
const themeTooltip = document.getElementById('themeTooltip');

function toggleTheme() {
  html.classList.toggle('dark');
  const isDark = html.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeTooltip.textContent = isDark ? 'light' : 'dark';
}

(function() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;
  if (!isDark) html.classList.remove('dark');
  themeTooltip.textContent = isDark ? 'light' : 'dark';
})();

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  target.style.animation = 'none';
  target.offsetHeight;
  target.style.animation = '';
  target.scrollTop = 0;

  target.querySelectorAll('.stagger > *').forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  document.querySelectorAll('.dock-item[data-nav]').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-nav="${id}"]`)?.classList.add('active');
}

// Glow effect on interactive cards
document.querySelectorAll('.interactive-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  });
});

// Glow effect on cert cards
document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  });
});

// Glow effect on project cards
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  });
});

// Scroll reveal observer
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

// Re-observe on section switch
const originalShowSection = showSection;
showSection = function(id) {
  originalShowSection(id);
  const section = document.getElementById(id);
  section.querySelectorAll('.scroll-reveal').forEach(el => {
    el.classList.remove('visible');
    revealObserver.observe(el);
  });
};

// Contact form handler
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const originalText = btn.textContent;
  btn.textContent = 'sending...';
  btn.style.pointerEvents = 'none';

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(response => {
    if (response.ok) {
      btn.textContent = 'sent!';
      form.reset();
      setTimeout(() => { btn.textContent = originalText; btn.style.pointerEvents = ''; }, 2000);
    } else {
      btn.textContent = 'error, try again';
      setTimeout(() => { btn.textContent = originalText; btn.style.pointerEvents = ''; }, 2000);
    }
  }).catch(() => {
    btn.textContent = 'error, try again';
    setTimeout(() => { btn.textContent = originalText; btn.style.pointerEvents = ''; }, 2000);
  });
}
