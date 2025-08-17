class ResourceUploader {
  static init() {
    document.querySelector('.add-resource-btn')?.addEventListener('click', ()=> document.getElementById('resourceModal').style.display='block');
    document.querySelector('#resourceModal .close-btn')?.addEventListener('click', ()=> document.getElementById('resourceModal').style.display='none');
    document.querySelector('.resource-form')?.addEventListener('submit', (e)=> {
      e.preventDefault();
      const form = e.target;
      const chapter = form.querySelectorAll('input[type="text"]')[0].value.trim();
      const title = form.querySelectorAll('input[type="text"]')[1].value.trim();
      const type = form.querySelector('select').value;
      const notes = form.querySelector('textarea').value.trim();
      const resources = LocalStorageManager.load('resources') || {};
      if (!resources[chapter]) resources[chapter] = [];
      resources[chapter].push({ title, type, notes });
      LocalStorageManager.save('resources', resources);
      ResourceManager.addResourceToUI(chapter, title, type);
      form.reset();
      document.getElementById('resourceModal').style.display='none';
    });
    window.addEventListener('click', e => { if (e.target === document.getElementById('resourceModal')) document.getElementById('resourceModal').style.display='none'; });
  }
}
document.addEventListener('DOMContentLoaded', ()=>ResourceUploader.init());
