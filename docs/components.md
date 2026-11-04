# Дерево компонентов

Первоначальный план сохранён в `ec99b7e`, до исходного кода. Ниже — актуальная структура.

StrictMode → ThemeProvider → TodoProvider → RouterProvider → Layout.

| Компонент | Props | Локальное состояние | Контекст |
|---|---|---|---|
| Layout | — | открытие мобильного меню | тема |
| Sidebar | onNavigate | — | данные |
| TextForm | label, onSubmit, initial, button, placeholder, inputId, maxLength, autoFocus | текст, ошибка; ref ввода | — |
| ListPage | listId | запрос поиска, переименование, подтверждение удаления | данные |
| AddTaskForm | onAdd | название, описание, время, ошибка; ref ввода | — |
| TaskItem | task, search, onDelete | — | данные |
| TaskCard | — (listId/taskId из маршрута) | подтверждение удаления | данные |
| TaskEditor | task | поля формы, ошибка, сообщение; ref названия | данные |
| SubtaskList | task | — | данные |
| SubtaskItem | subtask, taskId, onRemove | режим редактирования | данные |
| ConfirmDialog | title, children, onConfirm, onClose | инициатор фокуса; ref dialog | — |
| HomePage / NotFoundPage | — | — | данные / — |

```text
StrictMode
└─ ThemeProvider
   └─ TodoProvider
      └─ RouterProvider
         └─ Layout (переключатель темы встроен в шапку)
            ├─ Sidebar
            │  ├─ NavLink[]
            │  └─ TextForm (новый список)
            └─ Outlet
               ├─ HomePage → TextForm / Navigate
               ├─ ListRoute → ListPage (key=listId)
               │  ├─ TextForm (переименование)
               │  ├─ AddTaskForm
               │  ├─ Поиск / фильтры
               │  ├─ TaskItem[]
               │  ├─ ConfirmDialog (условно)
               │  └─ Outlet → TaskCard
               │     ├─ TaskEditor (key=task.id)
               │     ├─ SubtaskList
               │     │  ├─ SubtaskItem[] → TextForm (условно)
               │     │  └─ TextForm (новая подзадача)
               │     └─ ConfirmDialog (условно)
               └─ NotFoundPage
```

ThemeProvider хранит тему через useLocalStorage. TodoProvider хранит данные через useReducer и сохраняет их эффектом. React-контексты и потребляющие хуки вынесены в отдельные модули, чтобы компоненты поддерживали Fast Refresh.

Счётчики, прогресс и отфильтрованные массивы вычисляются при рендере.
