# TriPuzzle_Backend

## Project Setup

1. 透過mysql建立一個空db

2. 安裝套件
```sh
npm install
```

3. db資料遷移
```sh
npx prisma migrate dev --name update-schema
```
4. 建立.env檔
```
DATABASE_URL=YOUR_MY_SQL_DATABASE_URL
GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_REDIRECT_URI=
JWT_SECRET=

```

6. 
```sh
npm run dev
```
