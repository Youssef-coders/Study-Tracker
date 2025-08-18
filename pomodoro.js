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
      this.elTimer = document.getElementById('pom-timer');
      this.elMode = document.getElementById('pom-mode');
      this.btnStart = document.getElementById('pom-start');
      this.btnPause = document.getElementById('pom-pause');
      this.btnReset = document.getElementById('pom-reset');
    }
    static bind(){
      if (!this.btnStart) return;
      this.btnStart.addEventListener('click', ()=> this.start());
      this.btnPause.addEventListener('click', ()=> this.pause());
      this.btnReset.addEventListener('click', ()=> this.reset());
      document.addEventListener('visibilitychange', ()=>{ if (document.hidden) this.persist(); });
      window.addEventListener('beforeunload', ()=> this.persist());
      this.restore();
    }
    static persist(){ try { localStorage.setItem('pomodoroState', JSON.stringify({ ...this.state, intervalId: null })); } catch(e){} }
    static restore(){ try { const s = JSON.parse(localStorage.getItem('pomodoroState')||'null'); if (s){ this.state = { ...this.state, ...s }; } } catch(e){} }
    static format(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
    static render(){ if (this.elTimer) this.elTimer.textContent = this.format(this.state.remaining); if (this.elMode) this.elMode.textContent = this.state.mode; }
    static tick(){ if (!this.state.running) return; if (this.state.remaining<=0){ this.nextPhase(); return; } this.state.remaining -= 1; try{ window.SoundManager && SoundManager.tick(); }catch(e){} this.render(); }
    static start(){ if (this.state.running) return; this.state.running = true; this.state.intervalId = setInterval(()=>this.tick(),1000); try{ Notify && Notify.info('Timer started'); }catch(e){} this.persist(); }
    static pause(){ if (!this.state.running) return; this.state.running = false; clearInterval(this.state.intervalId); this.state.intervalId = null; try{ Notify && Notify.info('Timer paused'); }catch(e){} this.persist(); }
    static reset(){ this.pause(); this.state.mode='FOCUS'; this.state.remaining=DEFAULTS.focus; this.state.cycle=1; this.render(); try{ Notify && Notify.info('Timer reset'); }catch(e){} this.persist(); }
    static nextPhase(){
      if (this.state.mode==='FOCUS'){
        if (this.state.cycle % DEFAULTS.cycles === 0){ this.state.mode='LONG BREAK'; this.state.remaining=DEFAULTS.long; }
        else { this.state.mode='SHORT BREAK'; this.state.remaining=DEFAULTS.short; }
      } else {
        this.state.mode='FOCUS'; this.state.remaining=DEFAULTS.focus; this.state.cycle += 1;
      }
      try{ window.SoundManager && SoundManager.timerEnd(); }catch(e){}
      this.render(); this.persist();
    }
  }
  document.addEventListener('DOMContentLoaded', ()=> Pomodoro.init());
})();


