# Маршруты и данные

| URL | Экран |
|---|---|
| / | Первый список или приглашение создать список |
| /lists/:listId | Список |
| /lists/:listId/tasks/:taskId | Вложенная карточка |
| * | Страница не найдена |

`?filter=all|active|done` сохраняется при открытии и закрытии карточки.
Неизвестные идентификаторы обрабатываются отдельно. Поиск сбрасывается при смене listId.

Данные v2: `{ lists: [{ id, title }], tasks: [{ id, listId, title, description, time, done, createdAt, subtasks: [{ id, title, done }] }] }`.
Ключи localStorage: `todo-app:v2`, `todo-app:theme`. Старые задачи переносятся во «Входящие».

Действия: list/added, list/updated, list/removed; task/added, task/updated, task/toggled, task/removed, task/cleared; subtask/added, subtask/updated, subtask/toggled, subtask/removed.
Удаление списка каскадное. Отметка задачи независима от подзадач.
