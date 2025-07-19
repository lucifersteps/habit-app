// 分数等级常量
export const SCORE_LEVELS = {
    GIVE_UP: 0,
    MICRO_HABIT: 3,
    QUALIFIED: 7,
    EXCELLENT: 10
};

// Emoji映射
export const EMOJI_MAP = {
    0: "😢",
    3: "🙂", 
    7: "😊",
    10: "🎉",
    MISSED: "🐱",
    FUTURE: "🌱"
};

// 分数等级描述
export const SCORE_DESCRIPTIONS = {
    0: "放弃 - 完全没有努力",
    3: "微习惯 - 小小的努力",
    7: "合格 - 做得不错", 
    10: "卓越 - 凯旋归来",
    MISSED: "已过期，未打卡 - 薛定谔的猫",
    FUTURE: "未来日期 - 种子发芽"
};

// 颜色主题
export const COLOR_THEME = {
    GIVE_UP: "#dc3545",
    MICRO_HABIT: "#ffc107", 
    QUALIFIED: "#17a2b8",
    EXCELLENT: "#28a745",
    MISSED: "#6c757d",
    FUTURE: "#28a745"
};

// 存储键名
export const STORAGE_KEYS = {
    HABITS: "habits",
    CHECKINS: "checkins"
};

// 图表配置
export const CHART_CONFIG = {
    MAX_SCORE: 10,
    STEP_SIZE: 2,
    DAYS_TO_SHOW: 30
};
