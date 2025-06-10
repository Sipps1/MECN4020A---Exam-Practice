document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('questions-container');
    const countElement = document.getElementById('count');
    const filterButtons = document.querySelectorAll('#filter-buttons .btn');
    
    try {
        const response = await fetch('/questions');
        const data = await response.json();
        const questions = data.questions;
        
        countElement.textContent = questions.length;
        
        // Render all questions
        renderQuestions(questions);
        
        // Add filter event listeners
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
        
    } catch (error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h4>Error loading questions</h4>
                    <p>${error.message}</p>
                    <p>Please try again later.</p>
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
                        No questions found for this filter
                    </div>
                </div>
            `;
            return;
        }
        
        questions.forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'col-md-6 mb-4';
            questionDiv.innerHTML = `
                <div class="question-card card h-100">
                    <div class="card-body position-relative">
                        ${q.topic ? `<span class="topic-badge badge bg-primary">${q.topic}</span>` : ''}
                        <h5 class="card-title">${q.question}</h5>
                        <div class="options mb-3">
                            ${Object.entries(q.options).map(([key, value]) => `
                                <div class="option-item" data-option="${key}">
                                    <strong>${key}:</strong> ${value}
                                </div>
                            `).join('')}
                        </div>
                        <div class="answer-section p-3 rounded">
                            <p><strong>Answer:</strong> ${q.answer}</p>
                            <p><strong>Explanation:</strong> ${q.explanation}</p>
                            ${q.difficulty ? `<p class="mb-0"><strong>Difficulty:</strong> 
                                <span class="badge ${getDifficultyClass(q.difficulty)}">${q.difficulty}</span>
                            </p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(questionDiv);
            
            // Highlight correct answer
            const correctOption = questionDiv.querySelector(`.option-item[data-option="${q.answer}"]`);
            if (correctOption) {
                correctOption.classList.add('correct-answer');
            }
        });
    }
    
    function getDifficultyClass(difficulty) {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-success';
            case 'medium': return 'bg-warning text-dark';
            case 'hard': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
});