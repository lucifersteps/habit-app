import { DateUtils } from "./utils/dateUtils.js";
import { ScoreUtils } from "./utils/scoreUtils.js";
import { EMOJI_MAP } from "./utils/constants.js";

// 周视图渲染类
export class WeekView {
    constructor(habitTracker) {
        this.habitTracker = habitTracker;
        this.onScoreClick = null;
        this.onEditClick = null;
        this.onDeleteClick = null;
    }

    /**
     * 设置事件回调
     * @param {Function} onScoreClick - 分数点击回调
     * @param {Function} onEditClick - 编辑点击回调
     * @param {Function} onDeleteClick - 删除点击回调
     */
    setEventCallbacks(onScoreClick, onEditClick, onDeleteClick) {
        this.onScoreClick = onScoreClick;
        this.onEditClick = onEditClick;
        this.onDeleteClick = onDeleteClick;
    }

    /**
     * 渲染周视图
     */
    render() {
        const weekDates = DateUtils.getWeekDates(this.habitTracker.getCurrentWeekStart());
        const weekViewTable = document.getElementById("weekViewTable");
        const currentWeekDisplay = document.getElementById("currentWeekDisplay");

        // 更新周显示
        this._updateWeekDisplay(currentWeekDisplay);

        // 如果没有习惯，显示空状态
        if (this.habitTracker.getHabits().length === 0) {
            weekViewTable.innerHTML = this._renderEmptyState();
            return;
        }

        // 生成表格HTML
        const tableHTML = this._generateTableHTML(weekDates);
        weekViewTable.innerHTML = tableHTML;

        // 添加事件监听器
        this._addEventListeners();
    }

    /**
     * 更新周显示
     * @param {HTMLElement} element - 显示元素
     */
    _updateWeekDisplay(element) {
        const weekStart = this.habitTracker.getCurrentWeekStart();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        element.textContent = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    }

    /**
     * 渲染空状态
     * @returns {string} HTML字符串
     */
    _renderEmptyState() {
        return `
            <div class="empty-state">
                <h3>还没有添加习惯</h3>
                <p>点击"添加习惯"按钮开始创建你的第一个习惯吧！</p>
            </div>
        `;
    }

    /**
     * 生成表格HTML
     * @param {Array} weekDates - 周日期数组
     * @returns {string} HTML字符串
     */
    _generateTableHTML(weekDates) {
        const habits = this.habitTracker.getHabits();
        
        let tableHTML = `
            <table class="week-view-table">
                <thead>
                    <tr>
                        <th>习惯</th>
                        ${this._generateHeaderRow(weekDates)}
                    </tr>
                </thead>
                <tbody>
        `;

        // 生成习惯行
        habits.forEach(habit => {
            tableHTML += this._generateHabitRow(habit, weekDates);
        });

        // 生成平均分行
        tableHTML += this._generateAverageRow(weekDates, habits);

        tableHTML += `
                </tbody>
            </table>
        `;

        return tableHTML;
    }

    /**
     * 生成表头行
     * @param {Array} weekDates - 周日期数组
     * @returns {string} HTML字符串
     */
    _generateHeaderRow(weekDates) {
        return weekDates.map(date => {
            const d = new Date(date);
            const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
            const isToday = DateUtils.isToday(date);
            
            return `
                <th>
                    <div>${dayNames[d.getDay()]}</div>
                    <div style="font-size: 12px; color: #6c757d; ${isToday ? "color: #28a745; font-weight: bold;" : ""}">
                        ${d.getMonth() + 1}/${d.getDate()}
                    </div>
                </th>
            `;
        }).join("");
    }

    /**
     * 生成习惯行
     * @param {Object} habit - 习惯对象
     * @param {Array} weekDates - 周日期数组
     * @returns {string} HTML字符串
     */
    _generateHabitRow(habit, weekDates) {
        return `
            <tr class="habit-row">
                <td>
                    <div class="habit-name-cell">
                        <div class="habit-info">
                            <h4>${habit.name}</h4>
                        </div>
                        <div class="habit-actions-small">
                            <button class="btn-small btn-edit-small" data-habit-id="${habit.id}">✏️</button>
                            <button class="btn-small btn-delete-small" data-habit-id="${habit.id}">×</button>
                        </div>
                    </div>
                </td>
                ${weekDates.map(date => this._generateScoreCell(habit, date)).join("")}
            </tr>
        `;
    }

    /**
     * 生成分数单元格
     * @param {Object} habit - 习惯对象
     * @param {string} date - 日期
     * @returns {string} HTML字符串
     */
    _generateScoreCell(habit, date) {
        const score = this.habitTracker.getScore(habit.id, date);
        const isToday = DateUtils.isToday(date);
        const isPast = DateUtils.isPast(date);
        const isFuture = DateUtils.isFuture(date);

        let circleClass = "score-circle";
        let circleContent = "";
        let circleTitle = "";

        if (score !== null && score !== undefined) {
            circleClass += ` ${ScoreUtils.getScoreClass(score)}`;
            circleContent = ScoreUtils.getScoreEmoji(score, date);
            circleTitle = ScoreUtils.getScoreDescription(score, date);
        } else if (isPast) {
            circleClass += " missed";
            circleContent = EMOJI_MAP.MISSED;
            circleTitle = "已过期，未打卡 - 薛定谔的猫";
        } else if (isFuture) {
            circleClass += " future";
            circleContent = EMOJI_MAP.FUTURE;
            circleTitle = "未来日期 - 种子发芽";
        } else {
            circleClass += " score-other";
            circleContent = EMOJI_MAP.MISSED;
            circleTitle = "未打卡 - 薛定谔的猫";
        }

        if (isToday) {
            circleClass += " today";
        }

        return `
            <td>
                <div class="${circleClass}" 
                     data-habit-id="${habit.id}"
                     data-date="${date}"
                     title="${circleTitle}">
                    ${circleContent}
                </div>
            </td>
        `;
    }

    /**
     * 生成平均分行
     * @param {Array} weekDates - 周日期数组
     * @param {Array} habits - 习惯列表
     * @returns {string} HTML字符串
     */
    _generateAverageRow(weekDates, habits) {
        return `
            <tr class="average-row">
                <td>
                    <div class="average-label">
                        <strong>当日平均分</strong>
                    </div>
                </td>
                ${weekDates.map(date => this._generateAverageCell(date, habits)).join("")}
            </tr>
        `;
    }

    /**
     * 生成平均分单元格
     * @param {string} date - 日期
     * @param {Array} habits - 习惯列表
     * @returns {string} HTML字符串
     */
    _generateAverageCell(date, habits) {
        const scores = habits.map(habit => this.habitTracker.getScore(habit.id, date))
                             .filter(score => score !== null && score !== undefined);
        
        let averageScore = 0;
        let displayText = "-";
        let cellClass = "average-cell";
        
        if (scores.length > 0) {
            averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            displayText = averageScore.toFixed(1);
            
            // 根据平均分设置样式
            if (averageScore >= 8) {
                cellClass += " excellent";
            } else if (averageScore >= 6) {
                cellClass += " good";
            } else if (averageScore >= 4) {
                cellClass += " fair";
            } else {
                cellClass += " poor";
            }
        }

        return `
            <td class="${cellClass}">
                <div class="average-score">
                    ${displayText}
                </div>
            </td>
        `;
    }

    /**
     * 添加事件监听器
     */
    _addEventListeners() {
        const weekViewTable = document.getElementById("weekViewTable");
        
        weekViewTable.addEventListener("click", (e) => {
            if (e.target.classList.contains("score-circle")) {
                const habitId = e.target.dataset.habitId;
                const date = e.target.dataset.date;
                if (this.onScoreClick) {
                    this.onScoreClick(habitId, date);
                }
            } else if (e.target.classList.contains("btn-edit-small")) {
                const habitId = e.target.dataset.habitId;
                if (this.onEditClick) {
                    this.onEditClick(habitId);
                }
            } else if (e.target.classList.contains("btn-delete-small")) {
                const habitId = e.target.dataset.habitId;
                if (this.onDeleteClick) {
                    this.onDeleteClick(habitId);
                }
            }
        });
    }
}
