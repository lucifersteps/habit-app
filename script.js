// 应用状态管理
class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.checkins = JSON.parse(localStorage.getItem('checkins')) || {};
        this.currentDate = new Date().toISOString().split('T')[0];
        this.currentWeekStart = this.getWeekStart(new Date());
        this.selectedScore = null;
        this.selectedHabitId = null;
        this.selectedDate = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.renderWeekView();
        this.updateStats();
        this.renderChart();
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一为第一天
        return new Date(d.setDate(diff));
    }

    getWeekDates(weekStart) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    navigateWeek(direction) {
        const newWeekStart = new Date(this.currentWeekStart);
        newWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
        this.currentWeekStart = newWeekStart;
        this.renderWeekView();
    }

    renderWeekView() {
        const weekDates = this.getWeekDates(this.currentWeekStart);
        const weekViewTable = document.getElementById('weekViewTable');
        const currentWeekDisplay = document.getElementById('currentWeekDisplay');

        // 更新周显示
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(this.currentWeekStart.getDate() + 6);
        currentWeekDisplay.textContent = `${this.currentWeekStart.getMonth() + 1}/${this.currentWeekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

        // 如果没有习惯，显示空状态
        if (this.habits.length === 0) {
            weekViewTable.innerHTML = `
                <div class="empty-state">
                    <h3>还没有添加习惯</h3>
                    <p>点击"添加习惯"按钮开始创建你的第一个习惯吧！</p>
                </div>
            `;
            return;
        }

        // 生成表头
        let tableHTML = `
            <table class="week-view-table">
                <thead>
                    <tr>
                        <th>习惯</th>
                        ${weekDates.map(date => {
                            const d = new Date(date);
                            const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                            const isToday = date === this.currentDate;
                            return `
                                <th>
                                    <div>${dayNames[d.getDay()]}</div>
                                    <div style="font-size: 12px; color: #6c757d; ${isToday ? 'color: #28a745; font-weight: bold;' : ''}">
                                        ${d.getMonth() + 1}/${d.getDate()}
                                    </div>
                                </th>
                            `;
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        // 生成习惯行
        this.habits.forEach(habit => {
            tableHTML += `
                <tr class="habit-row">
                    <td>
                        <div class="habit-name-cell">
                            <div class="habit-info">
                                <h4>${habit.name}</h4>
                            </div>
                            <div class="habit-actions-small">
                                <button class="btn-small btn-edit-small" data-habit-id="${habit.id}">✏</button>
                                <button class="btn-small btn-delete-small" data-habit-id="${habit.id}">×</button>
                            </div>
                        </div>
                    </td>
                    ${weekDates.map(date => {
                        const score = this.checkins[date]?.[habit.id];
                        const d = new Date(date);
                        const today = new Date(this.currentDate);
                        const isToday = date === this.currentDate;
                        const isPast = d < today;
                        const isFuture = d > today;

                        let circleClass = 'score-circle';
                        let circleContent = '';
                        let circleTitle = '';

                        if (score !== undefined && score !== null) {
                            if (score === 0) {
                                circleClass += ' score-0';
                                circleContent = '😢';
                                circleTitle = '放弃 - 完全没有努力';
                            } else if (score === 3) {
                                circleClass += ' score-3';
                                circleContent = '🙂';
                                circleTitle = '微习惯 - 小小的努力';
                            } else if (score === 7) {
                                circleClass += ' score-7';
                                circleContent = '😊';
                                circleTitle = '合格 - 做得不错';
                            } else if (score === 10) {
                                circleClass += ' score-10';
                                circleContent = '🎉';
                                circleTitle = '卓越 - 凯旋归来';
                            } else {
                                circleClass += ' score-other';
                                circleContent = '🐱';
                                circleTitle = '其他分数';
                            }
                        } else if (isPast) {
                            circleClass += ' missed';
                            circleContent = '🐱';
                            circleTitle = '已过期，未打卡 - 薛定谔的猫';
                        } else if (isFuture) {
                            circleClass += ' future';
                            circleContent = '🌱';
                            circleTitle = '未来日期 - 种子发芽';
                        } else {
                            circleClass += ' score-0';
                            circleContent = '🐱';
                            circleTitle = '未打卡 - 薛定谔的猫';
                        }

                        if (isToday) {
                            circleClass += ' today';
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
                    }).join('')}
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        weekViewTable.innerHTML = tableHTML;
        
        // 添加事件委托监听器
        this.addWeekViewEventListeners();
    }

    addWeekViewEventListeners() {
        const weekViewTable = document.getElementById('weekViewTable');
        
        // 使用事件委托处理所有点击事件
        weekViewTable.addEventListener('click', (e) => {
            // 处理分数圆圈点击
            if (e.target.classList.contains('score-circle')) {
                const habitId = e.target.dataset.habitId;
                const date = e.target.dataset.date;
                this.openScoreModal(habitId, date);
            }
            
            // 处理编辑按钮点击
            if (e.target.classList.contains('btn-edit-small')) {
                const habitId = e.target.dataset.habitId;
                this.editHabit(habitId);
            }
            
            // 处理删除按钮点击
            if (e.target.classList.contains('btn-delete-small')) {
                const habitId = e.target.dataset.habitId;
                this.deleteHabit(habitId);
            }
        });
    }

    setupEventListeners() {
        // 添加习惯按钮
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.showAddHabitModal();
        });

        // 模态框事件
        const modal = document.getElementById('addHabitModal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancelHabitBtn');
        const saveBtn = document.getElementById('saveHabitBtn');

        closeBtn.addEventListener('click', () => this.hideAddHabitModal());
        cancelBtn.addEventListener('click', () => this.hideAddHabitModal());
        saveBtn.addEventListener('click', () => this.saveHabit());

        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddHabitModal();
            }
        });

        // 周导航按钮
        document.getElementById('prevWeekBtn').addEventListener('click', () => {
            this.navigateWeek(-1);
        });
        document.getElementById('nextWeekBtn').addEventListener('click', () => {
            this.navigateWeek(1);
        });

        // 分数选择弹窗事件
        const scoreModal = document.getElementById('scoreModal');
        const cancelScoreBtn = document.getElementById('cancelScoreBtn');
        const saveScoreBtn = document.getElementById('saveScoreBtn');

        cancelScoreBtn.addEventListener('click', () => this.hideScoreModal());
        saveScoreBtn.addEventListener('click', () => this.saveScore());

        scoreModal.addEventListener('click', (e) => {
            if (e.target === scoreModal) {
                this.hideScoreModal();
            }
        });

        // 回车键保存习惯
        document.getElementById('habitName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveHabit();
            }
        });
    }

    updateCurrentDate() {
        // 这个方法现在不需要了，因为我们使用周视图
        // 保留方法以防将来需要
    }

    showAddHabitModal() {
        document.getElementById('addHabitModal').style.display = 'block';
        document.getElementById('habitName').focus();
    }

    hideAddHabitModal() {
        document.getElementById('addHabitModal').style.display = 'none';
        document.getElementById('habitName').value = '';
        document.getElementById('modalTitle').textContent = '添加新习惯';
        this.editingHabitId = null;
    }

    openScoreModal(habitId, date) {
        this.selectedHabitId = habitId;
        this.selectedDate = date;
        this.selectedScore = this.checkins[date]?.[habitId] || null;

        const habit = this.habits.find(h => h.id === habitId);
        const dateObj = new Date(date);
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        document.getElementById('scoreModalTitle').textContent = `${habit.name} - ${dayNames[dateObj.getDay()]} ${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        document.getElementById('scoreModalSubtitle').textContent = '为这个习惯选择努力程度';

        // 生成分数选项
        const scoreGrid = document.getElementById('scoreGrid');
        scoreGrid.innerHTML = `
            <div class="score-option score-0 ${this.selectedScore === 0 ? 'selected' : ''}" data-score="0">
                😢 放弃
            </div>
            <div class="score-option score-3 ${this.selectedScore === 3 ? 'selected' : ''}" data-score="3">
                🙂 微习惯
            </div>
            <div class="score-option score-7 ${this.selectedScore === 7 ? 'selected' : ''}" data-score="7">
                😊 合格
            </div>
            <div class="score-option score-10 ${this.selectedScore === 10 ? 'selected' : ''}" data-score="10">
                🎉 卓越
            </div>
            <div class="score-option score-clear" data-score="clear">
                🗑️ 清除
            </div>
        `;

        document.getElementById('scoreModal').style.display = 'block';
        
        // 添加分数选择事件监听器
        this.addScoreModalEventListeners();
    }

    addScoreModalEventListeners() {
        const scoreGrid = document.getElementById('scoreGrid');
        
        // 使用事件委托处理分数选择
        scoreGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('score-option')) {
                const scoreValue = e.target.dataset.score;
                if (scoreValue === 'clear') {
                    this.selectScoreOption(null, e);
                } else {
                    const score = parseInt(scoreValue);
                    this.selectScoreOption(score, e);
                }
            }
        });
    }

    selectScoreOption(score, event) {
        this.selectedScore = score;
        
        // 更新选中状态
        document.querySelectorAll('.score-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    saveScore() {
        if (this.selectedHabitId && this.selectedDate) {
            if (!this.checkins[this.selectedDate]) {
                this.checkins[this.selectedDate] = {};
            }
            
            if (this.selectedScore === null) {
                // 清除记录
                delete this.checkins[this.selectedDate][this.selectedHabitId];
                this.showNotification('记录已清除！', 'success');
            } else {
                // 保存分数
                this.checkins[this.selectedDate][this.selectedHabitId] = this.selectedScore;
                this.showNotification('分数保存成功！', 'success');
            }
            
            this.saveCheckinsToStorage();
            this.renderWeekView();
            this.updateStats();
            this.renderChart();
        }
        
        this.hideScoreModal();
    }

    hideScoreModal() {
        document.getElementById('scoreModal').style.display = 'none';
        this.selectedScore = null;
        this.selectedHabitId = null;
        this.selectedDate = null;
    }

    saveHabit() {
        const name = document.getElementById('habitName').value.trim();

        if (!name) {
            alert('请输入习惯名称');
            return;
        }

        // 检查是否已存在同名习惯（排除当前编辑的习惯）
        const existingHabit = this.habits.find(habit => 
            habit.name === name && habit.id !== this.editingHabitId
        );
        if (existingHabit) {
            alert('该习惯已存在');
            return;
        }

        if (this.editingHabitId) {
            // 编辑模式
            const habitIndex = this.habits.findIndex(h => h.id === this.editingHabitId);
            if (habitIndex !== -1) {
                this.habits[habitIndex].name = name;
                this.saveHabitsToStorage();
                this.renderWeekView();
                this.hideAddHabitModal();
                this.editingHabitId = null;
                this.showNotification('习惯编辑成功！', 'success');
            }
        } else {
            // 添加模式
            const newHabit = {
                id: Date.now().toString(),
                name: name,
                createdAt: new Date().toISOString()
            };

            this.habits.push(newHabit);
            this.saveHabitsToStorage();
            this.renderWeekView();
            this.hideAddHabitModal();
            this.showNotification('习惯添加成功！', 'success');
        }
    }

    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        // 设置模态框为编辑模式
        document.getElementById('modalTitle').textContent = '编辑习惯';
        document.getElementById('habitName').value = habit.name;
        
        // 存储当前编辑的习惯ID
        this.editingHabitId = habitId;
        
        this.showAddHabitModal();
    }

    deleteHabit(habitId) {
        if (confirm('确定要删除这个习惯吗？删除后相关的打卡记录也会被清除。')) {
            this.habits = this.habits.filter(habit => habit.id !== habitId);
            
            // 删除相关的打卡记录
            Object.keys(this.checkins).forEach(date => {
                if (this.checkins[date] && this.checkins[date][habitId]) {
                    delete this.checkins[date][habitId];
                }
            });

            this.saveHabitsToStorage();
            this.saveCheckinsToStorage();
            this.renderWeekView();
            this.updateStats();
            this.renderChart();

            this.showNotification('习惯删除成功！', 'success');
        }
    }

    // renderHabits方法已移除，因为不再需要单独的习惯列表

    // 这些方法已移除，因为我们现在使用周视图和分数选择弹窗

    updateStats() {
        const todayCheckin = this.checkins[this.currentDate] || {};
        const todayScore = this.habits.reduce((sum, habit) => {
            return sum + (todayCheckin[habit.id] || 0);
        }, 0);
        const todayAvgScore = this.habits.length > 0 ? (todayScore / this.habits.length).toFixed(1) : 0;

        // 计算历史平均分
        const allAvgScores = [];
        Object.keys(this.checkins).forEach(date => {
            const dailyScore = this.habits.reduce((sum, habit) => {
                return sum + (this.checkins[date][habit.id] || 0);
            }, 0);
            if (dailyScore > 0 && this.habits.length > 0) {
                const dailyAvgScore = dailyScore / this.habits.length;
                allAvgScores.push(dailyAvgScore);
            }
        });

        const avgScore = allAvgScores.length > 0 
            ? (allAvgScores.reduce((sum, score) => sum + score, 0) / allAvgScores.length).toFixed(1)
            : 0;

        // 计算连续天数
        const streakDays = this.calculateStreakDays();

        // 更新显示
        document.getElementById('todayScore').textContent = todayScore > 0 ? todayScore : '-';
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('streakDays').textContent = streakDays;
    }

    calculateStreakDays() {
        const dates = Object.keys(this.checkins).sort().reverse();
        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < dates.length; i++) {
            const checkinDate = new Date(dates[i]);
            const dayDiff = Math.floor((currentDate - checkinDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === streak) {
                const dailyScore = this.habits.reduce((sum, habit) => {
                    return sum + (this.checkins[dates[i]][habit.id] || 0);
                }, 0);
                
                if (dailyScore > 0) {
                    streak++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return streak;
    }

    renderChart() {
        const ctx = document.getElementById('effortChart').getContext('2d');
        
        console.log('Rendering chart with checkins:', this.checkins);
        
        // 获取最近30天的数据
        const dates = Object.keys(this.checkins).sort();
        const recentDates = dates.slice(-30);
        
        console.log('Dates:', dates, 'Recent dates:', recentDates);
        
        const chartData = recentDates.map(date => {
            const dailyScore = this.habits.reduce((sum, habit) => {
                return sum + (this.checkins[date][habit.id] || 0);
            }, 0);
            const dailyAvgScore = this.habits.length > 0 ? dailyScore / this.habits.length : 0;
            return {
                date: date,
                score: dailyAvgScore
            };
        }).filter(item => item.score > 0); // 只显示有分数的数据

        console.log('Chart data:', chartData);

        // 销毁现有图表
        if (window.effortChart && typeof window.effortChart.destroy === 'function') {
            window.effortChart.destroy();
        }

        // 如果没有数据，显示空状态
        if (chartData.length === 0) {
            const chartContainer = document.querySelector('.chart-container');
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <h3>还没有打卡记录</h3>
                    <p>完成今日打卡后，这里会显示你的努力趋势图</p>
                </div>
            `;
            return;
        }

        // 恢复canvas元素
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.innerHTML = '<canvas id="effortChart"></canvas>';
        const newCtx = document.getElementById('effortChart').getContext('2d');

        // 创建新图表
        window.effortChart = new Chart(newCtx, {
            type: 'line',
            data: {
                labels: chartData.map(item => {
                    const date = new Date(item.date);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }),
                datasets: [{
                    label: '每日平均分',
                    data: chartData.map(item => item.score),
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(102, 126, 234)',
                    pointBorderColor: '#fff',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgb(102, 126, 234)',
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
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            },
                            stepSize: 2
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 10
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        radius: chartData.length === 1 ? 8 : 6
                    }
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveHabitsToStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    saveCheckinsToStorage() {
        localStorage.setItem('checkins', JSON.stringify(this.checkins));
    }
}

// 初始化应用
window.habitTracker = null;

document.addEventListener('DOMContentLoaded', () => {
    window.habitTracker = new HabitTracker();
});

// 添加一些示例数据（首次使用时）
if (!localStorage.getItem('habits') || JSON.parse(localStorage.getItem('habits')).length === 0) {
    const sampleHabits = [
        {
            id: '1',
            name: '锻炼身体',
            description: '每天进行30分钟以上的运动',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: '学习新知识',
            description: '阅读或学习新技能',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name: '早睡早起',
            description: '保持规律的作息时间',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('habits', JSON.stringify(sampleHabits));
} 