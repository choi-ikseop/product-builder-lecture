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

// 한국인이 즐겨 먹는 모든 음식 데이터베이스 (다양성 확보)
const allMenus = [
    {
        name: "치킨",
        category: "튀김 | 닭고기",
        img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
        ingredients: "생닭 1마리, 튀김가루 2컵, 우유 200ml, 소금, 후추, 식용유",
        steps: ["닭을 손질한 뒤 우유에 20분간 담가 잡내를 제거합니다.", "소금과 후추로 밑간을 합니다.", "튀김가루와 물을 섞어 반죽을 만들고 닭에 입힙니다.", "170도 기름에서 10~12분간 바삭하게 튀겨냅니다.", "한 번 더 튀기면 훨씬 바삭해집니다."]
    },
    {
        name: "피자",
        category: "오븐 | 밀가루",
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
        ingredients: "도우 반죽, 토마토 소스, 모짜렐라 치즈, 페퍼로니, 피망, 양파",
        steps: ["도우를 넓게 펴고 토마토 소스를 골고루 바릅니다.", "치즈를 듬뿍 올린 뒤 원하는 토핑을 더합니다.", "200도 예열된 오븐에서 10~15분간 굽습니다.", "치즈가 노릇하게 녹으면 완성입니다."]
    },
    {
        name: "짜장면",
        category: "면 | 중식",
        img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80",
        ingredients: "중면, 춘장 4큰술, 돼지고기 150g, 양배추, 양파, 감자, 설탕 1큰술, 전분물",
        steps: ["야채와 고기를 깍둑썰기하여 기름에 볶습니다.", "춘장을 넣고 충분히 볶아 향을 냅니다.", "물을 붓고 재료가 익을 때까지 끓인 뒤 전분물로 농도를 맞춥니다.", "삶은 면 위에 소스를 듬뿍 올려 비벼 먹습니다."]
    },
    {
        name: "파스타",
        category: "면 | 이탈리안",
        img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=400&q=80",
        ingredients: "스파게티면, 마늘 5알, 베이컨 3줄, 양파, 생크림 200ml, 우유 100ml, 파마산 치즈",
        steps: ["면을 소금물에 8분간 삶습니다.", "팬에 마늘과 베이컨을 볶아 향을 냅니다.", "생크림과 우유를 붓고 끓이다가 치즈로 간을 합니다.", "삶은 면을 넣고 소스가 잘 배어들도록 볶아줍니다."]
    },
    {
        name: "돈가스",
        category: "튀김 | 돼지고기",
        img: "https://images.unsplash.com/photo-1591814448473-7af5743a699c?auto=format&fit=crop&w=400&q=80",
        ingredients: "돼지등심 200g, 밀가루, 계란, 빵가루, 소금, 후추",
        steps: ["고기를 두드려 부드럽게 한 뒤 소금, 후추로 간을 합니다.", "밀가루 -> 계란물 -> 빵가루 순으로 옷을 입힙니다.", "기름에 노릇하게 튀겨냅니다.", "돈가스 소스를 곁들여 완성합니다."]
    },
    {
        name: "비빔밥",
        category: "밥 | 한식",
        img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80",
        ingredients: "밥 1공기, 콩나물, 시금치, 고사리, 당근, 소고기 볶음, 고추장, 참기름",
        steps: ["각종 나물을 데치고 볶아 준비합니다.", "소고기는 잘게 썰어 간장 양념에 볶습니다.", "밥 위에 나물과 고기를 예쁘게 담습니다.", "고추장과 참기름을 올려 비벼 먹습니다."]
    },
    {
        name: "떡볶이",
        category: "분식 | 한식",
        img: "https://images.unsplash.com/photo-1624538570395-654a8a044810?auto=format&fit=crop&w=400&q=80",
        ingredients: "떡볶이 떡 300g, 어묵 2장, 대파, 고추장 2큰술, 고춧가루 1큰술, 설탕 2큰술, 물 2컵",
        steps: ["물을 끓이고 고추장, 고춧가루, 설탕을 풀어 양념을 만듭니다.", "떡과 어묵을 넣고 국물이 걸쭉해질 때까지 끓입니다.", "대파를 넣고 한소끔 더 끓여 완성합니다."]
    },
    {
        name: "라멘",
        category: "면 | 일식",
        img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
        ingredients: "라면사리, 차슈(돼지고기), 아지타마고(반숙계란), 대파, 숙주, 사골육수",
        steps: ["사골육수를 끓이고 간장이나 미소로 간을 합니다.", "면을 삶아 그릇에 담습니다.", "육수를 붓고 차슈, 계란, 파, 숙주를 고명으로 올립니다."]
    },
    {
        name: "스테이크",
        category: "그릴 | 양식",
        img: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&w=400&q=80",
        ingredients: "소고기 등심 또는 안심 250g, 올리브유, 버터, 마늘, 로즈마리, 소금, 후추",
        steps: ["고기에 소금, 후추, 올리브유로 시즈닝을 합니다.", "팬을 강불로 달군 뒤 고기를 올리고 시어링합니다.", "버터와 마늘을 넣고 베이스팅하며 원하는 굽기로 익힙니다.", "5분간 레스팅 후 썰어 냅니다."]
    },
    {
        name: "감자탕",
        category: "탕 | 한식",
        img: "https://images.unsplash.com/photo-1583224933031-629237077a06?auto=format&fit=crop&w=400&q=80",
        ingredients: "돼지등뼈 1kg, 시래기, 감자, 대파, 들깨가루, 된장, 고춧가루, 다진 마늘",
        steps: ["등뼈를 핏물을 빼고 한 번 데쳐 불순물을 제거합니다.", "물에 등뼈, 된장, 마늘을 넣고 1시간 이상 푹 끓입니다.", "시래기와 감자, 양념장을 넣고 더 끓입니다.", "들깨가루와 대파를 듬뿍 넣어 마무리합니다."]
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
    let identifier = tabId === 'lotto' ? undefined : "general-recipe-tab-" + tabId;

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

// 댓글 수 클릭 시 스크롤 (이벤트 위임 사용으로 안정성 확보)
document.addEventListener('click', (e) => {
    if (e.target.closest('.dsq-count-link')) {
        e.preventDefault();
        const target = document.getElementById('comment-area');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
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

// 5. 전체 메뉴 및 레시피 추천 (중복 방지 로직 추가)
let lastMenuIdx = -1;
recommendMenuBtn.addEventListener('click', () => {
    menuDisplay.classList.add('loading');
    menuName.innerText = '메뉴 탐색 중...';
    recipeContainer.style.display = 'none';
    
    setTimeout(() => {
        let randomIdx;
        do {
            randomIdx = Math.floor(Math.random() * allMenus.length);
        } while (randomIdx === lastMenuIdx && allMenus.length > 1);
        
        lastMenuIdx = randomIdx;
        const recipe = allMenus[randomIdx];

        menuEmoji.style.display = 'none';
        menuImg.src = recipe.img;
        menuImg.style.display = 'block';
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
    }, 800);
});
