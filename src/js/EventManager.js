// 事件管理类
export class EventManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * 初始化所有事件监听器
     */
    init() {
        this._setupHabitModalEvents();
        this._setupWeekNavigationEvents();
        this._setupKeyboardEvents();
    }

    /**
     * 设置习惯模态框事件
     */
    _setupHabitModalEvents() {
        const addHabitBtn = document.getElementById("addHabitBtn");
        const modal = document.getElementById("addHabitModal");
        const closeBtn = modal.querySelector(".close");
        const cancelBtn = document.getElementById("cancelHabitBtn");
        const saveBtn = document.getElementById("saveHabitBtn");

        addHabitBtn.addEventListener("click", () => {
            this.app.showAddHabitModal();
        });

        closeBtn.addEventListener("click", () => {
            this.app.hideAddHabitModal();
        });

        cancelBtn.addEventListener("click", () => {
            this.app.hideAddHabitModal();
        });

        saveBtn.addEventListener("click", () => {
            this.app.saveHabit();
        });

        // 点击模态框外部关闭
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                this.app.hideAddHabitModal();
            }
        });
    }

    /**
     * 设置周导航事件
     */
    _setupWeekNavigationEvents() {
        const prevWeekBtn = document.getElementById("prevWeekBtn");
        const nextWeekBtn = document.getElementById("nextWeekBtn");

        prevWeekBtn.addEventListener("click", () => {
            this.app.navigateWeek(-1);
        });

        nextWeekBtn.addEventListener("click", () => {
            this.app.navigateWeek(1);
        });
    }

    /**
     * 设置键盘事件
     */
    _setupKeyboardEvents() {
        const habitNameInput = document.getElementById("habitName");
        
        habitNameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.app.saveHabit();
            }
        });
    }
}
