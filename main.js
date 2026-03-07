const URL = "https://teachablemachine.withgoogle.com/models/nohC-dlRd/";
let model, labelContainer, maxPredictions;

// DOM 요소
const themeToggle = document.getElementById('theme-toggle');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const loadingSpinner = document.getElementById('loading-spinner');

// 저녁 메뉴 추천 요소
const recommendMenuBtn = document.getElementById('recommend-menu-btn');
const menuEmoji = document.getElementById('menu-emoji');
const menuName = document.getElementById('menu-name');

// 저녁 메뉴 리스트
const dinnerMenus = [
    { name: '삼겹살', emoji: '🥓' },
    { name: '치킨', emoji: '🍗' },
    { name: '초밥', emoji: '🍣' },
    { name: '김치찌개', emoji: '🥘' },
    { name: '파스타', emoji: '🍝' },
    { name: '햄버거', emoji: '🍔' },
    { name: '비빔밥', emoji: '🥗' },
    { name: '마라탕', emoji: '🍜' },
    { name: '짜장면', emoji: '🥢' },
    { name: '돈가스', emoji: '🍱' },
    { name: '스테이크', emoji: '🥩' },
    { name: '쌀국수', emoji: '🍲' },
    { name: '피자', emoji: '🍕' },
    { name: '떡볶이', emoji: '🌶️' },
    { name: '냉면', emoji: '❄️' }
];

// 1. 테마 관리
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

const initialTheme = localStorage.getItem('theme') || 'light';
updateThemeUI(initialTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 2. Disqus 설정
function resetDisqus(tabId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const pageUrl = tabId === 'lotto' ? baseUrl : baseUrl + "#!" + tabId;
    
    // 식별자 관리
    let identifier;
    if (tabId === 'lotto') identifier = undefined; // 기존 댓글용
    else if (tabId === 'gender') identifier = "gender-face-test-v1";
    else if (tabId === 'dinner') identifier = "dinner-menu-recommend-v1";

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = pageUrl;
                this.page.title = document.querySelector(`[data-tab="${tabId}"]`).innerText;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = identifier;
            this.page.title = document.querySelector(`[data-tab="${tabId}"]`).innerText;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-j0ykvmteku.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
    
    // 댓글 수 링크 갱신
    document.querySelectorAll('.dsq-count-link').forEach(link => {
        const id = link.id.split('-')[0];
        const linkUrl = id === 'lotto' ? baseUrl : baseUrl + "#!" + id;
        link.setAttribute('href', linkUrl + '#disqus_thread');
        link.setAttribute('data-disqus-url', linkUrl);
    });
}

// 초기 로드
resetDisqus('lotto');

// 탭 전환
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tabId}-section`).classList.add('active');
        
        resetDisqus(tabId);
    });
});

// 댓글 수 클릭 시 스크롤
document.querySelectorAll('.dsq-count-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('comment-area').scrollIntoView({ behavior: 'smooth' });
    });
});

// 3. 로또 번호 생성
generateBtn.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    sortedNumbers.forEach(num => {
        const el = document.createElement('div');
        el.className = 'number';
        el.textContent = num;
        if (num <= 10) el.style.border = '3px solid #fbc400';
        else if (num <= 20) el.style.border = '3px solid #69c8f2';
        else if (num <= 30) el.style.border = '3px solid #ff7272';
        else if (num <= 40) el.style.border = '3px solid #aaa';
        else el.style.border = '3px solid #b0d840';
        numbersContainer.appendChild(el);
    });
});

// 4. AI 남녀상 테스트
async function initModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block';
        loadingSpinner.style.display = 'block';
        await predict(previewImage);
        loadingSpinner.style.display = 'none';
    };
    reader.readAsDataURL(file);
};

imageInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

const uploadArea = document.getElementById('upload-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('drag-over');
    }, false);
});

['dragleave', 'dragend', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('drag-over');
    }, false);
});

uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}, false);

async function predict(imgElement) {
    await initModel();
    const prediction = await model.predict(imgElement);
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const prob = (prediction[i].probability * 100).toFixed(0);
        const wrapper = document.createElement("div");
        wrapper.className = "label-wrapper";
        wrapper.innerHTML = `
            <div class="label-text">
                <span class="class-name">${className}</span>
                <span class="probability">${prob}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${prob}%"></div>
            </div>
        `;
        labelContainer.appendChild(wrapper);
    }
}

// 5. 저녁 메뉴 추천
recommendMenuBtn.addEventListener('click', () => {
    // 애니메이션 효과를 위해 잠시 텍스트 변경
    menuName.innerText = '어디보자...';
    menuEmoji.style.animation = 'none';
    menuEmoji.offsetHeight; // reflow
    menuEmoji.style.animation = 'bounce 0.5s infinite';

    setTimeout(() => {
        const randomIdx = Math.floor(Math.random() * dinnerMenus.length);
        const selected = dinnerMenus[randomIdx];
        
        menuEmoji.innerText = selected.emoji;
        menuName.innerText = selected.name;
        menuEmoji.style.animation = 'bounce 2s infinite';
    }, 600);
});
