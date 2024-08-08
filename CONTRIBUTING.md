**Thanks for contributing to RainLoop Webmail!**

1. Fork the repo, do work in a feature branch.
2. Issue a pull request.

---

## Config php development environment

### Dependencies

```shell
apt-get update
sudo apt-get install apache2
sudo apt-get install php
apt-cache search libapache2-mod-php
sudo apt-get install libapache2-mod-php
apt-get install php-curl
apt-get install php-xml
```

### Update rainloop manually

Download rainloop.zip, then
```shell
mkdir /var/www/html/rainloop
unzip rainloop-latest.zip -d /var/www/html/rainloop

cd /var/www/html/rainloop
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;
sudo chown -R www-data:www-data .
```

If you need copy from `rainloop-webmail` manually
```shell
sudo rm -rf /var/www/html/rainloop/rainloop/v/1.17.0/*
sudo cp ./rainloop-webmail/rainloop/v/0.0.0/* -r /var/www/html/rainloop/rainloop/v/1.17.0/
```

### Start server


```shell
sudo systemctl start apache2
```
check status
```shell
sudo systemctl status apache2
```
clear cache
```shell
sudo rm -rf /var/www/html/rainloop/data/_data_/_default_/cache/*
```
restart server
```shell
sudo systemctl restart apache2
```


### Config contacts
```shell
/var/www/html/rainloop/data/_data_/_default_/configs
```
```shell
[contacts]
; Enable contacts
enable = On
```

### Config SQLite

1. Install PDO SQLite Extension:
```shell
sudo apt update
sudo apt install php-sqlite3
```

2. Enable PDO SQLite Extension:
```shell
sudo nano /etc/php/{PHP_VERSION}/cli/php.ini
sudo nano /etc/php/{PHP_VERSION}/apache2/php.ini
```

`extension=pdo_sqlite`

3. Restart the Web Server:
```shell
sudo /etc/init.d/apache2 restart
```
### Test
Test admin at `http://localhost/rainloop/?admin` `admin/12345`

check Domains - outlook.com

Test user login at `http://localhost/rainloop/`

### Update front end

1. Install node.js - `https://nodejs.org/download/`
2. Install yarn - `https://yarnpkg.com/en/docs/install`
3. Install gulp - `npm install gulp -g`
4. Fork rainloop - `https://github.com/RainLoop/rainloop-webmail`
5. Clone rainloop - `git clone git@github.com:USERNAME/rainloop-webmail.git`
6. `cd rainloop-webmail`
7. Install install all dependencies - `yarn install`
8. Run - `npm run demo`
9. refresh `http://localhost/rainloop/`
---

**Debugging JavaScript**

1. Edit data/\_data_/\_default_/configs/application.ini
2. Set 'use_app_debug_js' (and optionally 'use_app_debug_css') to 'On'

---

**Editing HTML Template Files**

1. Edit data/\_data_/\_default_/configs/application.ini
2. Set 'cache_system_data' to Off
