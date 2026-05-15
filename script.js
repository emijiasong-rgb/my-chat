// === 1. 基础系统功能 ===

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// 更新网络状态
function updateNetworkStatus() {
    const networkIcon = document.getElementById('network-icon');
    if (!networkIcon) return;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let bars = 4; 
    if (connection) {
        const type = connection.effectiveType || connection.type;
        if (type === '4g' || type === 'wifi') bars = 4;
        else if (type === '3g') bars = 3;
        else if (type === '2g') bars = 2;
        else if (type === 'slow-2g') bars = 1;
    }
    if (!navigator.onLine) bars = 0;
    const rects = networkIcon.querySelectorAll('rect');
    rects.forEach((rect, index) => {
        rect.setAttribute('opacity', index < bars ? '1' : '0.3');
    });
}

// 更新电量状态
function updateBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            updateBatteryUI(battery);
            battery.addEventListener('levelchange', () => updateBatteryUI(battery));
            battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
        });
    }
}

function updateBatteryUI(battery) {
    const level = Math.round(battery.level * 100);
    const isCharging = battery.charging;
    const batteryPercent = document.getElementById('battery-percent');
    const batteryLevel = document.getElementById('battery-level');
    if (batteryPercent) batteryPercent.textContent = level + '%';
    if (batteryLevel) {
        batteryLevel.setAttribute('width', Math.round((level / 100) * 18));
        batteryLevel.setAttribute('fill', isCharging ? '#34c759' : (level <= 20 ? '#ff3b30' : 'currentColor'));
    }
}

// 更新时间
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if(document.getElementById('clock')) document.getElementById('clock').innerText = h + ":" + m;
    if(document.getElementById('big-time')) document.getElementById('big-time').innerText = h + ":" + m;
    
    const dateStr = String(now.getMonth() + 1).padStart(2, '0') + "/" + String(now.getDate()).padStart(2, '0') + " " + weekDays[now.getDay()] + ".";
    if(document.getElementById('big-date')) document.getElementById('big-date').innerText = dateStr;
}

// 页面切换核心函数
function openPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) targetPage.classList.add('active');
    
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        document.getElementById('api-url-input').value = localStorage.getItem('api_url') || '';
        document.getElementById('api-key-input').value = localStorage.getItem('api_key') || '';
        document.getElementById('api-model-input').value = localStorage.getItem('api_model') || '';
        
        const savedFont = localStorage.getItem('user-font') || 'default';
        const fontSelect = document.getElementById('font-family-select');
        if(fontSelect) fontSelect.value = savedFont;

        refreshUserDisplay();
    }
}

// 打开个人信息编辑页
function openProfilePage() {
    openPage('profile-edit');
    
    const currentName = localStorage.getItem('currentUser') || '未登录';
    const currentAvatar = localStorage.getItem('savedAvatar') || '默认头像.jpg';
    const currentBio = localStorage.getItem('userBio') || '';
    const currentLocation = localStorage.getItem('userLocation') || '';
    const currentBirthday = localStorage.getItem('userBirthday') || '';
    
    const nameInput = document.getElementById('edit-username');
    const bioInput = document.getElementById('edit-bio');
    const locationInput = document.getElementById('edit-location');
    const birthdayInput = document.getElementById('edit-birthday');
    const avatarPreview = document.getElementById('edit-avatar-preview');
    
    if(nameInput) nameInput.value = currentName;
    if(bioInput) bioInput.value = currentBio;
    if(locationInput) locationInput.value = currentLocation;
    if(birthdayInput) birthdayInput.value = currentBirthday;
    if(avatarPreview) avatarPreview.src = currentAvatar;
    
    // 桌面壁纸状态
    const bgStatus = document.getElementById('bg-status');
    if(bgStatus && localStorage.getItem('userWallpaper')) {
        bgStatus.textContent = '已设置';
        bgStatus.style.color = '#34c759';
    }
    
    // 个人主页背景状态
    const headerBgStatus = document.getElementById('header-bg-status');
    if(headerBgStatus && localStorage.getItem('headerBackground')) {
        headerBgStatus.textContent = '已设置';
        headerBgStatus.style.color = '#34c759';
    }
}

// 保存个人信息并同步
function saveProfile() {
    const newName = document.getElementById('edit-username').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();
    const newLocation = document.getElementById('edit-location').value.trim();
    const newBirthday = document.getElementById('edit-birthday').value;
    const avatarImg = document.getElementById('edit-avatar-preview').src;

    if(!newName) { alert('昵称不能为空'); return; }

    localStorage.setItem('currentUser', newName);
    localStorage.setItem('savedAvatar', avatarImg);
    localStorage.setItem('userBio', newBio);
    localStorage.setItem('userLocation', newLocation);
    localStorage.setItem('userBirthday', newBirthday);
    
    refreshUserDisplay();
    alert('修改成功！');
    goHome(); // 修改后建议直接回主页看效果
}

function refreshUserDisplay() {
    const name = localStorage.getItem('currentUser') || '未登录';
    const avatar = localStorage.getItem('savedAvatar');
    const bio = localStorage.getItem('userBio') || '请输入个性签名'; 
    const location = localStorage.getItem('userLocation') || '请输入地区'; 
    const wallpaper = localStorage.getItem('userWallpaper');
    const headerBg = localStorage.getItem('headerBackground');

    // 1. 更新名字和头像
    const homeName = document.getElementById('user-name');
    const homeAvatar = document.getElementById('user-avatar');
    if(homeName) homeName.innerText = name;
    if(homeAvatar && avatar) homeAvatar.src = avatar;

    // 2. 更新签名和地区
    const homeBio = document.getElementById('user-signature');
    const homeLocation = document.getElementById('user-location');
    if(homeBio) homeBio.innerText = bio;
    if(homeLocation) homeLocation.innerText = '📍 ' + location;

    // 3. 更新桌面壁纸
    const homePage = document.getElementById('page-home');
    if (homePage && wallpaper) {
        homePage.style.backgroundImage = `url(${wallpaper})`;
    }
    
    // 4. 更新头像后面的背景（个人主页背景）
    // 这里匹配你 index.html 里的 ID: profile-banner
    const profileBanner = document.getElementById('profile-banner');
    if (profileBanner && headerBg) {
        profileBanner.style.backgroundImage = `url(${headerBg})`;
        profileBanner.style.backgroundSize = 'cover';
        profileBanner.style.backgroundPosition = 'center';
    }
}

function switchTab(tabId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (tabId === 'message' && isLoggedIn !== 'true') {
        alert("请先登录后再使用聊天功能");
        window.location.href = 'login.html';
        return;
    }
    openPage(tabId);
    const navBar = document.getElementById('nav-bar');
    if(navBar) navBar.style.display = 'flex';
}

function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
}

// 退出登录
function logout() {
    if(confirm("确定要退出登录吗？")) {
        localStorage.clear(); // 退出建议清空，或者按需 removeItem
        window.location.href = 'login.html';
    }
}

// === 2. 配置 & 字体 ===
function applyFont(fontKey) {
    document.body.classList.remove('font-cute', 'font-serif', 'font-modern');
    if (fontKey && fontKey !== 'default') {
        document.body.classList.add('font-' + fontKey);
    }
}

function saveSettings() {
    localStorage.setItem('api_url', document.getElementById('api-url-input').value);
    localStorage.setItem('api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('api_model', document.getElementById('api-model-input').value);
    
    const fontSelect = document.getElementById('font-family-select');
    if (fontSelect) {
        const selectedFont = fontSelect.value;
        localStorage.setItem('user-font', selectedFont);
        applyFont(selectedFont); 
    }
    alert('配置已保存！');
    goHome();
}

// === 3. 聊天逻辑 ===
function openChat(name) {
    document.getElementById('chat-user-name').innerText = name;
    const detail = document.getElementById('chat-detail');
    detail.classList.add('open');
    detail.style.display = 'flex';
}

function closeChat() {
    document.getElementById('chat-detail').classList.remove('open');
    setTimeout(() => { document.getElementById('chat-detail').style.display = 'none'; }, 300);
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    const text = input.value.trim();
    if(!text) return;

    const myMsg = document.createElement('div');
    myMsg.className = 'msg sent';
    myMsg.innerText = text;
    container.appendChild(myMsg);
    input.value = '';

    const url = localStorage.getItem('api_url');
    const key = localStorage.getItem('api_key');
    const model = localStorage.getItem('api_model');
    if(!key || !url || !model) { alert('配置不完整！'); return; }

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'msg recv';
    loadingMsg.innerText = '正在思考...';
    container.appendChild(loadingMsg);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({ model: model, messages: [{role: "user", content: text}] })
        });
        const data = await response.json();
        loadingMsg.innerText = (data.choices && data.choices[0]) ? data.choices[0].message.content : "回复异常";
    } catch (e) { loadingMsg.innerText = '错误: ' + e.message; }
    container.scrollTop = container.scrollHeight;
}

// === 4. 欢迎屏幕 ===
class WelcomeScreen {
    constructor() {
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.welcomeContainer = document.getElementById('welcome-container');
        this.mainApp = document.getElementById('main-app');
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isComplete = false;
        this.init();
    }

    init() {
        this.startLoading();
        window.addEventListener('load', () => this.completeLoading());
        setTimeout(() => { if (!this.isComplete) this.completeLoading(); }, 3500);
    }

    startLoading() {
        const increment = () => {
            if (this.currentProgress < 85 && !this.isComplete) {
                this.targetProgress += Math.random() * 5;
                this.updateProgress();
                setTimeout(increment, 300);
            }
        };
        increment();
    }

    updateProgress() {
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
        const p = Math.min(Math.floor(this.currentProgress), 100);
        if (this.progressFill) this.progressFill.style.width = p + '%';
        if (this.progressPercentage) this.progressPercentage.textContent = p;
    }

    completeLoading() {
        this.isComplete = true;
        this.targetProgress = 100;
        this.currentProgress = 100;
        if (this.progressFill) this.progressFill.style.width = '100%';
        if (this.progressPercentage) this.progressPercentage.textContent = '100';
        setTimeout(() => this.hideWelcomeScreen(), 1000);
    }

    hideWelcomeScreen() {
        if (this.welcomeContainer) {
            this.welcomeContainer.style.opacity = '0';
            setTimeout(() => {
                this.welcomeContainer.style.display = 'none';
                if (this.mainApp) this.mainApp.style.display = 'flex';
            }, 800);
        }
    }
}

// === 5. 初始化 ===
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    updateNetworkStatus();
    updateBatteryStatus();

    const savedFont = localStorage.getItem('user-font');
    if (savedFont) applyFont(savedFont);

    refreshUserDisplay();

    // 事件监听绑定
    // 1. 头像预览监听
    const editAvInput = document.getElementById('avatar-input');
    if(editAvInput) editAvInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            const preview = document.getElementById('edit-avatar-preview');
            if(preview) preview.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    // 2. 桌面壁纸上传
    const bgInput = document.getElementById('bg-input');
    if(bgInput) bgInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            localStorage.setItem('userWallpaper', ev.target.result);
            const status = document.getElementById('bg-status');
            if(status) { status.textContent = '已选择'; status.style.color = '#ff9500'; }
        };
        reader.readAsDataURL(e.target.files[0]);
    });
    
    // 3. 个人主页背景上传
    const headerBgInput = document.getElementById('header-bg-input');
    if(headerBgInput) headerBgInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            localStorage.setItem('headerBackground', ev.target.result);
            const status = document.getElementById('header-bg-status');
            if(status) { status.textContent = '已选择'; status.style.color = '#ff9500'; }
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    new WelcomeScreen();
});
