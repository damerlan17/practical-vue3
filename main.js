const {createApp} = Vue;

const app = createApp({
    data() {
        return {
            columns: [
                {id: 1, title: 'Запланированные'},
                {id: 2, title: '️В работе'},
                {id: 3, title: 'Тестирование'},
                {id: 4, title: 'Выполненные'}
            ]
        };
    },
    template: `
        <div>
            <h1>Kanban доска</h1>
            <div class="board">
                <div v-for="col in columns" :key="col.id" class="column">
                    <h2>{{ col.title }}</h2>
                </div>
            </div>
        </div>
    `
});

app.mount('#app');