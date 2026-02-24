const { createApp } = Vue;

// Компонент модального окна
const ReturnModal = {
    props: ['show', 'card'],
    emits: ['close', 'confirm'],
    template: `
        <div v-if="show" class="modal-overlay" @click.self="close">
            <div class="modal">
                <h3>Укажите причину возврата</h3>
                <input v-model="reason" placeholder="Причина" @keyup.enter="confirm" />
                <div class="modal-actions">
                    <button @click="close">Отмена</button>
                    <button class="primary" @click="confirm" :disabled="!reason.trim()">Вернуть</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return { reason: '' };
    },
    methods: {
        close() {
            this.reason = '';
            this.$emit('close');
        },
        confirm() {
            if (this.reason.trim()) {
                this.$emit('confirm', this.reason.trim());
                this.reason = '';
            }
        }
    }
};

const app = createApp({
    components: { ReturnModal },
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
                    col: 1,
                    returnReason: null
                }
            ],
            returnModal: {
                show: false,
                card: null
            }
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
                col: 1,
                returnReason: null
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
            if (targetCol === 4) {
                const today = new Date().toISOString().slice(0,10);
                card.status = card.deadline < today ? 'overdue' : 'ontime';
            }
            card.col = targetCol;
            this.updateTimestamp(card);
        },
        deleteCard(card) {
            if (card.col === 1) {
                this.cards = this.cards.filter(c => c.id !== card.id);
            }
        },
        openReturnModal(card) {
            this.returnModal.card = card;
            this.returnModal.show = true;
        },
        returnToWork(reason) {
            if (this.returnModal.card) {
                const card = this.returnModal.card;
                card.col = 2;
                card.returnReason = reason;
                this.updateTimestamp(card);
            }
            this.returnModal.show = false;
            this.returnModal.card = null;
        }
    },
    template: `
        <div>
            <h1>📋 Kanban доска</h1>
            <div class="board">
                <div v-for="col in columns" :key="col.id" class="column">
                    <h2>{{ col.title }}</h2>
                    <div v-for="card in cards.filter(c => c.col === col.id)" :key="card.id" class="card" :class="card.status || ''">
                        <input v-model="card.title" @blur="updateTimestamp(card)" placeholder="Заголовок" />
                        <textarea v-model="card.description" @blur="updateTimestamp(card)" placeholder="Описание"></textarea>
                        <label>Дедлайн</label>
                        <input type="date" v-model="card.deadline" @blur="updateTimestamp(card)" />
                        <div class="card-meta">
                            <div>Создано: {{ formatDate(card.createdAt) }}</div>
                            <div>Изменено: {{ formatDate(card.updatedAt) }}</div>
                            <div v-if="card.returnReason" style="color:#bf2600;">Возврат: {{ card.returnReason }}</div>
                            <div v-if="card.col === 4" class="card-meta">
                                Статус: <strong>{{ card.status === 'overdue' ? 'Просрочена' : 'Выполнена в срок' }}</strong>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button v-if="card.col === 1" @click="moveCard(card, 2)" class="primary">→ В работу</button>
                            <button v-if="card.col === 2" @click="moveCard(card, 3)" class="primary">→ Тестирование</button>
                            <button v-if="card.col === 3" @click="moveCard(card, 4)" class="primary">✓ Выполнено</button>
                            <button v-if="card.col === 3" @click="openReturnModal(card)">↩ Вернуть в работу</button>
                            <button v-if="card.col === 1" @click="deleteCard(card)" class="danger">Удалить</button>
                            
                        </div>
                    </div>
                    <button v-if="col.id === 1" @click="createCard" class="primary" style="width:100%;">
                        + Создать карточку
                    </button>
                </div>
            </div>
            <return-modal
                :show="returnModal.show"
                :card="returnModal.card"
                @close="returnModal.show = false"
                @confirm="returnToWork"
            />
        </div>
    `
});

app.mount('#app');