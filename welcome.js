class WelcomeScreen {
    constructor() {
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercentage = document.querySelector('.progress-percentage');
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
        // 初期快速增长，然后逐渐减速
        const increment = () => {
            if (this.currentProgress < 90) {
                this.targetProgress += Math.random() * (10 - this.currentProgress * 0.1);
                
                if (this.targetProgress > 90) {
                    this.targetProgress = 90;
                }
            }

            this.updateProgress();

            if (!this.isComplete) {
                setTimeout(increment, 300 + Math.random() * 700);
            }
        };

        increment();
    }

    updateProgress() {
        // 平滑过渡进度
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.15;
        
        const percentage = Math.floor(this.currentProgress);
        this.progressFill.style.width = percentage + '%';
        this.progressPercentage.textContent = percentage;
    }

    completeLoading() {
        this.isComplete = true;
        this.currentProgress = 100;
        this.targetProgress = 100;
        this.updateProgress();

        // 页面加载完成后，延迟隐藏欢迎屏幕
        setTimeout(() => {
            this.hideWelcomeScreen();
        }, 500);
    }

    hideWelcomeScreen() {
        const welcomeContainer = document.querySelector('.welcome-container');
        welcomeContainer.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        welcomeContainer.style.opacity = '0';
        welcomeContainer.style.transform = 'translateY(-30px)';

        // 隐藏完成后跳转到主应用
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
}

// 页面加载时初始化欢迎屏幕
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeScreen();
});