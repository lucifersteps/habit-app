import { EMOJI_MAP, SCORE_DESCRIPTIONS } from "./constants.js";

// 分数计算工具函数
export class ScoreUtils {
    /**
     * 获取分数对应的emoji
     * @param {number|null} score - 分数
     * @param {string} dateStr - 日期字符串
     * @returns {string} emoji
     */
    static getScoreEmoji(score, dateStr) {
        if (score === null || score === undefined) {
            return EMOJI_MAP.MISSED;
        }
        return EMOJI_MAP[score] || EMOJI_MAP.MISSED;
    }

    /**
     * 获取分数对应的描述
     * @param {number|null} score - 分数
     * @param {string} dateStr - 日期字符串
     * @returns {string} 描述文本
     */
    static getScoreDescription(score, dateStr) {
        if (score === null || score === undefined) {
            return SCORE_DESCRIPTIONS.MISSED;
        }
        return SCORE_DESCRIPTIONS[score] || SCORE_DESCRIPTIONS.MISSED;
    }

    /**
     * 计算每日平均分
     * @param {Object} checkins - 打卡记录
     * @param {Array} habits - 习惯列表
     * @param {string} date - 日期
     * @returns {number} 平均分
     */
    static calculateDailyAverage(checkins, habits, date) {
        const dailyCheckins = checkins[date] || {};
        let totalScore = 0;
        let completedHabits = 0;

        habits.forEach(habit => {
            const score = dailyCheckins[habit.id];
            if (score !== undefined && score !== null) {
                totalScore += score;
                completedHabits++;
            }
        });

        return completedHabits > 0 ? totalScore / completedHabits : 0;
    }

    /**
     * 计算连续打卡天数
     * @param {Object} checkins - 打卡记录
     * @param {Array} habits - 习惯列表
     * @returns {number} 连续天数
     */
    static calculateStreakDays(checkins, habits) {
        const dates = Object.keys(checkins).sort().reverse();
        let streak = 0;

        for (const date of dates) {
            const dailyCheckins = checkins[date] || {};
            const hasCompletedHabits = habits.some(habit => 
                dailyCheckins[habit.id] !== undefined && dailyCheckins[habit.id] !== null
            );

            if (hasCompletedHabits) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * 获取分数对应的CSS类名
     * @param {number|null} score - 分数
     * @returns {string} CSS类名
     */
    static getScoreClass(score) {
        if (score === null || score === undefined) {
            return "score-other";
        }
        return `score-${score}`;
    }
}
