const { createApp } = Vue;

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
                    returnReason: null,
                    status: null,
                    checklist: []
                }
            ],
            returnModal: {
                show: false,
                card: null
            },
            searchQuery: ''
        };
    },
    computed: {
        filteredCards() {
            if (!this.searchQuery.trim()) return this.cards;
            const q = this.searchQuery.trim().toLowerCase();
            return this.cards.filter(c => c.title.toLowerCase().includes(q));
        }
    },
    watch: {
        cards: {
            handler() {
                localStorage.setItem('kanban-cards', JSON.stringify(this.cards));
            },
            deep: true
        }
    },
    mounted() {
        const saved = localStorage.getItem('kanban-cards');
        if (saved) {
            // При загрузке из localStorage добавляем поле checklist, если его нет
            this.cards = JSON.parse(saved).map(card => ({
                ...card,
                checklist: card.checklist || []   // <-- добавляем пустой массив, если отсутствует
            }));
        }
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
                returnReason: null,
                status: null,
                checklist: []
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

            if (targetCol === 4 && !this.isChecklistComplete(card)) {
                alert('Сначала выполните все пункты чек-листа');
                return;
            }

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
        },

        addChecklistItem(card) {
            if (card.checklist.length >= 3) return;
            const newItem = {
                id: Date.now() + Math.random(),
                text: '',
                completed: false
            };
            card.checklist.push(newItem);
            this.updateTimestamp(card);
        },

        updateChecklistItemText(card, itemId, newText) {
            const item = card.checklist.find(i => i.id === itemId);
            if (item) {
                item.text = newText;
                this.updateTimestamp(card);
            }
        },

        isChecklistComplete(card) {
            return !card.checklist || card.checklist.length === 0 || card.checklist.every(item => item.completed);
        },

        toggleChecklistItem(card, itemId) {
            const item = card.checklist.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                this.updateTimestamp(card);
            }
        },


        removeChecklistItem(card, itemId) {
            card.checklist = card.checklist.filter(item => item.id !== itemId);
            this.updateTimestamp(card);
        },

    },
    template: `
        <div>
            <h1>Kanban доска</h1>
            <input v-model="searchQuery" class="search-input" placeholder="Поиск по заголовку..." />
            <div class="board">
                <div v-for="col in columns" :key="col.id" class="column">
                    <h2>{{ col.title }}</h2>
                    <div v-for="card in filteredCards.filter(c => c.col === col.id)" :key="card.id" class="card" :class="card.status || ''">
                        <input v-model="card.title" @blur="updateTimestamp(card)" placeholder="Заголовок" />
                        <textarea v-model="card.description" @blur="updateTimestamp(card)" placeholder="Описание"></textarea>
                        <label>Дедлайн</label>
                        <input type="date" v-model="card.deadline" @blur="updateTimestamp(card)" />
                        <div class="checklist">
                            <div v-for="item in card.checklist" :key="item.id" class="checklist-item">
                                    <input
                                        type="checkbox"
                                        :checked="item.completed"
                                        @change="toggleChecklistItem(card, item.id)"
                                    />
                                    <input
                                            type="text"
                                            :value="item.text"
                                            @blur="e => updateChecklistItemText(card, item.id, e.target.value)"
                                            placeholder="Действие"
                                    />
                                    <button @click="removeChecklistItem(card, item.id)" class="small danger" title="Удалить пункт">✕</button>
                                    </div>
                                    <button
                                            v-if="card.checklist.length < 3"
                                            @click="addChecklistItem(card)"
                                            class="small primary"
                                    >
                                        + Добавить пункт
                                    </button>
                                </div>
                            </div>
                        <div class="card-meta">
                            <div>Создано: {{ formatDate(card.createdAt) }}</div>
                            <div>Изменено: {{ formatDate(card.updatedAt) }}</div>
                            <div v-if="card.returnReason" style="color:#bf2600;">Возврат: {{ card.returnReason }}</div>
                            <div v-if="card.col === 4">
                                Статус: <strong>{{ card.status === 'overdue' ? 'Просрочена' : 'Выполнена в срок' }}</strong>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button v-if="card.col === 1" @click="moveCard(card, 2)" class="primary">→ В работу</button>
                            <button v-if="card.col === 2" @click="moveCard(card, 3)" class="primary">→ Тестирование</button>
                            <button v-if="card.col === 3" @click="moveCard(card, 4)" class="primary" :disabled="!isChecklistComplete(card)">✓ Выполнено</button>
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