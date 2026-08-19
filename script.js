/**
 * Luxury Persian Wedding Invitation - Interactive Engine
 * Azita & Mohammad | 8 Shahrivar 1405
 */

document.addEventListener('DOMContentLoaded', () => {
  // ۱. متغیرها و المان‌ها
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const flapTop = document.getElementById('flap-top');
  const waxSeal = document.getElementById('wax-seal');
  const audioElement = document.getElementById('wedding-audio');
  const floatingAudio = document.getElementById('floating-audio-control');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const iconDisc = document.getElementById('icon-disc');
  const iconMute = document.getElementById('icon-mute');
  const volumeRange = document.getElementById('volume-range');
  const btnCopyAddress = document.getElementById('btn-copy-address');
  const copyText = document.getElementById('copy-text');
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success');
  const btnEditRsvp = document.getElementById('btn-edit-rsvp');
  const labelAttending = document.getElementById('label-attending');
  const labelNotAttending = document.getElementById('label-not-attending');
  const guestsGroup = document.getElementById('guests-group');

  let isPlaying = false;
  let isEnvelopeOpened = false;

  // ۲. سنتز صوتی رزرو (در صورتی که فایل MP3 لود نشود)
  class FallbackWeddingSynth {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.chords = [
        { bass: 146.83, notes: [293.66, 369.99, 440.00, 587.33] }, // D Maj
        { bass: 138.59, notes: [277.18, 329.63, 440.00, 554.37] }, // A/C#
        { bass: 123.47, notes: [246.94, 293.66, 369.99, 493.88] }, // Bm
        { bass: 98.00,  notes: [196.00, 246.94, 293.66, 392.00] }, // G Maj
      ];
      this.chordIndex = 0;
    }

    start() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isPlaying = true;
      this.playMeasure();
    }

    playMeasure() {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = this.chords[this.chordIndex];

      // پخش نت بیس
      this.playNote(chord.bass, now, 3.2, 0.15, 'triangle');

      // پخش آرپژ لطیف
      chord.notes.forEach((freq, idx) => {
        this.playNote(freq, now + 0.15 + idx * 0.45, 1.8, 0.08, 'sine');
      });

      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
      setTimeout(() => this.playMeasure(), 3200);
    }

    playNote(freq, time, duration, vol, type) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(vol, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + duration + 0.1);
      } catch (e) {}
    }

    stop() {
      this.isPlaying = false;
    }
  }

  const fallbackSynth = new FallbackWeddingSynth();

  function playMusic() {
    isPlaying = true;
    floatingAudio.classList.remove('hidden');
    iconDisc.classList.remove('hidden');
    iconMute.classList.add('hidden');

    if (audioElement) {
      audioElement.volume = volumeRange.value;
      const promise = audioElement.play();
      if (promise !== undefined) {
        promise.catch(() => {
          fallbackSynth.start();
        });
      }
    } else {
      fallbackSynth.start();
    }
  }

  function pauseMusic() {
    isPlaying = false;
    iconDisc.classList.add('hidden');
    iconMute.classList.remove('hidden');
    if (audioElement) audioElement.pause();
    fallbackSynth.stop();
  }

  // ۳. باز شدن پاکت با انیمیشن و لمس صفحه اول
  envelopeOverlay.addEventListener('click', () => {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // پخش موسیقی
    playMusic();

    // انیمیشن شکستن مهر موم و باز شدن لبه پاکت
    waxSeal.classList.add('broken');
    setTimeout(() => {
      flapTop.classList.add('open');
    }, 250);

    // پرتاب کانفتی طلایی
    if (typeof confetti === 'function') {
      setTimeout(() => {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#D4AF37', '#FFF2B2', '#CBD5E1', '#94A3B8', '#FFFFFF'],
        });
      }, 550);
    }

    // محو شدن پاکت و نمایش صفحه اصلی
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
      setTimeout(() => {
        envelopeOverlay.style.display = 'none';
      }, 1000);
    }, 900);
  });

  // ۴. کنترل دکمه شناور موسیقی
  audioToggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  volumeRange.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (audioElement) audioElement.volume = val;
    if (val === 0 && isPlaying) {
      pauseMusic();
    } else if (val > 0 && !isPlaying) {
      playMusic();
    }
  });

  // ۵. تبدیل اعداد به فارسی
  function toPersianDigits(num) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
  }

  // ۶. تایمر زنده شمارش معکوس به تاریخ ۸ شهریور ۱۴۰۵ ساعت ۱۸:۰۰
  const targetDate = new Date('2026-08-30T18:00:00+03:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('days').innerText = '۰';
      document.getElementById('hours').innerText = '۰۰';
      document.getElementById('minutes').innerText = '۰۰';
      document.getElementById('seconds').innerText = '۰۰';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = toPersianDigits(days);
    document.getElementById('hours').innerText = toPersianDigits(String(hours).padStart(2, '0'));
    document.getElementById('minutes').innerText = toPersianDigits(String(minutes).padStart(2, '0'));
    document.getElementById('seconds').innerText = toPersianDigits(String(seconds).padStart(2, '0'));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ۷. کپی آدرس تالار
  btnCopyAddress.addEventListener('click', () => {
    const address = document.getElementById('venue-address').innerText;
    navigator.clipboard.writeText("فردیس، بلوار قریشی شمالی، بلوار سی و یکم، خیابان مولوی - عمارت ماهور").then(() => {
      copyText.innerText = 'آدرس کپی شد ✓';
      btnCopyAddress.style.borderColor = '#10B981';
      setTimeout(() => {
        copyText.innerText = 'کپی آدرس تالار';
        btnCopyAddress.style.borderColor = '';
      }, 2500);
    });
  });

  // ۸. مدیریت فرم تایید حضور (RSVP)
  const radioInputs = document.querySelectorAll('input[name="attendance"]');
  radioInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'attending') {
        labelAttending.classList.add('active');
        labelNotAttending.classList.remove('active');
        guestsGroup.style.display = 'block';
      } else {
        labelNotAttending.classList.add('active');
        labelAttending.classList.remove('active');
        guestsGroup.style.display = 'none';
      }
    });
  });

  // ذخیره در LocalStorage
  const STORAGE_KEY = 'wedding_azita_mohammad_rsvp';
  const savedRSVP = localStorage.getItem(STORAGE_KEY);
  if (savedRSVP) {
    const data = JSON.parse(savedRSVP);
    showSuccessState(data);
  }

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const guests = document.getElementById('rsvp-guests').value;
    const message = document.getElementById('rsvp-msg').value.trim();

    if (!name) return;

    const rsvpData = { name, attendance, guests, message };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvpData));

    showSuccessState(rsvpData);

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10B981', '#D4AF37', '#94A3B8'],
      });
    }
  });

  function showSuccessState(data) {
    document.getElementById('success-guest-name').innerText = `${data.name} عزیز`;
    const desc = document.getElementById('success-desc');
    if (data.attendance === 'attending') {
      desc.innerText = `پاسخ شما با موفقیت ثبت شد. مشتاقانه چشم‌انتظار دیدار روی ماه شما (به همراه ${toPersianDigits(data.guests)} نفر) هستیم! ✨`;
    } else {
      desc.innerText = 'پاسخ شما ثبت گردید. جای شما در این شب خاطره‌انگیز بسیار خالی خواهد بود و دلگرمیم به دعای خیرتان. 🤍';
    }
    rsvpForm.style.display = 'none';
    rsvpSuccess.classList.remove('hidden');
  }

  btnEditRsvp.addEventListener('click', () => {
    rsvpSuccess.classList.add('hidden');
    rsvpForm.style.display = 'block';
  });
});
