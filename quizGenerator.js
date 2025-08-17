class QuizUI {
  static show(questions, onSubmit) {
    const modal = document.getElementById('quizModal');
    const container = document.getElementById('quizContainer');
    if (!modal || !container) return;
    container.innerHTML = '';
    questions.forEach((q,i) => {
      const wrap = document.createElement('div');
      wrap.style.marginBottom = '10px';
      const title = document.createElement('p'); title.textContent = `${i+1}. ${q.question}`; wrap.appendChild(title);
      if (q.type === 'mcq' && Array.isArray(q.options)) {
        q.options.forEach(opt => {
          const label = document.createElement('label');
          const r = document.createElement('input'); r.type = 'radio'; r.name = `q${i}`; r.value = opt;
          label.appendChild(r); label.appendChild(document.createTextNode(' ' + opt)); label.style.display='block';
          wrap.appendChild(label);
        });
      } else {
        const input = document.createElement('input'); input.type='text'; input.name=`q${i}`; input.style.width='100%';
        wrap.appendChild(input);
      }
      container.appendChild(wrap);
    });
    modal.style.display = 'block';
    document.getElementById('submitQuiz')?.addEventListener('click', ()=>{
      const answers = questions.map((q,i)=>{
        if (q.type === 'mcq') {
          const c = container.querySelector(`input[name="q${i}"]:checked`); return c ? c.value : '';
        } else {
          const t = container.querySelector(`input[name="q${i}"]`); return t ? t.value.trim() : '';
        }
      });
      onSubmit(answers);
      modal.style.display = 'none';
    }, { once: true });
    document.getElementById('cancelQuiz')?.addEventListener('click', ()=>modal.style.display='none');
    modal.querySelector('.close-btn')?.addEventListener('click', ()=>modal.style.display='none');
  }
}

class QuizGenerator {
  static async generate(lessonIds, difficulty) {
    const lessonTitles = lessonIds.map(id => {
      const cb = document.getElementById(id);
      return cb?.closest('.lesson')?.querySelector('h3')?.textContent || id;
    });
    const questions = await APIManager.generateQuiz(lessonTitles.join(', '), difficulty);
    QuizUI.show(questions, (answers) => {
      const score = QuizScorer.scoreQuiz(questions, answers);
      alert(`Score: ${score}%`);
    });
  }
}
