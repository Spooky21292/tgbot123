# FinUm — деплой на VDS (Ubuntu 24.04) + домен + SSL

Ниже пошаговая инструкция под ваш сервер из скрина (`176.12.66.24`, Ubuntu 24.04).

## 1) Подготовка домена

В DNS-панели регистратора домена добавьте:

- `A` запись: `@` -> `176.12.66.24`
- `A` запись: `www` -> `176.12.66.24`

Проверка (локально):

```bash
nslookup YOUR_DOMAIN
```

Должен вернуться IP вашего VDS.

---

## 2) Подключение к серверу

```bash
ssh root@176.12.66.24
```

Создайте пользователя для деплоя (если нужно):

```bash
adduser deploy
usermod -aG sudo deploy
```

Дальше можно работать от `deploy`.

---

## 3) Установка системных пакетов

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl ufw
```

Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 4) Клонирование проекта

```bash
sudo mkdir -p /var/www/finum/current
sudo mkdir -p /var/www/finum/shared
sudo chown -R $USER:$USER /var/www/finum

cd /var/www/finum/current
git clone <YOUR_GIT_REPO_URL> .
```

---

## 5) Production env

Скопируйте пример и заполните значения:

```bash
cp .env.production.example /var/www/finum/shared/.env
nano /var/www/finum/shared/.env
```

Минимум проверьте:

- `NEXTAUTH_URL=https://YOUR_DOMAIN`
- `NEXTAUTH_SECRET` (длинная случайная строка)
- `DATABASE_URL=file:/var/www/finum/shared/dev.db`
- `FKWALLET_*` переменные заполнены только по официальной документации FKWALLET (endpoint/create webhook/signature).

---

## 6) Первый запуск приложения

```bash
cd /var/www/finum/current
export $(grep -v '^#' /var/www/finum/shared/.env | xargs)
npm ci
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

---

## 7) Systemd сервис

```bash
sudo cp deploy/systemd/finum.service /etc/systemd/system/finum.service
sudo systemctl daemon-reload
sudo systemctl enable finum
sudo systemctl start finum
sudo systemctl status finum --no-pager
```

Логи:

```bash
journalctl -u finum -f
```

---

## 8) Nginx reverse proxy

```bash
sudo cp deploy/nginx/finum.conf /etc/nginx/sites-available/finum
sudo nano /etc/nginx/sites-available/finum
```

Замените `YOUR_DOMAIN` на ваш домен.

Включаем сайт:

```bash
sudo ln -s /etc/nginx/sites-available/finum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9) SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Проверка автопродления:

```bash
sudo certbot renew --dry-run
```

---

## 10) Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 11) Обновление сайта после изменений

```bash
cd /var/www/finum/current
git pull
bash deploy/scripts/deploy.sh
```

---

## 12) Быстрый чек, если сайт не открывается

1. Проверить процесс приложения:
   ```bash
   systemctl status finum
   ```
2. Проверить логи:
   ```bash
   journalctl -u finum -n 200 --no-pager
   ```
3. Проверить nginx:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx --no-pager
   ```
4. Проверить DNS:
   ```bash
   nslookup YOUR_DOMAIN
   ```

---

## Примечания по продакшену

- Для SQLite обязательно храните БД в `/var/www/finum/shared/dev.db`, чтобы она не терялась при `git pull`.
- Для более серьёзной нагрузки рекомендуется PostgreSQL.
- `next.config.mjs` уже содержит `typescript.ignoreBuildErrors`, но лучше постепенно убрать `any` и сделать строгую типизацию.
