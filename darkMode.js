class DarkMode {
  static init() {
    this.isDark = localStorage.getItem('darkMode') === 'true';
    this.applyMode();
    document.querySelector('.enable.dark')?.addEventListener('click', ()=> this.enable());
    document.querySelector('.disable.dark')?.addEventListener('click', ()=> this.disable());
  }
  static enable(){ this.isDark = true; localStorage.setItem('darkMode','true'); this.applyMode(); }
  static disable(){ this.isDark = false; localStorage.setItem('darkMode','false'); this.applyMode(); }
  static applyMode(){ document.body.classList.toggle('dark-mode', this.isDark); }
}
document.addEventListener('DOMContentLoaded', ()=>DarkMode.init());
