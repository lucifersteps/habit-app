import { STORAGE_KEYS } from "./utils/constants.js";

// 数据存储管理类
export class StorageManager {
    /**
     * 保存习惯数据到localStorage
     * @param {Array} habits - 习惯列表
     */
    static saveHabits(habits) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    }

    /**
     * 从localStorage加载习惯数据
     * @returns {Array} 习惯列表
     */
    static loadHabits() {
        const habits = localStorage.getItem(STORAGE_KEYS.HABITS);
        return habits ? JSON.parse(habits) : [];
    }

    /**
     * 保存打卡记录到localStorage
     * @param {Object} checkins - 打卡记录
     */
    static saveCheckins(checkins) {
        localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
    }

    /**
     * 从localStorage加载打卡记录
     * @returns {Object} 打卡记录
     */
    static loadCheckins() {
        const checkins = localStorage.getItem(STORAGE_KEYS.CHECKINS);
        return checkins ? JSON.parse(checkins) : {};
    }

    /**
     * 初始化示例数据
     */
    static initializeSampleData() {
        const existingHabits = this.loadHabits();
        if (existingHabits.length === 0) {
            const sampleHabits = [
                {
                    id: "1",
                    name: "锻炼身体",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "2", 
                    name: "学习新知识",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "3",
                    name: "早睡早起", 
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveHabits(sampleHabits);
        }
    }

    /**
     * 清除所有数据
     */
    static clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.HABITS);
        localStorage.removeItem(STORAGE_KEYS.CHECKINS);
    }
}
