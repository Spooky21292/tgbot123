# FinSkills Pro — деплой на VDS (Ubuntu 24.04) + домен + SSL

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
sudo mkdir -p /var/www/finskills-pro/current
sudo mkdir -p /var/www/finskills-pro/shared
sudo chown -R $USER:$USER /var/www/finskills-pro

cd /var/www/finskills-pro/current
git clone <YOUR_GIT_REPO_URL> .
```

---

## 5) Production env

Скопируйте пример и заполните значения:

```bash
cp .env.production.example /var/www/finskills-pro/shared/.env
nano /var/www/finskills-pro/shared/.env
```

Минимум проверьте:

- `NEXTAUTH_URL=https://YOUR_DOMAIN`
- `NEXTAUTH_SECRET` (длинная случайная строка)
- `DATABASE_URL=file:/var/www/finskills-pro/shared/dev.db`
- `FKWALLET_*` переменные заполнены только по официальной документации FKWALLET (endpoint/create webhook/signature).

---

## 6) Первый запуск приложения

```bash
cd /var/www/finskills-pro/current
export $(grep -v '^#' /var/www/finskills-pro/shared/.env | xargs)
npm ci
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

---

## 7) Systemd сервис

```bash
sudo cp deploy/systemd/finskills-pro.service /etc/systemd/system/finskills-pro.service
sudo systemctl daemon-reload
sudo systemctl enable finskills-pro
sudo systemctl start finskills-pro
sudo systemctl status finskills-pro --no-pager
```

Логи:

```bash
journalctl -u finskills-pro -f
```

---

## 8) Nginx reverse proxy

```bash
sudo cp deploy/nginx/finskills-pro.conf /etc/nginx/sites-available/finskills-pro
sudo nano /etc/nginx/sites-available/finskills-pro
```

Замените `YOUR_DOMAIN` на ваш домен.

Включаем сайт:

```bash
sudo ln -s /etc/nginx/sites-available/finskills-pro /etc/nginx/sites-enabled/
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
cd /var/www/finskills-pro/current
git pull
bash deploy/scripts/deploy.sh
```

---

## 12) Быстрый чек, если сайт не открывается

1. Проверить процесс приложения:
   ```bash
   systemctl status finskills-pro
   ```
2. Проверить логи:
   ```bash
   journalctl -u finskills-pro -n 200 --no-pager
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

- Для SQLite обязательно храните БД в `/var/www/finskills-pro/shared/dev.db`, чтобы она не терялась при `git pull`.
- Для более серьёзной нагрузки рекомендуется PostgreSQL.
- `next.config.mjs` уже содержит `typescript.ignoreBuildErrors`, но лучше постепенно убрать `any` и сделать строгую типизацию.
