class ResourceViewer {
  static init() {
    document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', e => {
      const resourceEl = e.target.closest('.resource');
      const title = resourceEl.querySelector('h3').textContent;
      const type = resourceEl.querySelector('.resource-actions h3').textContent;
      this.showResource(title, type);
    }));
    document.querySelector('#viewModal .close-btn')?.addEventListener('click', ()=> document.getElementById('viewModal').style.display='none');
    window.addEventListener('click', e => { if (e.target === document.getElementById('viewModal')) document.getElementById('viewModal').style.display='none'; });
  }

  static showResource(title, type) {
    const v = document.getElementById('resourceViewer');
    if (!v) return;
    v.innerHTML = `<h3>${title}</h3><p>Type: ${type}</p><div class="resource-content">${
      type==='PDF'?'<embed src="sample.pdf" width="100%" height="500px">':''}
      ${type==='DOCX'?'<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=sample.docx" width="100%" height="500px"></iframe>':''}
      ${type==='MP4'?'<video controls width="100%"><source src="sample.mp4" type="video/mp4"></video>':''}
      ${type==='Link'?'<iframe src="https://example.com" width="100%" height="500px"></iframe>':''}
    </div>`;
    document.getElementById('viewModal').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', ()=>ResourceViewer.init());
