// Lightweight sound and click feedback manager using Web Audio
(function(){
  const ctx = (function(){ try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; } })();
  function tone(freq=440, durationMs=120, type='sine', gain=0.06){
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    amp.gain.value = gain; osc.connect(amp); amp.connect(ctx.destination);
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + durationMs/1000);
    osc.start(now); osc.stop(now + durationMs/1000 + 0.02);
  }
  const SoundManager = {
    click(){ tone(260, 70, 'triangle', 0.05); },
    success(){ tone(660, 90, 'sine', 0.08); setTimeout(()=>tone(880, 120, 'sine', 0.06), 90); },
    alert(){ tone(180, 160, 'square', 0.07); setTimeout(()=>tone(150, 180, 'square', 0.05), 120); },
    timerEnd(){ tone(523.25, 120, 'sine', 0.08); setTimeout(()=>tone(659.25, 120, 'sine', 0.07), 140); setTimeout(()=>tone(783.99, 180, 'sine', 0.06), 280); },
    tick(){ tone(1000, 35, 'square', 0.02); }
  };
  window.SoundManager = SoundManager;

  // Global click sound and click animation
  function attachClickFeedback(target){
    if (!target) return;
    target.addEventListener('click', (e)=>{
      try { SoundManager.click(); } catch(_) {}
      try {
        const el = e.currentTarget;
        el.classList.add('clicked');
        setTimeout(()=> el.classList.remove('clicked'), 160);
      } catch(_) {}
    });
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('button, .term-element').forEach(attachClickFeedback);
    const mo = new MutationObserver((muts)=>{
      muts.forEach(m=>{
        m.addedNodes && m.addedNodes.forEach(n=>{
          if (!(n instanceof HTMLElement)) return;
          if (n.matches && (n.matches('button') || n.matches('.term-element'))) attachClickFeedback(n);
          n.querySelectorAll && n.querySelectorAll('button, .term-element').forEach(attachClickFeedback);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  });
})();


