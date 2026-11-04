# Дерево компонентов (план до реализации)

StrictMode → ThemeProvider → TodoProvider → RouterProvider → Layout.

| Компонент | Props | Локальное состояние | Контекст |
|---|---|---|---|
| Layout | — | открытие мобильного меню | тема, данные |
| Sidebar | onNavigate | — | данные |
| TextForm | label, onSubmit, initial | текст, ошибка | — |
| ListPage | listId | запрос поиска, диалог | данные |
| TaskItem | task, search | — | данные |
| TaskCard | — | — | данные |
| TaskEditor | task | поля формы, ошибка | данные |
| SubtaskList | task | — | данные |
| ConfirmDialog | title, onConfirm, onClose | — | — |
| ThemeToggle | — | — | тема |
| HomePage / NotFoundPage | — | — | данные / — |

ListPage содержит форму задачи, фильтры, поиск, TaskItem и Outlet → TaskCard → TaskEditor + SubtaskList.
Счётчики, прогресс и отфильтрованные массивы вычисляются при рендере.
