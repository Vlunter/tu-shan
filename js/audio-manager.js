// ============================================
// 背景音乐播放器模块
// 功能：播放、暂停、上一首、下一首、随机、循环、音量、淡入淡出、仪式降音
// ============================================

export class AudioManager {
  constructor(playlist) {
    this.playlist = playlist || [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.5;
    this.shuffle = false;
    this.loop = true;
    this.hasInteracted = false;
    this.currentAudio = new Audio();
    this.nextAudio = new Audio();
    this.ritualMode = false;
    this.baseVolume = 0.5;

    this.currentAudio.crossOrigin = 'anonymous';
    this.nextAudio.crossOrigin = 'anonymous';
    this.currentAudio.volume = 0;
    this.nextAudio.volume = 0;

    this.onStateChange = null;
    this.onTrackChange = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.currentAudio.addEventListener('ended', () => this._onTrackEnded());
    this.nextAudio.addEventListener('ended', () => this._onTrackEnded());

    // 首次用户交互后自动播放
    const startOnInteraction = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      if (this.playlist.length) this.play();
    };
    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });
  }

  _onTrackEnded() {
    if (this.shuffle) this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    else this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.play();
  }

  _currentTrack() {
    return this.playlist[this.currentIndex] || { name: '无音乐', src: '' };
  }

  _fade(audio, targetVolume, duration = 800) {
    const start = audio.volume;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      audio.volume = start + (targetVolume - start) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  play() {
    if (!this.playlist.length) return;
    const track = this._currentTrack();
    this.currentAudio.src = track.src;
    this.currentAudio.currentTime = 0;
    this.currentAudio.play().then(() => {
      this.isPlaying = true;
      this._fade(this.currentAudio, this.isMuted ? 0 : (this.ritualMode ? this.baseVolume * 0.25 : this.baseVolume));
      this._notify();
    }).catch(() => {
      // 浏览器自动播放策略限制，等待用户交互
    });
  }

  pause() {
    this._fade(this.currentAudio, 0, 500);
    setTimeout(() => { this.currentAudio.pause(); this.isPlaying = false; this._notify(); }, 500);
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  next() {
    if (this.shuffle) this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    else this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.play();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.play();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.baseVolume = this.volume;
    if (!this.isMuted) {
      this.currentAudio.volume = this.ritualMode ? this.baseVolume * 0.25 : this.baseVolume;
    }
    this._notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.currentAudio.volume = this.isMuted ? 0 : (this.ritualMode ? this.baseVolume * 0.25 : this.baseVolume);
    this._notify();
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    this._notify();
  }

  toggleLoop() {
    this.loop = !this.loop;
    this._notify();
  }

  // 仪式开始：音乐减弱
  ritualDuck() {
    if (this.ritualMode) return;
    this.ritualMode = true;
    if (this.isPlaying && !this.isMuted) {
      this._fade(this.currentAudio, this.baseVolume * 0.25, 1200);
    }
  }

  // 仪式结束：音乐恢复
  ritualRestore() {
    if (!this.ritualMode) return;
    this.ritualMode = false;
    if (this.isPlaying && !this.isMuted) {
      this._fade(this.currentAudio, this.baseVolume, 1500);
    }
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      shuffle: this.shuffle,
      loop: this.loop,
      track: this._currentTrack(),
      progress: this.currentAudio.duration ? (this.currentAudio.currentTime / this.currentAudio.duration) : 0
    };
  }

  _notify() {
    if (this.onStateChange) this.onStateChange(this.getState());
    if (this.onTrackChange) this.onTrackChange(this._currentTrack());
  }
}
