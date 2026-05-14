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

        // 刷新设置页显示的头像和名字
        refreshUserDisplay();
    }
}

// 新增：打开个人信息编辑页
function openProfilePage() {
    openPage('profile-edit'); // 假设你的新页面 ID 为 profile-edit
    const currentName = localStorage.getItem('currentUser') || '未登录';
    const currentAvatar = localStorage.getItem('savedAvatar') || '默认头像地址';
    
    const nameInput = document.getElementById('edit-username-input');
    const avatarPreview = document.getElementById('edit-avatar-preview');
    
    if(nameInput) nameInput.value = currentName;
    if(avatarPreview) avatarPreview.src = currentAvatar;
}

// 新增：保存个人信息并同步
function saveProfile() {
    const newName = document.getElementById('edit-username-input').value.trim();
    const avatarImg = document.getElementById('edit-avatar-preview').src;

    if(!newName) { alert('昵称不能为空'); return; }

    localStorage.setItem('currentUser', newName);
    localStorage.setItem('savedAvatar', avatarImg);
    
    refreshUserDisplay();
    alert('修改成功！');
    openPage('settings');
}

// 修改：刷新全局用户信息显示的辅助函数
function refreshUserDisplay() {
    const name = localStorage.getItem('currentUser') || '未登录';
    const avatar = localStorage.getItem('savedAvatar');
    const bio = localStorage.getItem('userBio') || '请输入个性签名'; // 新增：读取签名
    const location = localStorage.getItem('userLocation') || '请输入地区'; // 新增：读取地区

    // 更新设置页显示
    const settingsName = document.getElementById('settings-username-display');
    const settingsAvatar = document.getElementById('settings-avatar-display');
    if(settingsName) settingsName.innerText = name;
    if(settingsAvatar && avatar) settingsAvatar.src = avatar;

    // 更新主页 Profile Card 显示
    const homeName = document.getElementById('user-name');
    const homeAvatar = document.getElementById('user-avatar');
    if(homeName) homeName.innerText = name;
    if(homeAvatar && avatar) homeAvatar.src = avatar;

    // === 新增：更新主页签名和地区显示 ===
    const homeBio = document.querySelector('.profile-info p');
    const homeLocation = document.querySelector('.profile-info span');
    if(homeBio) homeBio.innerText = bio;
    if(homeLocation) homeLocation.innerText = '📍 ' + location;
}

// 整合后的切换标签函数
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

// 退出登录逻辑
function logout() {
    if(confirm("确定要退出登录吗？")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('savedAvatar');
        window.location.reload(); 
    }
}

// === 2. 核心功能：保存配置 & 切换字体 ===

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

    alert('所有配置已保存！');
    goHome();
}

async function fetchModels() {
    const url = document.getElementById('api-url-input').value;
    const key = document.getElementById('api-key-input').value;
    const listContainer = document.getElementById('model-list-container');
    if (!url || !key) { alert('请先填地址和Key！'); return; }

    listContainer.style.display = 'block';
    listContainer.innerHTML = '<div style="padding: 10px;">连接中...</div>';

    try {
        const response = await fetch(`${url}/v1/models`, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        const data = await response.json();
        if (data.data) {
            listContainer.innerHTML = '';
            data.data.forEach(m => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 12px; border-bottom: 0.5px solid #eee; cursor: pointer;';
                item.innerText = m.id;
                item.onclick = () => {
                    document.getElementById('api-model-input').value = m.id;
                    listContainer.style.display = 'none';
                };
                listContainer.appendChild(item);
            });
        }
    } catch (e) { listContainer.innerHTML = '拉取失败: ' + e.message; }
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

function saveFontOnly() {
    const fontSelect = document.getElementById('font-family-select');
    if (fontSelect) {
        const selectedFont = fontSelect.value;
        localStorage.setItem('user-font', selectedFont);
        if (typeof applyFont === "function") {
            applyFont(selectedFont);
            alert('字体样式已保存并生效！');
        }
    }
} 

// === 4. 欢迎屏幕类 ===
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
        const safeTimeout = setTimeout(() => {
            if (!this.isComplete) this.completeLoading();
        }, 3000);

        window.addEventListener('load', () => {
            clearTimeout(safeTimeout);
            this.completeLoading();
        });

        if (document.readyState === 'complete') {
            clearTimeout(safeTimeout);
            this.completeLoading();
        }
    }

    startLoading() {
        const increment = () => {
            if (this.currentProgress < 80 && !this.isComplete) {
                this.targetProgress += Math.random() * 3;
                if (this.targetProgress > 80) this.targetProgress = 80;
            }
            this.updateProgress();
            if (!this.isComplete) setTimeout(increment, 200 + Math.random() * 300);
        };
        increment();
    }

    updateProgress() {
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
        const percentage = Math.min(Math.floor(this.currentProgress), 100);
        if (this.progressFill) this.progressFill.style.width = percentage + '%';
        if (this.progressPercentage) this.progressPercentage.textContent = percentage;
    }

    completeLoading() {
        this.isComplete = true;
        this.currentProgress = 100;
        this.targetProgress = 100;
        this.updateProgress();
        setTimeout(() => { this.hideWelcomeScreen(); }, 2000);
    }

    hideWelcomeScreen() {
        if (this.welcomeContainer) {
            this.welcomeContainer.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            this.welcomeContainer.style.opacity = '0';
            this.welcomeContainer.style.transform = 'translateY(-20px)';
        }
        setTimeout(() => {
            if (this.mainApp) {
                this.mainApp.style.display = 'flex'; 
                this.mainApp.style.animation = 'fadeInApp 1s ease-in';
            }
            if (this.welcomeContainer) {
                setTimeout(() => { this.welcomeContainer.style.display = 'none'; }, 800);
            }
        }, 800);
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

    // 调用全局同步刷新（现在包含签名和地区了）
    refreshUserDisplay();

    // === 新增：加载桌面壁纸逻辑 ===
    const savedWallpaper = localStorage.getItem('userWallpaper');
    const homePage = document.getElementById('page-home');
    if (savedWallpaper && homePage) {
        homePage.style.backgroundImage = `url(${savedWallpaper})`;
        homePage.style.backgroundSize = 'cover';
        homePage.style.backgroundPosition = 'center';
    }

    // 保持主页 Banner 上传逻辑（这是你卡片上方的横幅，不是背景）
    const baDiv = document.getElementById('profile-banner');
    if (localStorage.getItem('savedBanner') && baDiv) baDiv.style.backgroundImage = `url(${localStorage.getItem('savedBanner')})`;

    // ... 后面你原来的图片上传逻辑和 WelcomeScreen 保持不变 ...
    const editAvInput = document.getElementById('edit-avatar-upload');
    if(editAvInput) editAvInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            document.getElementById('edit-avatar-preview').src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    const baInput = document.getElementById('banner-upload');
    if(baInput) baInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            document.getElementById('profile-banner').style.backgroundImage = `url(${ev.target.result})`;
            localStorage.setItem('savedBanner', ev.target.result); 
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    new WelcomeScreen();
});
