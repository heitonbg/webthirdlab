# Компоненты

```text
Layout
├─ Sidebar — списки и форма создания
└─ Outlet
   ├─ HomePage — создание первого списка
   ├─ ListPage — задачи, поиск и фильтры
   │  ├─ AddTaskForm
   │  ├─ TaskItem
   │  └─ TaskCard
   │     ├─ TaskEditor
   │     └─ SubtaskList → SubtaskItem
   └─ NotFoundPage
```

`TextForm` используется для списков и подзадач, `ConfirmDialog` — для подтверждения удаления.

Общие данные находятся в `TodoProvider` и меняются через `todoReducer`. Тема хранится в `ThemeProvider`. Поля форм, поиск и открытие меню — локальное состояние компонентов.

Основные props: `ListPage(listId)`, `TaskItem(task, search, onDelete)`, `TaskEditor(task)`, `SubtaskList(task)`. Формы получают обработчик сохранения.

`useDebounce` задерживает поиск на 300 мс, `useLocalStorage` сохраняет тему. Счётчики, результаты поиска и прогресс вычисляются из данных.
