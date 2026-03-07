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
    // 'lotto' 탭은 기존 댓글 복구를 위해 식별자를 아예 주지 않거나 가장 초기의 것으로 설정
    const identifier = tabId === 'lotto' ? undefined : "gender-face-test-v1";

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = pageUrl;
                this.page.title = tabId === 'lotto' ? '로또 번호 생성기' : 'AI 남녀상 테스트';
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = identifier;
            this.page.title = tabId === 'lotto' ? '로또 번호 생성기' : 'AI 남녀상 테스트';
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-j0ykvmteku.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
    
    // 각 탭의 댓글 수 링크에 Disqus가 인식할 수 있는 href 설정
    const lottoLink = document.getElementById('lotto-count-link');
    const genderLink = document.getElementById('gender-count-link');
    
    lottoLink.setAttribute('href', baseUrl + '#disqus_thread');
    lottoLink.setAttribute('data-disqus-url', baseUrl);
    
    genderLink.setAttribute('href', baseUrl + '#!gender#disqus_thread');
    genderLink.setAttribute('data-disqus-url', baseUrl + "#!gender");
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

// 댓글 수 클릭 시 부드러운 스크롤
document.querySelectorAll('.dsq-count-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('comment-area');
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// 3. 로또 번호 생성 (기존 로직 동일)
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

// 4. AI 남녀상 테스트 (기존 로직 동일)
async function initModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block';
        loadingSpinner.style.display = 'block';
        await predict(previewImage);
        loadingSpinner.style.display = 'none';
    };
    reader.readAsDataURL(file);
});

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
