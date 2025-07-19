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
        if (chartData.length === 0) {
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
     * @returns {Array} 图表数据
     */
    _prepareChartData(checkins, habits) {
        const dates = Object.keys(checkins).sort();
        const recentDates = dates.slice(-CHART_CONFIG.DAYS_TO_SHOW);

        return recentDates.map(date => {
            const dailyScore = habits.reduce((sum, habit) => {
                return sum + (checkins[date][habit.id] || 0);
            }, 0);
            const dailyAvgScore = habits.length > 0 ? dailyScore / habits.length : 0;
            
            return {
                date: date,
                score: dailyAvgScore
            };
        }).filter(item => item.score > 0); // 只显示有分数的数据
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
     * @param {Array} chartData - 图表数据
     */
    _createChart(chartData) {
        // 恢复canvas元素
        const chartContainer = document.querySelector(".chart-container");
        chartContainer.innerHTML = "<canvas id=\"effortChart\"></canvas>";
        const ctx = document.getElementById("effortChart").getContext("2d");

        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: chartData.map(item => {
                    const date = new Date(item.date);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }),
                datasets: [{
                    label: "每日平均分",
                    data: chartData.map(item => item.score),
                    borderColor: "rgb(102, 126, 234)",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "rgb(102, 126, 234)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHitRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "rgb(102, 126, 234)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `日期: ${context[0].label}`;
                            },
                            label: function(context) {
                                return `平均分: ${context.parsed.y.toFixed(1)}分`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: CHART_CONFIG.MAX_SCORE,
                        grid: {
                            color: "rgba(0, 0, 0, 0.1)"
                        },
                        ticks: {
                            color: "#666",
                            font: {
                                size: 12
                            },
                            stepSize: CHART_CONFIG.STEP_SIZE
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#666",
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 10
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                elements: {
                    point: {
                        radius: chartData.length === 1 ? 8 : 6
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
