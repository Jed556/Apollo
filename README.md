<div align="center">
	<br />
	<p>
		<a href="https://tiny.one/Apollo-inv"><img src="https://i.imgur.com/MX2uOPJ.png" width="760" alt="discord.js" /></a> 
	</p>
	<p>
		<a href="https://discord.gg/5ezrYqutmD"><img alt="Discord" src="https://img.shields.io/discord/946241935742488616?color=5865F2&logo=discord&logoColor=white"></a>
	</p>
</div>

Apollø is a JavaScript based Discord bot that runs with **discord.js** and **distube**. This bot was originally made as a music bot and further improved as my interest in Discord bots grow.<br/>

*Please credit me after modifying/using the project!* :)<br/>

## Table of Contents
- [Installation](https://github.com/Jed556/Apollo#installation)
  - [Basic](https://github.com/Jed556/Apollo#basic)
  - [Ubuntu / SSH](https://github.com/Jed556/Apollo#ubuntu--ssh)
  - [Other Dependencies](https://github.com/Jed556/Apollo#other-dependencies)
    - Ubuntu
    - Windows

## Installation
### Basic
- Install [Node.js](https://nodejs.org/en/)
- Clone the repository
- Go inside the repository folder
- Install dependencies `npm i`
- Run the program `node .`

### Ubuntu / SSH
- Clone the repository
- Copy or move **Apollo/\_misc\_/apollo.sh** outside **Apollo** folder
- Enter `chmod u+x apollo.sh`
- Run the script: `./apollo.sh`

### Other Dependencies
These dependencies are required in certain circumstances<br/>
- Ubuntu / SSH
  ``` bash
  npm i forever surge -g
  sudo apt install ffmpeg
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  ```
- Windows
  ``` text
  npm i ffmpeg-static
  npm i forever surge -g
  ```
