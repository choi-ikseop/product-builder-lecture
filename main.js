const URL = "https://teachablemachine.withgoogle.com/models/1LWpie6dk/";
let model, labelContainer;

// DOM 요소
const themeToggle = document.getElementById('theme-toggle');
const tabContents = document.querySelectorAll('.tab-content');
const toolsLayout = document.getElementById('tools-layout');

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
    const pageUrl = tabId === 'home' ? baseUrl : baseUrl + "#!" + tabId;
    const identifier = "daily-tools-v5-" + tabId;
    
    const tabNameMap = {
        'home': '홈 페이지',
        'lotto': '로또 번호 생성기',
        'gender': 'AI 동물상 테스트',
        'dinner': '저녁 메뉴 추천',
        'inquiry': '제휴 및 개선 문의'
    };
    const currentTitle = tabNameMap[tabId] || 'Daily Tools';

    const discussionTitle = document.getElementById('discussion-title');
    if (discussionTitle) {
        discussionTitle.innerText = `💬 ${currentTitle} 토론장`;
    }

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = pageUrl;
                this.page.title = currentTitle;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = identifier;
            this.page.title = currentTitle;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-j0ykvmteku.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
}

// 탭 전환 로직
function switchTab(tabId) {
    const isTool = ['lotto', 'gender', 'dinner'].includes(tabId);
    
    document.querySelectorAll('.tab-btn, .nav-link, .feature-card').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
        if (isTool && btn.getAttribute('data-tab') === 'lotto' && btn.classList.contains('nav-link')) {
            btn.classList.add('active');
        }
    });

    if (isTool) {
        toolsLayout.classList.remove('hidden');
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('inquiry-section').classList.add('hidden');
    } else if (tabId === 'home') {
        toolsLayout.classList.add('hidden');
        document.getElementById('home-section').classList.remove('hidden');
        document.getElementById('inquiry-section').classList.add('hidden');
    } else if (tabId === 'inquiry') {
        toolsLayout.classList.add('hidden');
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('inquiry-section').classList.remove('hidden');
    }

    tabContents.forEach(content => {
        if (content.id === `${tabId}-section`) {
            content.classList.remove('hidden');
        } else if (!content.classList.contains('home-section') && !content.classList.contains('inquiry-section')) {
            content.classList.add('hidden');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    resetDisqus(tabId);
}

let activeTabId = 'home';

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab]');
    if (target) {
        e.preventDefault();
        activeTabId = target.getAttribute('data-tab');
        switchTab(activeTabId);
    }
});

document.getElementById('refresh-comments')?.addEventListener('click', () => {
    const btn = document.getElementById('refresh-comments');
    btn.innerText = '🔄 동기화 중...';
    btn.disabled = true;
    resetDisqus(activeTabId);
    setTimeout(() => {
        btn.innerText = '🔄 댓글 새로고침';
        btn.disabled = false;
    }, 1000);
});

switchTab('home');

// --- 기존 도구 기능 ---
const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const loadingSpinner = document.getElementById('loading-spinner');
const recommendMenuBtn = document.getElementById('recommend-menu-btn');
const menuDisplay = document.getElementById('menu-display');
const menuName = document.getElementById('menu-name');
const menuCategory = document.getElementById('menu-category');
const recipeContainer = document.getElementById('recipe-container');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeSteps = document.getElementById('recipe-steps');

// 로또
generateBtn?.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) { numbers.add(Math.floor(Math.random() * 45) + 1); }
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

// AI 동물상
async function initModel() {
    // 티치블 머신 URL에서 모델 정보를 강제로 갱신하기 위해 매번 새로고침 여부 확인
    if (!model || model.getClassLabels().length < 3) {
        console.log("최신 모델 로드 시도...");
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        
        try {
            // 라이브러리 충돌 방지를 위해 쿼리스트링 제거 후 로드
            model = await tmImage.load(modelURL, metadataURL);
            console.log("모델 로드 성공! 현재 라벨:", model.getClassLabels());
        } catch (e) {
            console.error("모델 로드 실패:", e);
        }
    }
}

const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block';
        loadingSpinner.style.display = 'block';
        
        const lblContainer = document.getElementById("label-container");
        if (lblContainer) lblContainer.innerHTML = '';
        
        await predict(previewImage);
        loadingSpinner.style.display = 'none';
    };
    reader.readAsDataURL(file);
};

imageInput?.addEventListener('change', (e) => handleFile(e.target.files[0]));
const uploadArea = document.getElementById('upload-area');
if (uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
        uploadArea.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    uploadArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);
}

async function predict(imgElement) {
    await initModel();
    if (!model) return;

    const prediction = await model.predict(imgElement);
    
    // 확률 높은 순 정렬
    prediction.sort((a, b) => b.probability - a.probability);
    
    const lblContainer = document.getElementById("label-container");
    lblContainer.innerHTML = '';
    
    // 결과 전량 출력 (개수 제한 없음)
    prediction.forEach(p => {
        const className = p.className;
        const prob = (p.probability * 100).toFixed(0);
        const wrapper = document.createElement("div");
        wrapper.className = "label-wrapper";
        wrapper.innerHTML = `
            <div class="label-text">
                <span>${className}</span>
                <span>${prob}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${prob}%"></div>
            </div>
        `;
        lblContainer.appendChild(wrapper);
    });
}

// 메뉴 추천
let menuQueue = [];
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=500&q=80";

function shuffleMenus() {
    const menus = window.allMenus || [];
    menuQueue = [...Array(menus.length).keys()];
    for (let i = menuQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [menuQueue[i], menuQueue[j]] = [menuQueue[j], menuQueue[i]];
    }
}

recommendMenuBtn?.addEventListener('click', () => {
    const menus = window.allMenus || [];
    if (menus.length === 0) return;

    menuDisplay.classList.add('loading');
    menuName.innerText = '최고의 메뉴 탐색 중...';
    recipeContainer.style.display = 'none';
    const imgContainer = document.getElementById('menu-image-container');
    imgContainer.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        if (menuQueue.length === 0) shuffleMenus();
        const menuIdx = menuQueue.pop();
        const recipe = menus[menuIdx];
        const verifiedImgUrl = `https://images.unsplash.com/photo-${recipe.id}?auto=format&fit=crop&w=600&q=80`;

        const displayRecipe = (src) => {
            imgContainer.innerHTML = `<img src="${src}" id="menu-img" style="display: block;">`;
            menuName.innerText = recipe.name;
            menuCategory.innerText = recipe.category;
            recipeIngredients.innerText = recipe.ingredients;
            recipeSteps.innerHTML = '';
            recipe.steps.forEach(step => {
                const li = document.createElement('li');
                li.innerText = step;
                recipeSteps.appendChild(li);
            });
            recipeContainer.style.display = 'block';
            menuDisplay.classList.remove('loading');
        };

        const imgObj = new Image();
        imgObj.src = verifiedImgUrl;
        imgObj.onload = () => displayRecipe(verifiedImgUrl);
        imgObj.onerror = () => displayRecipe(DEFAULT_IMAGE);
    }, 600);
});
