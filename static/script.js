document.addEventListener('DOMContentLoaded', () => {
    const bodyElm = document.documentElement;
    const themeSwitch = document.getElementById('theme-switch');
    const countEl = document.getElementById('count');
    const completedEl = document.getElementById('completed-count');
    const correctEl = document.getElementById('correct-count');
    const progress = document.querySelector('.progress-bar');
    const container = document.getElementById('questions-container');

    // Theme toggle + persistence
    const saved = localStorage.getItem('theme') || 'light';
    bodyElm.setAttribute('data-bs-theme', saved);
    if (saved === 'dark') themeSwitch.checked = true;
    themeSwitch.addEventListener('change', () => {
        const mode = themeSwitch.checked ? 'dark' : 'light';
        bodyElm.setAttribute('data-bs-theme', mode);
        localStorage.setItem('theme', mode);
    });

    let questions = [], answers = {};

    async function load() {
        try {
            const res = await fetch('../data/enriched_questions.json');
            const data = await res.json();
            questions = data.questions;
            countEl.textContent = questions.length;
            render();
        } catch (e) {
            container.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
        }
    }

    function render() {
        container.innerHTML = '';
        questions.forEach((q, i) => {
            const answered = answers[q.id];
            const correct = answered === q.answer;
            const card = document.createElement('div');
            card.className = 'col-md-6';
            card.innerHTML = `
        <div class="question-card card">
          <div class="card-header"><span>#${i + 1}</span></div>
          <div class="card-body">
            <h5>${q.question}</h5>
            <div>${Object.entries(q.options).map(([k, v]) => `
              <div class="option-item ${answered && k === q.answer ? 'correct-answer' : ''} ${answered === k && k !== q.answer ? 'bg-danger text-white' : ''}"
                   data-question-id="${q.id}" data-choice="${k}">
                <strong>${k}:</strong> ${v}
              </div>`).join('')}</div>
            ${answered ? `<div class="mt-2"><strong>${correct ? '✔️ Correct' : '❌ Wrong'}</strong><br>Answer: ${q.answer}. ${q.explanation}</div>` : ''}
          </div>
        </div>`;
            container.appendChild(card);
        });

        // Add event listeners after rendering
        document.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', function() {
                const questionId = this.dataset.questionId;
                const choice = this.dataset.choice;
                select(questionId, choice);
            });
        });
        updateProgress();
    }

    // Make select function accessible within the scope
    function select(id, choice) {
        if (answers[id]) return;
        answers[id] = choice;
        render();
    }


    function updateProgress() {
        const done = Object.keys(answers).length;
        const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
        completedEl.textContent = done;
        correctEl.textContent = correctCount;
        if (questions.length)
            progress.style.width = (done / questions.length * 100) + '%';
    }

    load();
});
