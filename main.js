const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const themeToggle = document.getElementById('theme-toggle');

// 테마 상태 관리
const updateThemeUI = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    }
};

// 초기 테마 설정
const initialTheme = localStorage.getItem('theme') || 'light';
updateThemeUI(initialTheme === 'dark');

// 테마 토글 이벤트
themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 로또 번호 생성
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
        
        // 번호별 색상
        if (number <= 10) numberEl.style.border = '3px solid #fbc400';
        else if (number <= 20) numberEl.style.border = '3px solid #69c8f2';
        else if (number <= 30) numberEl.style.border = '3px solid #ff7272';
        else if (number <= 40) numberEl.style.border = '3px solid #aaa';
        else numberEl.style.border = '3px solid #b0d840';

        numbersContainer.appendChild(numberEl);
    });
});
