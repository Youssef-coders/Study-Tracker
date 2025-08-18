// Simple loader overlay to prevent white flash during page load
(function(){
  try {
    var style = document.createElement('style');
    style.textContent = '\n#app-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,#f0f2f5,#e6e9ef)}\n#app-loader .spinner{width:64px;height:64px;border:6px solid rgba(0,0,0,0.1);border-top-color:#2b5d8a;border-radius:50%;animation:spin 1s linear infinite}\n@keyframes spin{to{transform:rotate(360deg)}}\nbody.dark-mode #app-loader{background:#121212}body.blackout-mode #app-loader{background:#000}\n';
    document.head.appendChild(style);

    var loader = document.createElement('div');
    loader.id = 'app-loader';
    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    loader.appendChild(spinner);
    document.documentElement.appendChild(loader);

    function hide(){
      if (!loader) return;
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 200ms ease-out';
      setTimeout(function(){ loader.remove(); }, 220);
    }

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
  } catch(e) { /* no-op */ }
})();


