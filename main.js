const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            columns: [
                { id: 1, title: '📌 Запланированные' },
                { id: 2, title: '⚙️ В работе' },
                { id: 3, title: '🧪 Тестирование' },
                { id: 4, title: '✅ Выполненные' }
            ],
            cards: [
                // Для теста добавим одну карточку
                { id: 1, title: 'Пример задачи', col: 1 }
            ]
        };
    },
    methods: {
        createCard() {
            const newCard = {
                id: Date.now(),
                title: 'Новая задача',
                col: 1
            };
            this.cards.push(newCard);
        }
    },
    template: `
        <div>
            <h1>📋 Kanban доска</h1>
            <div class="board">
                <div v-for="col in columns" :key="col.id" class="column">
                    <h2>{{ col.title }}</h2>
                    <div v-for="card in cards.filter(c => c.col === col.id)" :key="card.id" class="card">
                        {{ card.title }}
                    </div>
                    <button v-if="col.id === 1" @click="createCard" class="primary" style="width:100%;">
                        + Создать карточку
                    </button>
                </div>
            </div>
        </div>
    `
});

app.mount('#app');