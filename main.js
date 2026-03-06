const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const themeToggle = document.getElementById('theme-toggle');

// 테마 초기 설정
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

// 테마 토글 핸들러
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// 로또 번호 생성 핸들러
generateBtn.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach(number => {
        const numberEl = document.createElement('div');
        numberEl.classList.add('number');
        numberEl.textContent = number;
        
        // 번호별 색상 부여 (선택사항)
        if (number <= 10) numberEl.style.border = '3px solid #fbc400';
        else if (number <= 20) numberEl.style.border = '3px solid #69c8f2';
        else if (number <= 30) numberEl.style.border = '3px solid #ff7272';
        else if (number <= 40) numberEl.style.border = '3px solid #aaa';
        else numberEl.style.border = '3px solid #b0d840';

        numbersContainer.appendChild(numberEl);
    });
});
