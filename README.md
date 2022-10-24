<div align="center">
	<br />
	<p>
		<a href="https://tiny.one/Apollo-inv"><img src="https://i.imgur.com/pMReolo.png" width="760" alt="discord.js" /></a> 
	</p>
	<p>
		<a href="https://discord.gg/5ezrYqutmD"><img alt="Discord" src="https://img.shields.io/discord/946241935742488616?color=5865F2&logo=discord&logoColor=white&label="></a>
		<a href="https://github.com/Jed556/Apollo/releases"><img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/Jed556/Apollo?include_prereleases&color=35566D&logo=github&logoColor=white&label=latest"></a>
		<a href=https://github.com/Jed556/Apollo/tree/main><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/Jed556/Apollo?color=253C4F&label=dev&logo=json"></a>
		<a href="https://github.com/Jed556/Apollo/releases"><img alt="GitHub downloads" src="https://img.shields.io/github/downloads/Jed556/Apollo/total?label=downloads&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA2klEQVQ4jZ2SMWpCQRCGv5WHWKQIHsAj5Ah2IR7ByhvYpUiVxkqipPCE5gKKBB5Y+KXIIzzXWX3mh2FhZ/5vZ3YXAqkzdavumtiqs6g2MvfV2kvVaj+v7wWMChgE+4MmdxMQ7RVz14r/Dbirg7+Z1BHw2ERJT+oe2KeUvs4y6ntw8yUtLtAq6rqDeaPG/XWAlM0Z5KOzWZ2owwCybJk/c7M6VCf4+0XHhU5e1bfoZHWs1hVwInjflBLA6vrAnCrgADyrxwZGa83Va60vwCGpU2ADPNw4Ldc3MP8Bk60okvXOxJoAAAAASUVORK5CYII="></a>
	</p>
</div>

**Apollø** is a JavaScript based Discord bot that runs on [**discord.js**](https://github.com/discordjs/discord.js) and [**DisTube**](https://github.com/skick1234/DisTube). This bot is a reworked and improved version of [**JavaSkripp**](https://github.com/Jed556/JavaSkripp-DEPRECATED) - from scratch. Apollø supports music, utility, entertainment and moderation commands.<br/>

*Please credit me after modifying/using the project!* :)<br/>

## Table of Contents
- [Installation](https://github.com/Jed556/Apollo#installation)
  - [Basic / Windows](https://github.com/Jed556/Apollo#basic--windows)
  - [Ubuntu / SSH](https://github.com/Jed556/Apollo#ubuntu--ssh)
  - [Other Dependencies](https://github.com/Jed556/Apollo#other-dependencies)
    - 24/7 Ubuntu Server
    - Windows
  - [Heroku](https://github.com/Jed556/Apollo#heroku)

## Installation
### Basic / Windows
- Install [Node.js](https://nodejs.org/en/)
- Download [Apollo.zip](https://github.com/Jed556/Apollo/releases)
- Go inside the repository folder
- Install dependencies `npm i`
- Run the program `node .`

### Ubuntu / SSH
- Clone the repository
- Copy or move **Apollo/\_misc\_/[apollo.sh](https://github.com/Jed556/Apollo/blob/main/_misc_/apollo.sh)** outside **Apollo** folder
- Enter `chmod u+x apollo.sh`
- Run the script: `./apollo.sh`
  ``` bash  
  # Check if directory exists
  exist=false
  if [ -d "Apollo" ]; then
      exist=true
  fi

  # Stop processes
  if [ "$exist" = true ]; then
      forever stop Apollo/index.js
  fi
  
  # Clone / Update
  if [ "$exist" = true ]; then
      rm -rf Apollo && echo $'removed \'Apollo\''
  fi
  git clone https://github.com/Jed556/Apollo.git
  
  # Install dependencies
  cd Apollo
  sudo apt update
  sudo apt install ffmpeg
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  sudo apt install chromium-browser -y
  npm i forever surge -g
  sudo npm i -g puppeteer --unsafe-perm=true -allow-root
  npm i

  # Create necesssary files
  touch apollo.log && echo $'created \'apollo.log\''

  # Run Apollo
  forever start -a -l ../Apollo/apollo.log index.js
  ```

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

### Heroku
Heroku hosting is deprecated.<br/>
*Please refer to [v0.3.1 Files](https://github.com/Jed556/Apollo/blob/v0.3.1) for hosting.*
