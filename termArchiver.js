class TermArchiver {
  static archiveCurrentTerm() {
    if (window.TermController?.isActive) {
      window.TermController.endTerm();
    } else alert('No active term to archive.');
  }
}
