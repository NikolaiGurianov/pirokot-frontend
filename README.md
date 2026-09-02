# Pirokot Frontend

Отдельный frontend интернет-магазина «Пирокот». Каталог и карточка товара получают данные из Java backend по числовым ID.

## Требования

- Node.js 22.13 или новее;
- запущенный backend из соседнего проекта `pyrotechnics-shop`;
- JDK 25 для backend.

## Локальный запуск

В первом терминале запустите backend:

```bash
cd /Users/Nikolai/semargl/pyrotechnics-shop
./gradlew :pirkot-app:bootRun
```

Во втором терминале запустите frontend:

```bash
cd /Users/Nikolai/semargl/pirokot-frontend
cp .env.example .env.local
npm install
npm run dev
```

Откройте `http://localhost:3000` или `http://localhost:3000/products`. Карточка товара доступна по адресу `/products/{id}`, где число — ID опубликованного товара.

Если backend работает на другом адресе, измените `NEXT_PUBLIC_API_URL` в `.env.local`.

## Проверка production-сборки

```bash
npm run build
```
