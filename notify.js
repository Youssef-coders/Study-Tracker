// Simple toast notifications
(function(){
  const containerId = 'toast-container';
  function ensureContainer(){
    let c = document.getElementById(containerId);
    if (c) return c;
    c = document.createElement('div');
    c.id = containerId;
    document.body.appendChild(c);
    return c;
  }
  function toast(message, type='info', timeoutMs=2200){
    const c = ensureContainer();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    c.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 250); }, timeoutMs);
  }
  window.Notify = {
    info: (m)=> toast(m, 'info'),
    success: (m)=> toast(m, 'success'),
    warn: (m)=> toast(m, 'warn'),
    error: (m)=> toast(m, 'error')
  };
})();


