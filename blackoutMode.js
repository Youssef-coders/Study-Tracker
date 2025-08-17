class BlackoutMode {
  static init() {
    this.isActive = localStorage.getItem('blackoutMode') === 'true';
    this.applyMode();
    document.querySelector('.enable.blackout')?.addEventListener('click', ()=> this.enable());
    document.querySelector('.disable.blackout')?.addEventListener('click', ()=> this.disable());
  }
  static enable(){ this.isActive = true; localStorage.setItem('blackoutMode','true'); this.applyMode(); }
  static disable(){ this.isActive = false; localStorage.setItem('blackoutMode','false'); this.applyMode(); }
  static applyMode(){ document.body.classList.toggle('blackout-mode', this.isActive); }
}
document.addEventListener('DOMContentLoaded', ()=>BlackoutMode.init());
