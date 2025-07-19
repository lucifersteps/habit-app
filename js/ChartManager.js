import { ScoreUtils } from "./utils/scoreUtils.js";
import { CHART_CONFIG } from "./utils/constants.js";

// 图表管理类
export class ChartManager {
    constructor() {
        this.chart = null;
    }

    /**
     * 渲染努力效果图表
     * @param {Object} checkins - 打卡记录
     * @param {Array} habits - 习惯列表
     */
    renderChart(checkins, habits) {
        const chartData = this._prepareChartData(checkins, habits);

        // 销毁现有图表
        this._destroyExistingChart();

        // 如果没有数据，显示空状态
        if (chartData.habitDatasets.length === 0 || 
            chartData.habitDatasets.every(dataset => dataset.data.every(score => score === null))) {
            this._showEmptyState();
            return;
        }

        // 创建新图表
        this._createChart(chartData);
    }

    /**
     * 准备图表数据
     * @param {Object} checkins - 打卡记录
     * @param {Array} habits - 习惯列表
     * @returns {Object} 图表数据
     */
    _prepareChartData(checkins, habits) {
        // 确保checkins是有效的对象
        if (!checkins || typeof checkins !== 'object') {
            return {
                labels: [],
                habitDatasets: [],
                averageData: []
            };
        }

        const dates = Object.keys(checkins).filter(date => {
            // 过滤掉无效的日期字符串
            const dateObj = new Date(date);
            return !isNaN(dateObj.getTime());
        }).sort();
        
        const recentDates = dates.slice(-CHART_CONFIG.DAYS_TO_SHOW);

        // 如果没有有效日期，返回空数据
        if (recentDates.length === 0) {
            return {
                labels: [],
                habitDatasets: [],
                averageData: []
            };
        }

        // 准备每个习惯的折线数据
        const habitDatasets = habits.map((habit, index) => {
            const colors = [
                '#007AFF',   // 苹果蓝
                '#34C759',   // 苹果绿
                '#FF9500',   // 苹果橙
                '#FF3B30',   // 苹果红
                '#5AC8FA',   // 苹果青
                '#AF52DE',   // 苹果紫
                '#FF2D92',   // 苹果粉
                '#FFCC02'    // 苹果黄
            ];
            
            const data = recentDates.map(date => {
                const score = checkins[date] && checkins[date][habit.id];
                // 确保返回的是有效数字或null
                return (score !== null && score !== undefined && !isNaN(score)) ? Number(score) : null;
            });

            return {
                label: habit.name,
                data: data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: colors[index % colors.length],
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointHitRadius: 6,
                type: 'line'
            };
        });

        // 准备平均分柱状图数据
        const averageData = recentDates.map(date => {
            const dailyScores = habits.map(habit => {
                const score = checkins[date] && checkins[date][habit.id];
                return (score !== null && score !== undefined && !isNaN(score)) ? Number(score) : null;
            }).filter(score => score !== null && score !== undefined && !isNaN(score));
            
            if (dailyScores.length === 0) return null;
            
            const average = dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length;
            return Math.round(average * 10) / 10; // 保留一位小数
        });

        // 生成标签，确保日期格式正确
        const labels = recentDates.map(date => {
            try {
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    return 'Invalid Date';
                }
                return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            } catch (error) {
                console.error('Invalid date format:', date);
                return 'Invalid Date';
            }
        });

        return {
            labels: labels,
            habitDatasets: habitDatasets,
            averageData: averageData
        };
    }

    /**
     * 销毁现有图表
     */
    _destroyExistingChart() {
        if (this.chart && typeof this.chart.destroy === "function") {
            this.chart.destroy();
        }
    }

    /**
     * 显示空状态
     */
    _showEmptyState() {
        const chartContainer = document.querySelector(".chart-container");
        chartContainer.innerHTML = `
            <div class="empty-state">
                <h3>还没有打卡记录</h3>
                <p>完成今日打卡后，这里会显示你的努力趋势图</p>
            </div>
        `;
    }

    /**
     * 创建图表
     * @param {Object} chartData - 图表数据
     */
    _createChart(chartData) {
        // 恢复canvas元素
        const chartContainer = document.querySelector(".chart-container");
        chartContainer.innerHTML = "<canvas id=\"effortChart\"></canvas>";
        const ctx = document.getElementById("effortChart").getContext("2d");

        // 合并所有数据集
        const allDatasets = [...chartData.habitDatasets];
        
        // 添加平均分柱状图数据集
        if (chartData.averageData.some(score => score !== null)) {
            allDatasets.push({
                label: "当日平均分",
                data: chartData.averageData,
                backgroundColor: "rgba(0, 122, 255, 0.15)",
                borderColor: "#007AFF",
                borderWidth: 1,
                type: 'bar',
                order: 1, // 确保柱状图在折线图后面
                yAxisID: 'y',
                borderRadius: 4,
                borderSkipped: false
            });
        }

        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: chartData.labels.filter(label => label !== 'Invalid Date'),
                datasets: allDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 16,
                            font: {
                                size: 11,
                                family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            },
                            color: '#86868B'
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(28, 28, 30, 0.95)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "#007AFF",
                        borderWidth: 1,
                        cornerRadius: 12,
                        displayColors: true,
                        titleFont: {
                            size: 13,
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                        },
                        bodyFont: {
                            size: 12,
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                        },
                        callbacks: {
                            title: function(context) {
                                return `日期: ${context[0].label}`;
                            },
                            label: function(context) {
                                const dataset = context.dataset;
                                if (dataset.type === 'bar') {
                                    return `平均分: ${context.parsed.y.toFixed(1)}分`;
                                } else {
                                    return `${dataset.label}: ${context.parsed.y}分`;
                                }
                            },
                            filter: function(context) {
                                // 过滤掉null和undefined值
                                return context.parsed.y !== null && context.parsed.y !== undefined && !isNaN(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: CHART_CONFIG.MAX_SCORE,
                        grid: {
                            color: "rgba(142, 142, 147, 0.1)",
                            drawBorder: false
                        },
                        ticks: {
                            color: "#86868B",
                            font: {
                                size: 11,
                                family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            },
                            stepSize: CHART_CONFIG.STEP_SIZE,
                            padding: 8
                        },
                        border: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#86868B",
                            font: {
                                size: 11,
                                family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            },
                            maxTicksLimit: 10,
                            padding: 8
                        },
                        border: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 5,
                        borderWidth: 2
                    },
                    line: {
                        borderWidth: 2
                    }
                }
            }
        });
    }

    /**
     * 更新图表
     * @param {Object} checkins - 打卡记录
     * @param {Array} habits - 习惯列表
     */
    updateChart(checkins, habits) {
        this.renderChart(checkins, habits);
    }
}
