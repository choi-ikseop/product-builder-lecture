const URL = "https://teachablemachine.withgoogle.com/models/nohC-dlRd/";
let model, labelContainer, maxPredictions;

// DOM 요소
const themeToggle = document.getElementById('theme-toggle');
const tabBtns = document.querySelectorAll('.tab-btn, .nav-link[data-tab]'); // Header links too
const tabContents = document.querySelectorAll('.tab-content');
const numbersContainer = document.getElementById('numbers');
const generateBtn = document.getElementById('generate-btn');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const loadingSpinner = document.getElementById('loading-spinner');

// 저녁 메뉴 추천 요소
const recommendMenuBtn = document.getElementById('recommend-menu-btn');
const menuDisplay = document.getElementById('menu-display');
const menuEmoji = document.getElementById('menu-emoji');
const menuImg = document.getElementById('menu-img');
const menuName = document.getElementById('menu-name');
const menuCategory = document.getElementById('menu-category');

// 레시피 요소
const recipeContainer = document.getElementById('recipe-container');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeSteps = document.getElementById('recipe-steps');

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
    let identifier = "daily-tools-" + tabId; // Unique per tab

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = pageUrl;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = identifier;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-j0ykvmteku.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
}

// 탭 전환 로직 개선
function switchTab(tabId) {
    // 버튼 상태 업데이트 (헤더/사이드바 모두)
    document.querySelectorAll('.tab-btn, .nav-link').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 콘텐츠 표시
    tabContents.forEach(content => {
        if (content.id === `${tabId}-section`) {
            content.classList.add('active');
            content.classList.remove('hidden');
        } else {
            content.classList.remove('active');
            content.classList.add('hidden');
        }
    });

    // 스크롤 조정 (모바일 배려)
    if (window.innerWidth <= 768) {
        window.scrollTo({ top: document.querySelector('.main-content').offsetTop - 80, behavior: 'smooth' });
    }

    resetDisqus(tabId);
}

// 이벤트 리스너 등록
document.querySelectorAll('.tab-btn, .nav-link').forEach(btn => {
    const tabId = btn.getAttribute('data-tab');
    if (tabId) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(tabId);
        });
    }
});

// 초기 탭 설정
switchTab('lotto');

// 3. 로또 번호 생성
generateBtn.addEventListener('click', () => {
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

imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
const uploadArea = document.getElementById('upload-area');
if (uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
        uploadArea.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    uploadArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);
}

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
        wrapper.innerHTML = `<div class="label-text"><span>${className}</span><span>${prob}%</span></div><div class="progress-bar"><div class="progress-fill" style="width: ${prob}%"></div></div>`;
        labelContainer.appendChild(wrapper);
    }
}

// 5. 메뉴 추천 로직
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

recommendMenuBtn.addEventListener('click', () => {
    const menus = window.allMenus || [];
    if (menus.length === 0) return;

    menuDisplay.classList.add('loading');
    menuName.innerText = '최고의 메뉴 탐색 중...';
    recipeContainer.style.display = 'none';
    
    const imgContainer = document.getElementById('menu-image-container');
    imgContainer.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        if (menuQueue.length === 0) {
            shuffleMenus();
        }
        
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
        imgObj.onerror = () => {
            displayRecipe(DEFAULT_IMAGE);
        };
    }, 600);
});
