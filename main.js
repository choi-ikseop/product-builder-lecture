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
const menuDisplay = document.getElementById('menu-display');
const menuEmoji = document.getElementById('menu-emoji');
const menuImg = document.getElementById('menu-img');
const menuName = document.getElementById('menu-name');
const menuCategory = document.getElementById('menu-category');

// 레시피 요소
const recipeContainer = document.getElementById('recipe-container');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeSteps = document.getElementById('recipe-steps');

// 고품질 한식 레시피 데이터베이스
const koreanRecipes = [
    {
        name: "김치찌개",
        category: "찌개 | 육류",
        img: "https://www.themealdb.com/images/media/meals/7vmmwa1598733314.jpg",
        ingredients: "잘 익은 김치 1/4포기, 돼지고기 200g, 두부 1/2모, 대파 1대, 양파 1/4개, 고춧가루 2큰술, 다진 마늘 1큰술, 멸치 육수 3컵",
        steps: [
            "냄비에 식용유를 약간 두르고 돼지고기를 볶아줍니다.",
            "고기 겉면이 익으면 김치를 넣고 함께 충분히 볶습니다.",
            "멸치 육수(또는 물)를 붓고 끓입니다.",
            "고춧가루, 다진 마늘을 넣고 중불에서 15분 이상 끓입니다.",
            "두부, 양파, 대파를 넣고 한소끔 더 끓여 마무리합니다."
        ]
    },
    {
        name: "불고기",
        category: "볶음 | 소고기",
        img: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
        ingredients: "소고기 불고기용 600g, 양파 1/2개, 대파 1대, 표고버섯 2개, 간장 6큰술, 설탕 3큰술, 올리고당 1큰술, 다진 마늘 2큰술, 참기름 2큰술, 후추 약간",
        steps: [
            "소고기는 키친타월로 핏물을 제거합니다.",
            "양념 재료(간장, 설탕 등)를 섞어 양념장을 만듭니다.",
            "고기에 양념장을 넣고 조물조물 버무려 30분 정도 재워둡니다.",
            "팬을 달군 뒤 고기와 손질한 야채를 넣고 강불에서 빠르게 볶습니다.",
            "고기가 익으면 대파와 참기름을 두르고 가볍게 볶아 완성합니다."
        ]
    },
    {
        name: "비빔밥",
        category: "밥 | 채소",
        img: "https://www.themealdb.com/images/media/meals/urtqut1511723591.jpg",
        ingredients: "밥 1공기, 콩나물, 시금치, 고사리, 당근, 애호박, 소고기 다짐육 100g, 계란 1개, 고추장 2큰술, 참기름, 통깨",
        steps: [
            "각종 나물은 데치거나 볶아서 소금, 참기름으로 밑간을 합니다.",
            "소고기 다짐육은 간장 양념에 볶아 준비합니다.",
            "그릇에 밥을 담고 준비한 나물과 고기를 예쁘게 올립니다.",
            "계란 후라이를 해서 중앙에 올립니다.",
            "고추장, 참기름을 곁들여 비벼 먹습니다."
        ]
    },
    {
        name: "제육볶음",
        category: "볶음 | 돼지고기",
        img: "https://www.themealdb.com/images/media/meals/1529445434.jpg",
        ingredients: "돼지고기(뒷다리살 또는 앞다리살) 600g, 양파 1개, 대파 1대, 고추장 3큰술, 고춧가루 2큰술, 간장 2큰술, 설탕 2큰술, 다진 마늘 1큰술",
        steps: [
            "고기를 한입 크기로 썰어 양념장에 30분간 재웁니다.",
            "팬을 달구고 양념된 고기를 먼저 볶습니다.",
            "고기가 반쯤 익으면 양파와 대파를 넣고 함께 볶습니다.",
            "고기가 완전히 익고 양념이 잘 배어들면 완성입니다.",
            "취향에 따라 깻잎을 곁들이면 더 맛있습니다."
        ]
    },
    {
        name: "된장찌개",
        category: "찌개 | 콩",
        img: "https://www.themealdb.com/images/media/meals/1529446106.jpg",
        ingredients: "된장 3큰술, 두부 1/2모, 감자 1개, 호박 1/4개, 양파 1/2개, 대파 1/2대, 청양고추 1개, 멸치 육수 4컵",
        steps: [
            "멸치 육수를 끓이다가 딱딱한 감자를 먼저 넣고 끓입니다.",
            "감자가 반쯤 익으면 된장을 풀어줍니다.",
            "호박, 양파를 넣고 끓이다가 두부를 넣습니다.",
            "다진 마늘과 대파, 고추를 넣어 마무리합니다.",
            "오래 끓일수록 깊은 맛이 납니다."
        ]
    }
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
    let identifier = tabId === 'lotto' ? undefined : "korean-recipe-tab-" + tabId;

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
    document.querySelectorAll('.dsq-count-link').forEach(link => {
        const id = link.id.split('-')[0];
        const linkUrl = id === 'lotto' ? baseUrl : baseUrl + "#!" + id;
        link.setAttribute('href', linkUrl + '#disqus_thread');
        link.setAttribute('data-disqus-url', linkUrl);
    });
}

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
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
    uploadArea.addEventListener(eName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});
uploadArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);

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

// 5. 한식 메뉴 및 레시피 추천
recommendMenuBtn.addEventListener('click', () => {
    menuDisplay.classList.add('loading');
    menuName.innerText = '오늘의 한식 메뉴 고민 중...';
    recipeContainer.style.display = 'none';
    
    setTimeout(() => {
        const randomIdx = Math.floor(Math.random() * koreanRecipes.length);
        const recipe = koreanRecipes[randomIdx];

        menuEmoji.style.display = 'none';
        menuImg.src = recipe.img;
        menuImg.style.display = 'block';
        menuName.innerText = recipe.name;
        menuCategory.innerText = recipe.category;

        // 레시피 업데이트
        recipeIngredients.innerText = recipe.ingredients;
        recipeSteps.innerHTML = '';
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.innerText = step;
            recipeSteps.appendChild(li);
        });

        recipeContainer.style.display = 'block';
        menuDisplay.classList.remove('loading');
    }, 800);
});
