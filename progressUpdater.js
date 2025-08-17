class ProgressUpdater {
  static updateAll() { CurriculumTracker.loadProgress(); }
  static updateLesson(lessonId, percentage) {
    const el = document.getElementById(lessonId);
    if (el) el.querySelector('.button-group h3').textContent = `${percentage}%`;
  }
}
