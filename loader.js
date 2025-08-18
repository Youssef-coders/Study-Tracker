// Simple loader overlay to prevent white flash during page load
(function(){
  try {
    var style = document.createElement('style');
    style.textContent = '\n#app-loader{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:rgba(255,255,255,0.35)}\n#app-loader .spinner{width:64px;height:64px;border:6px solid rgba(0,0,0,0.15);border-top-color:#2b5d8a;border-radius:50%;animation:spin 1s linear infinite}\n#app-loader .text{margin-top:14px;font-family:Excalifont,system-ui,Segoe UI,Arial,sans-serif;font-size:18px;font-weight:700;color:#2b5d8a;letter-spacing:.5px;text-shadow:0 1px 2px rgba(0,0,0,.15)}\n@keyframes spin{to{transform:rotate(360deg)}}\nbody.dark-mode #app-loader{background:#000}body.blackout-mode #app-loader{background:#000}\n';
    document.head.appendChild(style);

    var loader = document.createElement('div');
    loader.id = 'app-loader';
    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    var text = document.createElement('div');
    text.className = 'text';
    text.textContent = 'Study Tracker Loading…';
    loader.appendChild(spinner);
    loader.appendChild(text);
    (document.body || document.documentElement).appendChild(loader);

    function hide(){
      if (!loader) return;
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 220ms ease-out';
      setTimeout(function(){ loader.remove(); }, 240);
    }

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
  } catch(e) { /* no-op */ }
})();


