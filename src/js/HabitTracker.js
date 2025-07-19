import { StorageManager } from "./StorageManager.js";
import { DateUtils } from "./utils/dateUtils.js";
import { ScoreUtils } from "./utils/scoreUtils.js";

// 核心习惯管理类
export class HabitTracker {
    constructor() {
        this.habits = StorageManager.loadHabits();
        this.checkins = StorageManager.loadCheckins();
        this.currentDate = DateUtils.getCurrentDate();
        this.currentWeekStart = DateUtils.getWeekStart(new Date());
    }

    /**
     * 添加新习惯
     * @param {string} name - 习惯名称
     * @returns {Object} 新习惯对象
     */
    addHabit(name) {
        const newHabit = {
            id: Date.now().toString(),
            name: name,
            createdAt: new Date().toISOString()
        };

        this.habits.push(newHabit);
        StorageManager.saveHabits(this.habits);
        return newHabit;
    }

    /**
     * 更新习惯
     * @param {string} id - 习惯ID
     * @param {Object} updates - 更新内容
     * @returns {boolean} 是否更新成功
     */
    updateHabit(id, updates) {
        const habitIndex = this.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) return false;

        this.habits[habitIndex] = { ...this.habits[habitIndex], ...updates };
        StorageManager.saveHabits(this.habits);
        return true;
    }

    /**
     * 删除习惯
     * @param {string} id - 习惯ID
     * @returns {boolean} 是否删除成功
     */
    deleteHabit(id) {
        const habitIndex = this.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) return false;

        this.habits.splice(habitIndex, 1);
        
        // 同时删除相关的打卡记录
        Object.keys(this.checkins).forEach(date => {
            if (this.checkins[date][id]) {
                delete this.checkins[date][id];
            }
        });

        StorageManager.saveHabits(this.habits);
        StorageManager.saveCheckins(this.checkins);
        return true;
    }

    /**
     * 保存分数
     * @param {string} habitId - 习惯ID
     * @param {string} date - 日期
     * @param {number|null} score - 分数
     */
    saveScore(habitId, date, score) {
        if (!this.checkins[date]) {
            this.checkins[date] = {};
        }

        if (score === null) {
            delete this.checkins[date][habitId];
        } else {
            this.checkins[date][habitId] = score;
        }

        StorageManager.saveCheckins(this.checkins);
    }

    /**
     * 获取习惯列表
     * @returns {Array} 习惯列表
     */
    getHabits() {
        return this.habits;
    }

    /**
     * 获取打卡记录
     * @returns {Object} 打卡记录
     */
    getCheckins() {
        return this.checkins;
    }

    /**
     * 获取指定日期的分数
     * @param {string} habitId - 习惯ID
     * @param {string} date - 日期
     * @returns {number|null} 分数
     */
    getScore(habitId, date) {
        return this.checkins[date]?.[habitId] || null;
    }

    /**
     * 获取当前周开始日期
     * @returns {Date} 周开始日期
     */
    getCurrentWeekStart() {
        return this.currentWeekStart;
    }

    /**
     * 设置当前周开始日期
     * @param {Date} weekStart - 周开始日期
     */
    setCurrentWeekStart(weekStart) {
        this.currentWeekStart = weekStart;
    }

    /**
     * 计算今日统计
     * @returns {Object} 统计信息
     */
    calculateTodayStats() {
        const todayCheckins = this.checkins[this.currentDate] || {};
        let totalScore = 0;
        let completedHabits = 0;

        this.habits.forEach(habit => {
            const score = todayCheckins[habit.id];
            if (score !== undefined && score !== null) {
                totalScore += score;
                completedHabits++;
            }
        });

        const averageScore = completedHabits > 0 ? totalScore / completedHabits : 0;
        const streakDays = ScoreUtils.calculateStreakDays(this.checkins, this.habits);

        return {
            totalScore,
            averageScore: parseFloat(averageScore.toFixed(1)),
            streakDays
        };
    }

    /**
     * 检查习惯名称是否已存在
     * @param {string} name - 习惯名称
     * @param {string} excludeId - 排除的习惯ID（编辑时使用）
     * @returns {boolean} 是否已存在
     */
    isHabitNameExists(name, excludeId = null) {
        return this.habits.some(habit => 
            habit.name === name && habit.id !== excludeId
        );
    }
}
