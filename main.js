const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            columns: [
                { id: 1, title: 'Запланированные' },
                { id: 2, title: 'В работе' },
                { id: 3, title: 'Тестирование' },
                { id: 4, title: 'Выполненные' }
            ],
            cards: [
                {
                    id: 1,
                    title: 'Пример задачи',
                    description: 'Описание',
                    deadline: '2026-03-01',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    col: 1
                }
            ]
        };
    },
    methods: {
        createCard() {
            const now = new Date().toISOString();
            const newCard = {
                id: Date.now(),
                title: 'Новая задача',
                description: '',
                deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10),
                createdAt: now,
                updatedAt: now,
                col: 1
            };
            this.cards.push(newCard);
        },
        updateTimestamp(card) {
            card.updatedAt = new Date().toISOString();
        },
        formatDate(iso) {
            if (!iso) return '—';
            return new Date(iso).toLocaleString();
        },

        moveCard(card, targetCol) {
            card.col = targetCol;
            this.updateTimestamp(card);
        },

        deleteCard(card) {
            if (card.col === 1) {
                this.cards = this.cards.filter(c => c.id !== card.id);
            }
        }
    },
    template: `
        <div>
            <h1>Kanban доска</h1>
            <div class="board">
                <div v-for="col in columns" :key="col.id" class="column">
                    <h2>{{ col.title }}</h2>
                    <div v-for="card in cards.filter(c => c.col === col.id)" :key="card.id" class="card">
                        <input v-model="card.title" @blur="updateTimestamp(card)" placeholder="Заголовок" />
                        <textarea v-model="card.description" @blur="updateTimestamp(card)" placeholder="Описание"></textarea>
                        <label>Дедлайн</label>
                        <input type="date" v-model="card.deadline" @blur="updateTimestamp(card)" />
                        <div class="card-meta">
                            <div>Создано: {{ formatDate(card.createdAt) }}</div>
                            <div>Изменено: {{ formatDate(card.updatedAt) }}</div>
                        </div>
                        <div class="card-actions">
                            <button v-if="card.col === 1" @click="moveCard(card, 2)" class="primary">В работу</button>
                            <button v-if="card.col === 2" @click="moveCard(card, 3)" class="primary">Тестирование</button>
                            <button v-if="card.col === 3" @click="moveCard(card, 4)" class="primary">Выполнено</button>
                            <button v-if="card.col === 1" @click="deleteCard(card)" class="danger">Удалить</button>
                        </div>
                    </div>
                    
                    <button v-if="col.id === 1" @click="createCard" class="primary" style="width:100%;">+ Создать карточку</button>
                    
                </div>
            </div>
        </div>
    `
});

app.mount('#app');