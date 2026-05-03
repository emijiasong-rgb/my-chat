// === 1. 基础系统功能 ===

// 星期映射（中英文）
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const weekDaysCN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 更新网络状态
function updateNetworkStatus() {
    const networkIcon = document.getElementById('network-icon');
    if (!networkIcon) return;
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let bars = 4; // 默认满格
    
    if (connection) {
        const type = connection.effectiveType || connection.type;
        // 根据网络类型设置信号强度
        if (type === '4g' || type === 'wifi') {
            bars = 4;
        } else if (type === '3g') {
            bars = 3;
        } else if (type === '2g') {
            bars = 2;
        } else if (type === 'slow-2g') {
            bars = 1;
        }
    }
    
    // 检测是否在线
    if (!navigator.onLine) {
        bars = 0;
    }
    
    // 更新信号图标
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
            
            // 监听电量变化
            battery.addEventListener('levelchange', function() {
                updateBatteryUI(battery);
            });
            
            battery.addEventListener('chargingchange', function() {
                updateBatteryUI(battery);
            });
        });
    } else {
        // 不支持 Battery API 的浏览器，显示默认值
        const batteryPercent = document.getElementById('battery-percent');
        const batteryLevel = document.getElementById('battery-level');
        if (batteryPercent) batteryPercent.textContent = '100%';
        if (batteryLevel) batteryLevel.setAttribute('width', '18');
    }
}

function updateBatteryUI(battery) {
    const level = Math.round(battery.level * 100);
    const isCharging = battery.charging;
    
    const batteryPercent = document.getElementById('battery-percent');
    const batteryLevel = document.getElementById('battery-level');
    const batteryIcon = document.getElementById('battery-icon');
    
    if (batteryPercent) {
        batteryPercent.textContent = level + '%';
    }
    
    if (batteryLevel) {
        // 电量条宽度：最大18px
        const width = Math.round((level / 100) * 18);
        batteryLevel.setAttribute('width', width);
        
        // 电量颜色
        if (level <= 20 && !isCharging) {
            batteryLevel.setAttribute('fill', '#ff3b30'); // 红色低电量
        } else if (isCharging) {
            batteryLevel.setAttribute('fill', '#34c759'); // 绿色充电中
        } else {
            batteryLevel.setAttribute('fill', 'currentColor'); // 正常颜色
        }
    }
}

// 更新顶部状态栏时间
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = hours + ":" + minutes;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = timeStr;
}

// 更新名片区域的大时钟
function updateBigClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDay = weekDays[now.getDay()];
    
    const bigTimeEl = document.getElementById('big-time');
    const bigDateEl = document.getElementById('big-date');
    
    if(bigTimeEl) bigTimeEl.innerText = hours + ":" + minutes;
    if(bigDateEl) bigDateEl.innerText = month + "/" + day + " " + weekDay + ".";
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 立即更新一次
    updateClock();
    updateBigClock();
    updateNetworkStatus();
    updateBatteryStatus();
    
    // 每秒更新时间
    setInterval(function() {
        updateClock();
        updateBigClock();
    }, 1000);
    
    // 监听网络状态变化
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 如果支持 Network Information API，监听变化
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        connection.addEventListener('change', updateNetworkStatus);
    }
});

// 基础页面切换逻辑
function openPage(pageId) {
    // 隐藏所有页面，显示目标页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) targetPage.classList.add('active');
    
    // 如果进入设置页，自动从本地存储读取并填充输入框
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        document.getElementById('api-url-input').value = localStorage.getItem('api_url') || '';
        document.getElementById('api-key-input').value = localStorage.getItem('api_key') || '';
        document.getElementById('api-model-input').value = localStorage.getItem('api_model') || '';
    }
}

// 切换底部 Tab（微信、联系人等）
function switchTab(tabId) {
    openPage(tabId);
    document.getElementById('nav-bar').style.display = 'flex';
}

// 返回桌面
function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
    const chatDetail = document.getElementById('chat-detail');
    if(chatDetail) chatDetail.classList.remove('open');
}

// === 2. API 配置与模型拉取 ===

// 联网拉取模型列表
async function fetchModels() {
    const url = document.getElementById('api-url-input').value;
    const key = document.getElementById('api-key-input').value;
    const listContainer = document.getElementById('model-list-container');

    if (!url || !key) {
        alert('请先填写 API 地址和密钥后再拉取！');
        return;
    }

    listContainer.style.display = 'block';
    listContainer.innerHTML = '<div style="padding: 10px; color: #666;">正在连接服务器拉取模型...</div>';

    try {
        // 请求 API 站点的模型列表接口
        const response = await fetch(`${url}/v1/models`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${key}` }
        });

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            listContainer.innerHTML = ''; 
            data.data.forEach(model => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 12px; border-bottom: 0.5px solid #eee; cursor: pointer; color: #333;';
                item.innerText = model.id;
                
                // 点击模型项：自动填充并隐藏列表
                item.onclick = function() {
                    document.getElementById('api-model-input').value = model.id;
                    listContainer.style.display = 'none';
                    item.style.background = '#f0f0f0';
                };
                listContainer.appendChild(item);
            });
        } else {
            listContainer.innerHTML = '<div style="padding: 10px; color: red;">未获取到模型数据，请检查地址或Key</div>';
        }
    } catch (error) {
        listContainer.innerHTML = `<div style="padding: 10px; color: red;">连接失败: ${error.message}</div>`;
    }
}

// 保存所有设置到本地
function saveSettings() {
    localStorage.setItem('api_url', document.getElementById('api-url-input').value);
    localStorage.setItem('api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('api_model', document.getElementById('api-model-input').value);
    alert('API 配置已成功保存！');
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
    const detail = document.getElementById('chat-detail');
    detail.classList.remove('open');
    setTimeout(() => { detail.style.display = 'none'; }, 300);
}

// 发送消息并调用 AI 接口
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    const text = input.value.trim();
    if(!text) return;

    // 显示用户发送的消息
    const myMsg = document.createElement('div');
    myMsg.className = 'msg sent';
    myMsg.innerText = text;
    container.appendChild(myMsg);
    input.value = '';

    // 读取配置
    const url = localStorage.getItem('api_url');
    const key = localStorage.getItem('api_key');
    const model = localStorage.getItem('api_model');

    if(!key || !url || !model) {
        alert('配置不完整，请先去“设置”页面完成配置并保存！');
        return;
    }

    // 显示 AI 正在输入的提示
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'msg recv';
    loadingMsg.innerText = '正在思考...';
    container.appendChild(loadingMsg);
    container.scrollTop = container.scrollHeight;

    try {
        // 调用 AI 对话接口
        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{role: "user", content: text}]
            })
        });

        const data = await response.json();
        if(data.choices && data.choices[0]) {
            loadingMsg.innerText = data.choices[0].message.content;
        } else {
            loadingMsg.innerText = "收到异常回复，请检查 API 状态。";
        }
    } catch (error) {
        loadingMsg.innerText = '请求失败: ' + error.message;
    }
    container.scrollTop = container.scrollHeight;
}

// === 4. 相册图片选择与持久化逻辑 ===

document.addEventListener('DOMContentLoaded', () => {
    const avInput = document.getElementById('avatar-upload');
    const baInput = document.getElementById('banner-upload');
    const avImg = document.getElementById('user-avatar');
    const baDiv = document.getElementById('profile-banner');

    // 1. 初始化恢复缓存
    const savedAvatar = localStorage.getItem('savedAvatar');
    const savedBanner = localStorage.getItem('savedBanner');
    if (savedAvatar && avImg) avImg.src = savedAvatar;
    if (savedBanner && baDiv) baDiv.style.backgroundImage = `url(${savedBanner})`;

    // 2. 处理头像上传
    if (avInput && avImg) {
        avInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target.result;
                    avImg.src = data;
                    localStorage.setItem('savedAvatar', data);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. 处理背景上传
    if (baInput && baDiv) {
        baInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target.result;
                    baDiv.style.backgroundImage = `url(${data})`;
                    localStorage.setItem('savedBanner', data);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
