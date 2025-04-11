
# Инструкция по настройке Nginx для Yandex Direct Dashboard

## Решение проблем с SSH-подключением

Если вы видите ошибку `Handshake failed: signature verification failed` при выполнении команд на сервере, проверьте следующее:

```bash
# Проверьте формат и права доступа для SSH-ключей
ls -la ~/.ssh/
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 700 ~/.ssh/
```

SSH-ключи должны иметь правильные права доступа:
- `~/.ssh/` директория: 700 (drwx------)
- `~/.ssh/id_rsa` (приватный ключ): 600 (-rw-------)
- `~/.ssh/id_rsa.pub` (публичный ключ): 644 (-rw-r--r--)
- `~/.ssh/authorized_keys`: 600 (-rw-------)

Также убедитесь, что формат приватного ключа корректен и соответствует формату OpenSSH.

## Проверка и исправление проблем с символическими ссылками

Если вы видите ошибку `Too many levels of symbolic links` при проверке конфигурации Nginx, выполните следующие команды:

```bash
# Проверьте содержимое директории sites-enabled
sudo ls -la /etc/nginx/sites-enabled/

# Если есть неправильные символические ссылки (например, "ln"), удалите их:
sudo rm /etc/nginx/sites-enabled/ln

# Если есть другие проблемные ссылки, их тоже нужно удалить
```

## Правильная установка конфигурации Nginx

1. Скопируйте файл настроек в правильное местоположение:

```bash
sudo cp nginx-config-example.txt /etc/nginx/sites-available/yandex-dashboard
```

2. Создайте символическую ссылку в sites-enabled:

```bash
sudo rm -f /etc/nginx/sites-enabled/yandex-dashboard
sudo ln -s /etc/nginx/sites-available/yandex-dashboard /etc/nginx/sites-enabled/
```

3. Проверьте, что нет конфликтующих конфигураций:

```bash
# Если у вас есть default конфигурация и она конфликтует с вашим приложением, вы можете её отключить:
sudo rm /etc/nginx/sites-enabled/default
```

4. Проверьте конфигурацию Nginx:

```bash
sudo nginx -t
```

5. Если всё в порядке, перезапустите Nginx:

```bash
sudo systemctl restart nginx
```

## Структура конфигурации Nginx

Важно помнить, что директивы `server` всегда должны находиться внутри блока `http {}` в основном файле `/etc/nginx/nginx.conf`.

Однако, для удобства администрирования, обычно конфигурации отдельных сайтов хранятся в директории `/etc/nginx/sites-available/` и активируются через символические ссылки в `/etc/nginx/sites-enabled/`.

## Проверка настройки SSL

После настройки, убедитесь что SSL сертификаты корректно настроены:

```bash
curl -I https://allynovaittest.site
```

Вы должны получить ответ с кодом 200 OK.
