import { test, expect } from '@playwright/test';

async function createList(page, title = 'Учёба') {
  await page.goto('/');
  await page.getByLabel('Как назовём список?').fill(title);
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}
async function addTask(page, title) {
  await page.getByLabel('Новая задача', { exact: true }).fill(title);
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();
}

test('Основной сценарий управляется клавиатурой, фокус остаётся видимым', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Как назовём список?').focus();
  await page.keyboard.type('Учёба'); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Переименовать', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  await expect(page.getByLabel('Новая задача', { exact: true })).toBeFocused();
  await page.keyboard.type('Первая задача'); await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Открыть задачу: Первая задача', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Первая задача', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('checkbox', { name: 'Задача выполнена', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('checkbox', { name: 'Задача выполнена', exact: true })).toBeChecked();
  await page.getByLabel('Новая подзадача', { exact: true }).focus();
  await page.keyboard.type('Шаг'); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Редактировать подзадачу: Шаг', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Название подзадачи', { exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Редактировать подзадачу: Шаг', exact: true })).toBeFocused();
  const outline = await page.getByRole('button', { name: 'Редактировать подзадачу: Шаг', exact: true }).evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThan(0);
});

test('Задержка поиска составляет 300 мс после последнего ввода', async ({ page }) => {
  await createList(page);
  await addTask(page, 'Отчёт'); await addTask(page, 'Книга');
  const start = new Date('2026-11-04T07:00:00Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.getByLabel('Поиск по названию в текущем списке').fill('От');
  await page.clock.runFor(200);
  await page.getByLabel('Поиск по названию в текущем списке').fill('Отч');
  await page.clock.runFor(299);
  expect(await page.locator('.task-list > li').count()).toBe(2);
  await page.clock.runFor(1);
  await expect(page.locator('.task-list > li')).toHaveCount(1);
});

test('Контраст текста обеих тем и мобильная карточка', async ({ page }) => {
  await createList(page);
  await addTask(page, 'Подготовить лабораторную работу');
  await addTask(page, 'Повторить React и маршрутизацию');
  await addTask(page, 'Прочитать методичку');
  await page.getByLabel('Выполнено: Прочитать методичку', { exact: true }).check();
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: /Включить .* тему/ }).click();
    const ratios = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const luminance = (hex) => {
        const values = hex.trim().slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
      };
      const contrast = (a, b) => { const x = luminance(style.getPropertyValue(a)); const y = luminance(style.getPropertyValue(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      return ['--bg', '--surface', '--surface-alt'].flatMap((background) => ['--text', '--muted', '--accent', '--error'].map((foreground) => ({ foreground, background, ratio: contrast(foreground, background) })));
    });
    for (const combination of ratios) expect(combination.ratio, `${theme}: ${combination.foreground} / ${combination.background}`).toBeGreaterThanOrEqual(4.5);
  }
  await page.getByRole('link', { name: 'Открыть задачу: Подготовить лабораторную работу', exact: true }).click();
  for (const title of ['Составить план', 'Написать код', 'Проверить результат']) {
    await page.getByLabel('Новая подзадача', { exact: true }).fill(title);
    await page.locator('.subtasks').getByRole('button', { name: '+', exact: true }).click();
  }
  await page.getByLabel('Составить план', { exact: true }).check();
  await expect(page.getByText('Выполнено 1 из 3', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 900 });
  await expect(page.getByLabel('Название задачи', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Закрыть карточку', exact: true }).click();
  await page.getByRole('button', { name: 'Списки', exact: true }).click();
  await expect(page.locator('#sidebar')).toBeVisible();
});

test('Списки, изоляция задач, переименование, удаление с Escape и подтверждением', async ({ page }) => {
  await createList(page);
  await addTask(page, 'Отчёт');
  const study = page.url();
  await page.getByLabel('Новый список', { exact: true }).fill('Работа');
  await page.locator('.sidebar').getByRole('button', { name: '+', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Работа', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Отчёт' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Переименовать', exact: true }).click();
  await page.getByLabel('Название списка', { exact: true }).fill('Проект');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Проект', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Списки задач', exact: true }).getByRole('link', { name: /^Учёба/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Учёба', exact: true })).toBeFocused();
  await page.getByRole('navigation', { name: 'Списки задач', exact: true }).getByRole('link', { name: /^Проект/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Проект', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Удалить список', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Удалить список', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Удалить список', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page).toHaveURL(study);
  await expect(page.getByRole('link', { name: 'Открыть задачу: Отчёт' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('Карточка, все операции с подзадачами, прогресс, фильтр и прямой адрес', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await createList(page);
  await addTask(page, 'Лабораторная');
  await page.getByRole('button', { name: 'Активные', exact: true }).click();
  await page.getByRole('link', { name: 'Открыть задачу: Лабораторная' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Лабораторная', exact: true })).toBeFocused();
  await page.getByLabel('Новая подзадача', { exact: true }).fill('   ');
  await page.locator('.subtasks').getByRole('button', { name: '+', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Введите текст');
  for (const title of ['План', 'Код', 'Проверка']) {
    await page.getByLabel('Новая подзадача', { exact: true }).fill(title);
    await page.locator('.subtasks').getByRole('button', { name: '+', exact: true }).click();
  }
  await page.getByLabel('План', { exact: true }).check();
  await page.getByLabel('Код', { exact: true }).check();
  await expect(page.getByText('Выполнено 2 из 3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Редактировать подзадачу: Проверка', exact: true }).click();
  await page.getByLabel('Название подзадачи', { exact: true }).fill('Тесты');
  await page.locator('.subtask-editor').getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByLabel('Тесты', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Удалить подзадачу: Тесты', exact: true }).click();
  await expect(page.getByText('Выполнено 2 из 2', { exact: true })).toBeVisible();
  await page.getByLabel('Название задачи', { exact: true }).fill('');
  await page.getByRole('region', { name: 'Карточка задачи', exact: true }).getByLabel('Описание', { exact: true }).focus();
  await expect(page.getByRole('alert')).toContainText('Название не может быть пустым');
  await page.getByLabel('Название задачи', { exact: true }).fill('Лабораторная 3');
  await page.getByRole('region', { name: 'Карточка задачи', exact: true }).getByLabel('Описание', { exact: true }).fill('<b>Описание как текст</b>');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  const direct = page.url();
  expect(direct).toContain('filter=active');
  await page.reload();
  await expect(page).toHaveURL(direct);
  await expect(page.getByLabel('Название задачи', { exact: true })).toHaveValue('Лабораторная 3');
  await expect(page.getByRole('region', { name: 'Карточка задачи', exact: true }).getByLabel('Описание', { exact: true })).toHaveValue('<b>Описание как текст</b>');
  await expect(page.getByText('Выполнено 2 из 2', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Закрыть карточку', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Лабораторная 3' })).toBeFocused();
  await expect(page.getByLabel('Подзадачи: выполнено 2 из 2')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Поиск с задержкой, фильтры, назад/вперёд и сброс поиска при смене списка', async ({ page }) => {
  await createList(page);
  await addTask(page, 'Отчёт'); await addTask(page, 'Купить книгу');
  await page.getByLabel('Выполнено: Купить книгу', { exact: true }).check();
  await page.getByRole('button', { name: 'Активные', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Купить книгу' })).toHaveCount(0);
  await page.getByLabel('Поиск по названию в текущем списке').fill('ОТЧ');
  await expect(page.getByRole('link', { name: 'Открыть задачу: Отчёт' })).toBeVisible();
  await page.getByLabel('Поиск по названию в текущем списке').fill('нет совпадений');
  await expect(page.getByRole('heading', { name: 'Ничего не нашлось' })).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить поиск' }).click();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Отчёт' })).toBeVisible();
  await page.getByRole('button', { name: 'Выполненные', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Купить книгу' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Активные', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page.getByRole('button', { name: 'Выполненные', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Поиск по названию в текущем списке').fill('текст');
  await page.getByLabel('Новый список', { exact: true }).fill('Другой');
  await page.locator('.sidebar').getByRole('button', { name: '+', exact: true }).click();
  await expect(page.getByLabel('Поиск по названию в текущем списке')).toHaveValue('');
});

test('Пустой ввод, безопасный текст, удаление и очистка с сохранением', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Как назовём список?').fill('   ');
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Как назовём список?').fill('Дела');
  await page.getByRole('button', { name: 'Создать', exact: true }).click();
  await addTask(page, '   ');
  await expect(page.getByRole('alert')).toHaveText('Введите название задачи.');
  const title = '<img src=x onerror=alert(1)>';
  await addTask(page, title);
  await expect(page.getByRole('link', { name: `Открыть задачу: ${title}`, exact: true })).toHaveText(title);
  await expect(page.locator('.task img')).toHaveCount(0);
  await addTask(page, 'Удалить');
  await page.getByRole('button', { name: 'Удалить: Удалить', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page.getByRole('link', { name: `Открыть задачу: ${title}`, exact: true })).toBeFocused();
  await page.getByLabel(`Выполнено: ${title}`, { exact: true }).check();
  await page.getByRole('button', { name: 'Очистить выполненные' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Чистый лист', exact: true })).toBeVisible();
});

test('Тема определяется системой, сохраняется и применяется до React', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Включить светлую тему', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.route(/\/(?:src\/main\.jsx|assets\/.*\.js)(?:\?|$)/, (route) => route.abort());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#root')).toBeEmpty();
});

test('Удаление из карточки возвращает в список, удаление последнего списка — к началу', async ({ page }) => {
  await createList(page);
  await addTask(page, 'Удаляемая задача');
  await page.getByRole('link', { name: 'Открыть задачу: Удаляемая задача', exact: true }).click();
  await page.getByRole('button', { name: 'Удалить задачу', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page.getByLabel('Новая задача', { exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Чистый лист', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Удалить список', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByLabel('Как назовём список?')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Как назовём список?')).toBeVisible();
});

test('Миграция Л2, повреждённое хранилище и страницы 404', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.setItem('todo-app:v1', JSON.stringify({ tasks: [{ title: 'Старая задача', body: 'Из Л2', done: false, time: '09:30' }] })); localStorage.removeItem('todo-app:v2'); });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Входящие', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Открыть задачу: Старая задача' })).toBeVisible();
  await page.goto('/lists/inbox/tasks/missing?filter=active');
  await expect(page.getByRole('heading', { name: 'Задача не найдена', exact: true })).toBeVisible();
  await page.goto('/lists/missing');
  await expect(page.getByRole('heading', { name: 'Список не найден', exact: true })).toBeVisible();
  await page.goto('/abc');
  await expect(page.getByRole('heading', { name: 'Страница не найдена', exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('todo-app:v2', 'invalid'));
  await page.goto('/');
  await expect(page.getByLabel('Как назовём список?')).toBeVisible();
});

for (const width of [360, 768, 1280]) {
  test(`Адаптив ${width}px: список и карточка без горизонтальной прокрутки`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await createList(page, 'Очень длинное название списка для проверки переноса');
    await addTask(page, 'Длинная задача ' + 'а'.repeat(100));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 360) { await page.getByRole('button', { name: 'Списки', exact: true }).click(); await expect(page.locator('#sidebar')).toBeVisible(); await page.keyboard.press('Tab'); await page.keyboard.press('Escape'); await expect(page.locator('#sidebar')).toBeHidden(); await expect(page.getByRole('button', { name: 'Списки', exact: true })).toBeFocused(); }
    await page.getByRole('link', { name: /^Открыть задачу:/ }).click();
    await expect(page.getByLabel('Название задачи', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
