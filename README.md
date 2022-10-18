<div align="center">
	<br />
	<p>
		<a href="https://tiny.one/Apollo-inv"><img src="https://i.imgur.com/pMReolo.png" width="760" alt="discord.js" /></a> 
	</p>
	<p>
		<a href="https://discord.gg/5ezrYqutmD"><img alt="Discord" src="https://img.shields.io/discord/946241935742488616?color=5865F2&logo=discord&logoColor=white"></a>
		<a href="[https://github.com/Jed556/Apollo/releases](https://github.com/Jed556/Apollo/releases)"><img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/Jed556/Apollo?include_prereleases&logo=github&logoColor=white"></a>
		<a href="https://github.com/Jed556/Apollo/releases"><img alt="GitHub downloads" src="https://img.shields.io/github/downloads/Jed556/Apollo/total?logoColor=white"></a>
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
  npm i forever surge -g
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
  ```
- Windows
  ``` text
  npm i ffmpeg-static
  ```

### Heroku
Heroku hosting is deprecated.<br/>
*Please refer to [v0.3.1 Files](https://github.com/Jed556/Apollo/blob/v0.3.1) for hosting.*
