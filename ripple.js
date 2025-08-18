// Universal ripple effect for buttons and navbar links
(function(){
  function createRipple(event, host){
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = event.clientX - rect.left - size/2;
    const y = event.clientY - rect.top - size/2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    host.appendChild(ripple);
    ripple.addEventListener('animationend', ()=> ripple.remove());
  }

  function onPointerDown(e){
    const target = e.target.closest('button, .term-element');
    if (!target) return;
    // Ensure host can contain ripple
    const style = getComputedStyle(target);
    if (style.position === 'static') target.style.position = 'relative';
    if (style.overflow !== 'hidden') target.style.overflow = 'hidden';
    createRipple(e, target);
  }

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
})();


