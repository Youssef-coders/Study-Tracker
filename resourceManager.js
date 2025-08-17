class ResourceManager {
  static addResourceToUI(chapter, title, type) {
    const card = document.querySelector('.resource-card');
    if (!card) return;
    // find last chapter header the same number, else append header
    let foundHeader = null;
    Array.from(card.querySelectorAll('h3')).forEach(h => {
      if (h.textContent.trim().toUpperCase() === `CHAPTER ${String(chapter).trim().toUpperCase()}`) foundHeader = h;
    });
    if (!foundHeader) {
      const hdr = document.createElement('h3'); hdr.textContent = `CHAPTER ${chapter}`; card.appendChild(hdr);
    }
    const wrap = document.createElement('div'); wrap.className = 'resource';
    wrap.innerHTML = `<h3>${title}</h3><div class="resource-actions"><h3>${type}</h3><button class="view-btn">View</button></div>`;
    card.appendChild(wrap);
    wrap.querySelector('.view-btn')?.addEventListener('click', ()=> ResourceViewer.showResource(title,type));
  }
}
