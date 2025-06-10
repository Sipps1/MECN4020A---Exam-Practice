document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('questions-container');
    const countElement = document.getElementById('count');
    const filterButtons = document.querySelectorAll('#filter-buttons .btn');
    const toggleModeBtn = document.getElementById('toggle-mode');
    const completedCount = document.getElementById('completed-count');
    const correctCount = document.getElementById('correct-count');
    const progressBar = document.querySelector('.progress-bar');
    
    let studyMode = false;
    let questions = [];
    let userAnswers = {};
    
    try {
        const response = await fetch('/questions');
        const data = await response.json();
        questions = data.questions;
        
        countElement.textContent = questions.length;
        updateProgress();
        
        renderQuestions(questions);
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                const filtered = filter === 'all' 
                    ? questions 
                    : questions.filter(q => q.difficulty === filter);
                
                renderQuestions(filtered);
            });
        });
        
        toggleModeBtn.addEventListener('click', () => {
            studyMode = !studyMode;
            toggleModeBtn.innerHTML = studyMode 
                ? '<i class="fas fa-check-circle me-2"></i>Test Mode' 
                : '<i class="fas fa-lightbulb me-2"></i>Study Mode';
                
            renderQuestions(questions);
        });
        
    } catch (error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error loading questions</h4>
                    <p>${error.message}</p>
                    <button class="btn btn-outline-primary mt-2" onclick="location.reload()">
                        <i class="fas fa-sync me-2"></i>Reload Page
                    </button>
                </div>
            </div>
        `;
    }
    
    function renderQuestions(questions) {
        container.innerHTML = '';
        
        if (questions.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle me-2"></i>No questions found for this filter
                    </div>
                </div>
            `;
            return;
        }
        
        questions.forEach((q, index) => {
            const isAnswered = userAnswers[q.id];
            const isCorrect = isAnswered && (userAnswers[q.id] === q.answer);
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'col-md-6 col-lg-4 mb-4';
            questionDiv.innerHTML = `
                <div class="question-card card h-100">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">
                                #${index + 1}
                            </span>
                            <span class="difficulty-badge ${getDifficultyClass(q.difficulty)}">
                                ${q.difficulty}
                            </span>
                        </div>
                    </div>
                    <div class="card-body position-relative">
                        ${q.topic ? `<span class="topic-badge badge bg-primary">${q.topic}</span>` : ''}
                        <h5 class="card-title mb-4">${q.question}</h5>
                        
                        <div class="options mb-3">
                            ${Object.entries(q.options).map(([key, value]) => `
                                <div class="option-item ${isAnswered && key === q.answer ? 'correct-answer' : ''} 
                                    ${isAnswered && userAnswers[q.id] === key && key !== q.answer ? 'bg-danger text-white' : ''}"
                                    onclick="selectAnswer('${q.id}', '${key}')">
                                    <strong>${key}:</strong> ${value}
                                </div>
                            `).join('')}
                        </div>
                        
                        ${studyMode || isAnswered ? `
                        <div class="answer-section">
                            <p><strong>Answer:</strong> ${q.answer}</p>
                            <p><strong>Explanation:</strong> ${q.explanation}</p>
                        </div>
                        ` : ''}
                        
                        ${isAnswered ? `
                            <div class="mt-3 text-center">
                                <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'} p-2">
                                    <i class="fas fa-${isCorrect ? 'check' : 'times'} me-2"></i>
                                    ${isCorrect ? 'Correct!' : 'Incorrect'}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            container.appendChild(questionDiv);
        });
    }
    
    function getDifficultyClass(difficulty) {
        difficulty = difficulty.toLowerCase();
        if (difficulty === 'easy') return 'bg-success';
        if (difficulty === 'medium') return 'bg-warning text-dark';
        if (difficulty === 'hard') return 'bg-danger';
        return 'bg-secondary';
    }
    
    window.selectAnswer = function(questionId, answer) {
        if (userAnswers[questionId]) return;
        
        userAnswers[questionId] = answer;
        updateProgress();
        renderQuestions(questions);
    }
    
    function updateProgress() {
        const answeredCount = Object.keys(userAnswers).length;
        const correctAnswers = questions.filter(q => userAnswers[q.id] === q.answer).length;
        
        completedCount.textContent = `${answeredCount}/${questions.length}`;
        correctCount.textContent = correctAnswers;
        progressBar.style.width = `${(answeredCount / questions.length) * 100}%`;
    }
});