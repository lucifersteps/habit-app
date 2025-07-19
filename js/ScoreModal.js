import { DateUtils } from "./utils/dateUtils.js";
import { SCORE_LEVELS } from "./utils/constants.js";

// 分数选择弹窗类
export class ScoreModal {
    constructor() {
        this.selectedScore = null;
        this.selectedHabitId = null;
        this.selectedDate = null;
        this.onSave = null;
        this.onCancel = null;
    }

    /**
     * 设置保存回调
     * @param {Function} callback - 保存回调函数
     */
    setSaveCallback(callback) {
        this.onSave = callback;
    }

    /**
     * 设置取消回调
     * @param {Function} callback - 取消回调函数
     */
    setCancelCallback(callback) {
        this.onCancel = callback;
    }

    /**
     * 打开分数选择弹窗
     * @param {string} habitId - 习惯ID
     * @param {string} date - 日期
     * @param {number|null} currentScore - 当前分数
     * @param {string} habitName - 习惯名称
     */
    open(habitId, date, currentScore, habitName) {
        this.selectedHabitId = habitId;
        this.selectedDate = date;
        this.selectedScore = currentScore;

        this._updateModalContent(habitName, date);
        this._generateScoreOptions();
        this._showModal();
        this._addEventListeners();
    }

    /**
     * 关闭弹窗
     */
    close() {
        this._hideModal();
        this._removeEventListeners();
        this.selectedScore = null;
        this.selectedHabitId = null;
        this.selectedDate = null;
    }

    /**
     * 更新弹窗内容
     * @param {string} habitName - 习惯名称
     * @param {string} date - 日期
     */
    _updateModalContent(habitName, date) {
        const dateObj = new Date(date);
        const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

        document.getElementById("scoreModalTitle").textContent = 
            `${habitName} - ${dayNames[dateObj.getDay()]} ${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        document.getElementById("scoreModalSubtitle").textContent = "为这个习惯选择努力程度";
    }

    /**
     * 生成分数选项
     */
    _generateScoreOptions() {
        const scoreGrid = document.getElementById("scoreGrid");
        scoreGrid.innerHTML = `
            <div class="score-option score-0 ${this.selectedScore === SCORE_LEVELS.GIVE_UP ? "selected" : ""}" data-score="${SCORE_LEVELS.GIVE_UP}">
                😢 放弃
            </div>
            <div class="score-option score-3 ${this.selectedScore === SCORE_LEVELS.MICRO_HABIT ? "selected" : ""}" data-score="${SCORE_LEVELS.MICRO_HABIT}">
                🙂 微习惯
            </div>
            <div class="score-option score-7 ${this.selectedScore === SCORE_LEVELS.QUALIFIED ? "selected" : ""}" data-score="${SCORE_LEVELS.QUALIFIED}">
                😊 合格
            </div>
            <div class="score-option score-10 ${this.selectedScore === SCORE_LEVELS.EXCELLENT ? "selected" : ""}" data-score="${SCORE_LEVELS.EXCELLENT}">
                🎉 卓越
            </div>
            <div class="score-option score-clear" data-score="clear">
                🗑️ 清除
            </div>
        `;
    }

    /**
     * 显示弹窗
     */
    _showModal() {
        document.getElementById("scoreModal").style.display = "block";
    }

    /**
     * 隐藏弹窗
     */
    _hideModal() {
        document.getElementById("scoreModal").style.display = "none";
    }

    /**
     * 添加事件监听器
     */
    _addEventListeners() {
        const scoreGrid = document.getElementById("scoreGrid");
        const saveBtn = document.getElementById("saveScoreBtn");
        const cancelBtn = document.getElementById("cancelScoreBtn");
        const modal = document.getElementById("scoreModal");

        // 分数选择事件
        scoreGrid.addEventListener("click", this._handleScoreClick.bind(this));

        // 按钮事件
        saveBtn.addEventListener("click", this._handleSave.bind(this));
        cancelBtn.addEventListener("click", this._handleCancel.bind(this));

        // 点击外部关闭
        modal.addEventListener("click", this._handleModalClick.bind(this));
    }

    /**
     * 移除事件监听器
     */
    _removeEventListeners() {
        const scoreGrid = document.getElementById("scoreGrid");
        const saveBtn = document.getElementById("saveScoreBtn");
        const cancelBtn = document.getElementById("cancelScoreBtn");
        const modal = document.getElementById("scoreModal");

        scoreGrid.removeEventListener("click", this._handleScoreClick.bind(this));
        saveBtn.removeEventListener("click", this._handleSave.bind(this));
        cancelBtn.removeEventListener("click", this._handleCancel.bind(this));
        modal.removeEventListener("click", this._handleModalClick.bind(this));
    }

    /**
     * 处理分数点击
     * @param {Event} e - 点击事件
     */
    _handleScoreClick(e) {
        if (e.target.classList.contains("score-option")) {
            const scoreValue = e.target.dataset.score;
            
            // 移除之前的选中状态
            document.querySelectorAll(".score-option").forEach(option => {
                option.classList.remove("selected");
            });

            if (scoreValue === "clear") {
                this.selectedScore = null;
            } else {
                this.selectedScore = parseInt(scoreValue);
                e.target.classList.add("selected");
            }
        }
    }

    /**
     * 处理保存
     */
    _handleSave() {
        if (this.onSave) {
            this.onSave(this.selectedHabitId, this.selectedDate, this.selectedScore);
        }
        this.close();
    }

    /**
     * 处理取消
     */
    _handleCancel() {
        if (this.onCancel) {
            this.onCancel();
        }
        this.close();
    }

    /**
     * 处理弹窗点击
     * @param {Event} e - 点击事件
     */
    _handleModalClick(e) {
        if (e.target.id === "scoreModal") {
            this._handleCancel();
        }
    }
}
