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
        // 非常缓慢的进度增长
        const increment = () => {
            if (this.currentProgress < 85) {
                this.targetProgress += Math.random() * (2 - this.currentProgress * 0.02);
                
                if (this.targetProgress > 85) {
                    this.targetProgress = 85;
                }
            }

            this.updateProgress();

            if (!this.isComplete) {
                // 非常长的时间间隔：1500ms - 3000ms
                setTimeout(increment, 1500 + Math.random() * 1500);
            }
        };

        increment();
    }

    updateProgress() {
        // 平滑过渡进度
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
        
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
        }, 3000);
    }

    hideWelcomeScreen() {
        const welcomeContainer = document.querySelector('.welcome-container');
        welcomeContainer.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        welcomeContainer.style.opacity = '0';
        welcomeContainer.style.transform = 'translateY(-30px)';

        // 隐藏完成后跳���到主应用
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// 页面加载时初始化欢迎屏幕
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeScreen();
});