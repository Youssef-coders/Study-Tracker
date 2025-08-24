(function(){
  const DEFAULTS = { focus: 25*60, short: 5*60, long: 15*60, cycles: 4 };
  class Pomodoro {
    static init(){
      this.state = {
        mode: 'FOCUS',
        remaining: DEFAULTS.focus,
        running: false,
        cycle: 1,
        intervalId: null
      };
      this.cacheDom();
      this.bind();
      this.render();
    }
    
    static cacheDom(){
      this.elMinutes = document.getElementById('minutes');
      this.elSeconds = document.getElementById('seconds');
      this.btnStart = document.getElementById('startBtn');
      this.btnPause = document.getElementById('pauseBtn');
      this.btnReset = document.getElementById('resetBtn');
      this.modeButtons = document.querySelectorAll('.mode-btn');
    }
    
    static bind(){
      if (!this.btnStart) return;
      this.btnStart.addEventListener('click', ()=> this.start());
      this.btnPause.addEventListener('click', ()=> this.pause());
      this.btnReset.addEventListener('click', ()=> this.reset());
      
      // Mode button event listeners
      this.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.setMode(parseInt(btn.dataset.time));
        });
      });
      
      document.addEventListener('visibilitychange', ()=>{ if (document.hidden) this.persist(); });
      window.addEventListener('beforeunload', ()=> this.persist());
      this.restore();
    }
    
    static setMode(minutes) {
      this.state.remaining = minutes * 60;
      this.state.mode = 'FOCUS';
      this.state.cycle = 1;
      
      // Update active button
      this.modeButtons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time) === minutes);
      });
      
      this.render();
      this.persist();
    }
    
    static persist(){ try { localStorage.setItem('pomodoroState', JSON.stringify({ ...this.state, intervalId: null })); } catch(e){} }
    static restore(){ try { const s = JSON.parse(localStorage.getItem('pomodoroState')||'null'); if (s){ this.state = { ...this.state, ...s }; } } catch(e){} }
    
    static format(sec){ 
      const m=Math.floor(sec/60).toString().padStart(2,'0'); 
      const s=(sec%60).toString().padStart(2,'0'); 
      return `${m}:${s}`; 
    }
    
    static render(){ 
      if (this.elMinutes) this.elMinutes.textContent = Math.floor(this.state.remaining / 60).toString().padStart(2, '0');
      if (this.elSeconds) this.elSeconds.textContent = (this.state.remaining % 60).toString().padStart(2, '0');
    }
    
    static tick(){ 
      if (!this.state.running) return; 
      if (this.state.remaining<=0){ 
        this.nextPhase(); 
        return; 
      } 
      this.state.remaining -= 1; 
      this.render(); 
    }
    
    static start(){ 
      if (this.state.running) return; 
      this.state.running = true; 
      this.state.intervalId = setInterval(()=>this.tick(),1000); 
      this.updateButtonStates();
      try{ Notify && Notify.info('Timer started'); }catch(e){} 
      this.persist(); 
    }
    
    static pause(){ 
      if (!this.state.running) return; 
      this.state.running = false; 
      clearInterval(this.state.intervalId); 
      this.state.intervalId = null; 
      this.updateButtonStates();
      try{ Notify && Notify.info('Timer paused'); }catch(e){} 
      this.persist(); 
    }
    
    static reset(){ 
      this.pause(); 
      this.state.mode='FOCUS'; 
      this.state.remaining=DEFAULTS.focus; 
      this.state.cycle=1; 
      this.render(); 
      this.updateButtonStates();
      try{ Notify && Notify.info('Timer reset'); }catch(e){} 
      this.persist(); 
    }
    
    static updateButtonStates() {
      if (this.btnStart) this.btnStart.disabled = this.state.running;
      if (this.btnPause) this.btnPause.disabled = !this.state.running;
    }
    
    static nextPhase(){
      if (this.state.mode==='FOCUS'){
        if (this.state.cycle % DEFAULTS.cycles === 0){ this.state.mode='LONG BREAK'; this.state.remaining=DEFAULTS.long; }
        else { this.state.mode='SHORT BREAK'; this.state.remaining=DEFAULTS.short; }
      } else {
        this.state.mode='FOCUS'; this.state.remaining=DEFAULTS.focus; this.state.cycle += 1;
      }
      this.render(); 
      this.persist();
    }
  }
  document.addEventListener('DOMContentLoaded', ()=> Pomodoro.init());
})();


