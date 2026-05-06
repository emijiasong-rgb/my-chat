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
        // 开始加载进度
        this.startLoading();
        
        // 监听页面加载完成
        window.addEventListener('load', () => {
            this.completeLoading();
        });

        // 如果页面已经加载完成（缓存情况）
        if (document.readyState === 'complete') {
            this.completeLoading();
        }
    }

    startLoading() {
        // 极其缓慢的进度增长
        const increment = () => {
            if (this.currentProgress < 80) {
                this.targetProgress += Math.random() * (0.5 - this.currentProgress * 0.005);
                
                if (this.targetProgress > 80) {
                    this.targetProgress = 80;
                }
            }

            this.updateProgress();

            if (!this.isComplete) {
                // 极长的时间间隔：3000ms - 6000ms
                setTimeout(increment, 3000 + Math.random() * 3000);
            }
        };

        increment();
    }

    updateProgress() {
        // 平滑过渡进度
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.05;
        
        const percentage = Math.floor(this.currentProgress);
        this.progressFill.style.width = percentage + '%';
        this.progressPercentage.textContent = percentage;
    }

    completeLoading() {
        this.isComplete = true;
        this.currentProgress = 100;
        this.targetProgress = 100;
        this.updateProgress();

        // 页面加载完成后，延迟很久再隐藏欢迎屏幕
        setTimeout(() => {
            this.hideWelcomeScreen();
        }, 5000);
    }

    hideWelcomeScreen() {
        // 欢迎页面淡出
        this.welcomeContainer.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
        this.welcomeContainer.style.opacity = '0';
        this.welcomeContainer.style.transform = 'translateY(-30px)';

        // 同时显示主应用
        setTimeout(() => {
            this.mainApp.style.display = 'block';
            this.mainApp.style.animation = 'fadeInApp 1s ease-in';
        }, 1500);
    }
}

// 页面加载时初始化欢迎屏幕
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeScreen();
});