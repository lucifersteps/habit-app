// 日期工具函数
export class DateUtils {
    /**
     * 获取指定日期所在周的开始日期（周一）
     * @param {Date} date - 指定日期
     * @returns {Date} 周开始日期
     */
    static getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一为第一天
        return new Date(d.setDate(diff));
    }

    /**
     * 获取指定周的所有日期
     * @param {Date} weekStart - 周开始日期
     * @returns {string[]} 日期数组（YYYY-MM-DD格式）
     */
    static getWeekDates(weekStart) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date.toISOString().split("T")[0]);
        }
        return dates;
    }

    /**
     * 获取当前日期字符串
     * @returns {string} 当前日期（YYYY-MM-DD格式）
     */
    static getCurrentDate() {
        return new Date().toISOString().split("T")[0];
    }

    /**
     * 格式化日期显示
     * @param {string} dateStr - 日期字符串
     * @returns {string} 格式化后的日期
     */
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    /**
     * 获取星期名称
     * @param {string} dateStr - 日期字符串
     * @returns {string} 星期名称
     */
    static getDayName(dateStr) {
        const date = new Date(dateStr);
        const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        return dayNames[date.getDay()];
    }

    /**
     * 判断是否为今天
     * @param {string} dateStr - 日期字符串
     * @returns {boolean} 是否为今天
     */
    static isToday(dateStr) {
        return dateStr === this.getCurrentDate();
    }

    /**
     * 判断是否为过去日期
     * @param {string} dateStr - 日期字符串
     * @returns {boolean} 是否为过去日期
     */
    static isPast(dateStr) {
        const date = new Date(dateStr);
        const today = new Date(this.getCurrentDate());
        return date < today;
    }

    /**
     * 判断是否为未来日期
     * @param {string} dateStr - 日期字符串
     * @returns {boolean} 是否为未来日期
     */
    static isFuture(dateStr) {
        const date = new Date(dateStr);
        const today = new Date(this.getCurrentDate());
        return date > today;
    }
}
