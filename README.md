<div align="center">
  <br>
  <p>
    <a href="https://bit.ly/Apollo-invite"><img src="https://i.imgur.com/pMReolo.png" width="760" alt="discord.js" /></a> 
  </p>
  <p>
    <a href="https://discord.gg/5ezrYqutmD"><img alt="Discord" src="https://img.shields.io/discord/946241935742488616?color=5865F2&logo=discord&logoColor=white&label="></a>
    <a href="https://github.com/Jed556/Apollo/releases"><img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/Jed556/Apollo?include_prereleases&color=35566D&logo=github&logoColor=white&label=latest"></a>
    <a href=https://github.com/Jed556/Apollo/tree/main><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/Jed556/Apollo?color=253C4F&label=dev&logo=json"></a>
    <a href="https://github.com/Jed556/Apollo/releases"><img alt="GitHub downloads" src="https://img.shields.io/github/downloads/Jed556/Apollo/total?label=downloads&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA2klEQVQ4jZ2SMWpCQRCGv5WHWKQIHsAj5Ah2IR7ByhvYpUiVxkqipPCE5gKKBB5Y+KXIIzzXWX3mh2FhZ/5vZ3YXAqkzdavumtiqs6g2MvfV2kvVaj+v7wWMChgE+4MmdxMQ7RVz14r/Dbirg7+Z1BHw2ERJT+oe2KeUvs4y6ntw8yUtLtAq6rqDeaPG/XWAlM0Z5KOzWZ2owwCybJk/c7M6VCf4+0XHhU5e1bfoZHWs1hVwInjflBLA6vrAnCrgADyrxwZGa83Va60vwCGpU2ADPNw4Ldc3MP8Bk60okvXOxJoAAAAASUVORK5CYII="></a>
  </p>
</div>

**Apollø** is a JavaScript based Discord bot that runs on [**discord.js**](https://github.com/discordjs/discord.js) and [**DisTube**](https://github.com/skick1234/DisTube). This bot is a reworked and improved version of [**JavaSkripp**](https://github.com/Jed556/JavaSkripp-DEPRECATED) - from scratch. Apollø supports music, utility, entertainment and moderation commands.
<div align="center">
  <i>Please credit me after modifying or using the project! :)</i>
</div>

## Table of Contents
- [Installation](https://github.com/Jed556/Apollo#installation)
  - [Basic / Windows](https://github.com/Jed556/Apollo#basic--windows)
  - [Ubuntu / SSH](https://github.com/Jed556/Apollo#ubuntu--ssh)
  - [Ubuntu / SSH - Deprecated](https://github.com/Jed556/Apollo/tree/f4f37004912b4ec12cb503c52d3ead87d9f0a373#ubuntu--ssh---deprecated)
  - [apollo.sh](https://github.com/Jed556/Apollo#apollosh)
  - [Other Dependencies](https://github.com/Jed556/Apollo#other-dependencies)
    - 24/7 Ubuntu Server
    - Windows
  - [Heroku - Deprecated](https://github.com/Jed556/Apollo/tree/f4f37004912b4ec12cb503c52d3ead87d9f0a373#heroku)
- [Support](https://github.com/Jed556/Apollo#support)

## Installation
I recommend using **JSON files** for now.<br>
**.env files** are parsed as strings, causing some of the config values to be interpreted incorrectly.
### Basic / Windows
- Install [Node.js](https://nodejs.org/en/)
- Download latest [Apollo.zip](https://github.com/Jed556/Apollo/releases) release
- Extract the **Apollo-main** folder to your desired location
- Go inside the repository folder ***Apollo-main***
- Create or fill up a config file from the [**templates**](https://github.com/Jed556/Apollo/blob/main/__misc__/config) given in the directory you want to install Apollo. All configurations in the **JSON files** are also in the **.env** file (will ignore **JSON files** if **.env** is present). **JSON files** must be in **\<REPO_FOLDER\>/config/** while .env must be in **\<REPO_FOLDER\>/**
- Install dependencies `npm i`
- Run the program `node .`

### Ubuntu / SSH
- Create or fill up a config file from the [**templates**](https://github.com/Jed556/Apollo/blob/main/__misc__/config) given in the directory you want to install Apollo. All configurations in the **JSON files** are also in the **.env** file (will ignore **JSON files** if **.env** is present)
- Simply copy, paste and run the code below to your linux terminal. It automatically handles dependency installation, installation updates, copying of config files, runs the client and sets the global node version to use for future use cases.
```Bash
curl -s -LO https://raw.githubusercontent.com/Jed556/Apollo/main/__misc__/apollo.sh && chmod u+x apollo.sh && ./apollo.sh && nvm use --lts --silent node
```
- You may run `./apollo.sh` in your terminal if you want to get the latest release, update your dependencies and restart the client.

### apollo.sh
For bash script **apollo.sh** flags. <br>
Flags can be added with or without dash ( `./apollo.sh -h` / `./apollo.sh h` ). <br>
Examples of multiple flag declaration formats are: multiple dash ( `-h -n` / `h n` ), single dash ( `-hnl` / `hnl` ).

| Flag  | Description                                                                    |
| :---: | :---                                                                           |
|       | **Script related**                                                             |
|   h   | Display Help                                                                   |
|   a   | Hide Art                                                                       |
|   n   | Run script normally (No arguments / Defaults) and execute additional arguments |
|   l   | Use one log file for errors and output                                         |
|       | **Repository related**                                                         |
|   s   | Update Self                                                                    |
|   c   | Clone repository                                                               |
|       | **File management related**                                                    |
|   F   | Copy configs & manage files                                                    |
|   X   | Clean-up files ( logs \| temps \| cache )                                      |
|   U   | Update all dependencies                                                        |
|   S   | Update system dependencies                                                     |
|   G   | Update global dependencies                                                     |
|   L   | Update package dependencies                                                    |
|   X   | Update package dependencies                                                    |
|       | **Run related**                                                                |
|   r   | Start or restart                                                               |
|   t   | Tail logs                                                                      |


### Other Dependencies
These dependencies are required in certain circumstances<br/>
- 24/7 Ubuntu Server
  ``` bash
  # Keep alive
  npm i forever surge -g
  # FFMPEG (Audio player)
  sudo apt install ffmpeg
  # Canvas builder
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  # Puppeteer
  sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
  ```
- Windows
  ``` text
  npm i ffmpeg-static
  ```

## Support
<div align="center">
  <a href="https://discordapp.com/users/839430747088617472"><img src="https://discord.c99.nl/widget/theme-3/839430747088617472.png" alt="Jed556" height="58"></a>
  <a href="https://discordapp.com/users/994902546273550346"><img src="https://discord.c99.nl/widget/theme-1/994902546273550346.png" alt="Jed556" height="58"></a>
  <a href="https://discord.gg/5ezrYqutmD"><img src="https://discord.com/api/guilds/946241935742488616/widget.png?style=banner2" height="58"></a>
</div>
<br>
<div align="center">
  <a href="https://github.com/Jed556/Apollo/issues">Issues</a>
  &nbsp; &nbsp;
  <a href="https://github.com/users/Jed556/projects/4">Updates</a>
  &nbsp; &nbsp;
  <a href="mailto:jguiriba11@gmail.com">Send Email</a>
</div>
