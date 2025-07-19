import { HabitTracker } from "./HabitTracker.js";
import { WeekView } from "./WeekView.js";
import { ScoreModal } from "./ScoreModal.js";
import { ChartManager } from "./ChartManager.js";
import { EventManager } from "./EventManager.js";
import { StorageManager } from "./StorageManager.js";
import { DateUtils } from "./utils/dateUtils.js";

// 主应用类
export class App {
    constructor() {
        this.habitTracker = new HabitTracker();
        this.weekView = new WeekView(this.habitTracker);
        this.scoreModal = new ScoreModal();
        this.chartManager = new ChartManager();
        this.eventManager = new EventManager(this);
        
        this.editingHabitId = null;
    }

    /**
     * 初始化应用
     */
    init() {
        // 初始化示例数据
        StorageManager.initializeSampleData();
        
        // 设置事件回调
        this._setupCallbacks();
        
        // 初始化事件管理器
        this.eventManager.init();
        
        // 渲染初始视图
        this.render();
    }

    /**
     * 设置回调函数
     */
    _setupCallbacks() {
        // 周视图回调
        this.weekView.setEventCallbacks(
            (habitId, date) => this.openScoreModal(habitId, date),
            (habitId) => this.editHabit(habitId),
            (habitId) => this.deleteHabit(habitId)
        );

        // 分数弹窗回调
        this.scoreModal.setSaveCallback((habitId, date, score) => {
            this.saveScore(habitId, date, score);
        });
        
        this.scoreModal.setCancelCallback(() => {
            // 取消操作，无需特殊处理
        });
    }

    /**
     * 渲染应用
     */
    render() {
        this.weekView.render();
        this.updateStats();
        this.chartManager.renderChart(
            this.habitTracker.getCheckins(),
            this.habitTracker.getHabits()
        );
    }

    /**
     * 打开分数选择弹窗
     * @param {string} habitId - 习惯ID
     * @param {string} date - 日期
     */
    openScoreModal(habitId, date) {
        const habit = this.habitTracker.getHabits().find(h => h.id === habitId);
        const currentScore = this.habitTracker.getScore(habitId, date);
        
        this.scoreModal.open(habitId, date, currentScore, habit.name);
    }

    /**
     * 保存分数
     * @param {string} habitId - 习惯ID
     * @param {string} date - 日期
     * @param {number|null} score - 分数
     */
    saveScore(habitId, date, score) {
        this.habitTracker.saveScore(habitId, date, score);
        this.render();
        this.showNotification(
            score === null ? "记录已清除！" : "分数保存成功！",
            "success"
        );
    }

    /**
     * 显示添加习惯模态框
     */
    showAddHabitModal() {
        document.getElementById("addHabitModal").style.display = "block";
        document.getElementById("habitName").focus();
    }

    /**
     * 隐藏添加习惯模态框
     */
    hideAddHabitModal() {
        document.getElementById("addHabitModal").style.display = "none";
        document.getElementById("habitName").value = "";
        document.getElementById("modalTitle").textContent = "添加新习惯";
        this.editingHabitId = null;
    }

    /**
     * 保存习惯
     */
    saveHabit() {
        const name = document.getElementById("habitName").value.trim();

        if (!name) {
            alert("请输入习惯名称");
            return;
        }

        if (this.habitTracker.isHabitNameExists(name, this.editingHabitId)) {
            alert("该习惯已存在");
            return;
        }

        if (this.editingHabitId) {
            // 编辑模式
            if (this.habitTracker.updateHabit(this.editingHabitId, { name })) {
                this.hideAddHabitModal();
                this.render();
                this.showNotification("习惯编辑成功！", "success");
            }
        } else {
            // 添加模式
            this.habitTracker.addHabit(name);
            this.hideAddHabitModal();
            this.render();
            this.showNotification("习惯添加成功！", "success");
        }
    }

    /**
     * 编辑习惯
     * @param {string} habitId - 习惯ID
     */
    editHabit(habitId) {
        const habit = this.habitTracker.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        document.getElementById("modalTitle").textContent = "编辑习惯";
        document.getElementById("habitName").value = habit.name;
        this.editingHabitId = habitId;
        
        this.showAddHabitModal();
    }

    /**
     * 删除习惯
     * @param {string} habitId - 习惯ID
     */
    deleteHabit(habitId) {
        if (confirm("确定要删除这个习惯吗？相关的打卡记录也会被删除。")) {
            if (this.habitTracker.deleteHabit(habitId)) {
                this.render();
                this.showNotification("习惯删除成功！", "success");
            }
        }
    }

    /**
     * 周导航
     * @param {number} direction - 方向（-1为上一周，1为下一周）
     */
    navigateWeek(direction) {
        const currentWeekStart = this.habitTracker.getCurrentWeekStart();
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
        
        this.habitTracker.setCurrentWeekStart(newWeekStart);
        this.weekView.render();
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const stats = this.habitTracker.calculateTodayStats();
        
        document.getElementById("todayScore").textContent = stats.totalScore;
        document.getElementById("avgScore").textContent = stats.averageScore;
        document.getElementById("streakDays").textContent = stats.streakDays;
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型
     */
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#28a745" : "#17a2b8"};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = "translateX(0)";
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}
