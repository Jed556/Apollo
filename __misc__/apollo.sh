#!/bin/bash
# Author: Jerrald Guiriba
# Purpose: Automate Apollo SSH installations
# --------------------------------------------------------

# Output Style
# Source: https://stackoverflow.com/a/28938235
BR='\033[1;31m' # Bold Red
BG='\033[1;32m' # Bold Green
BY='\033[1;33m' # Bold Yellow
BB='\033[1;34m' # Bold Blue
BP='\033[1;35m' # Bold Purple
RP='\033[0;35m' # Regular Purple
BC='\033[1;36m' # Bold Cyan
BW='\033[1;37m' # Bold White
OB='\033[44m'   # On Blue (Background)
OIB='\033[104m' # On High Intensity Blue (Background)
NC='\033[0m'    # Normal Color

# Variables
exist=false


# Art
echo -e "${BW}"
echo -e "${NC}    ${OIB}      ${OB}                                                               ${OIB}      ${NC}    "
echo -e "  ${OIB}     ${OB}        _____ __________________  .____    .____    ________         ${OIB}     ${NC}  "
echo -e " ${OIB}   ${OB}          /  _  \\\\\\______   \_____  \ |    |   |    |   \_____//\           ${OIB}   ${NC} "
echo -e "${OIB}   ${OB}          /  /_\  \|     ___//   |   \|    |   |    |    /   //  \           ${OIB}   ${NC}"
echo -e "${OIB}   ${OB}         /    |    \    |   /    |    \    |___|    |___/   //    \          ${OIB}   ${NC}"
echo -e " ${OIB}   ${OB}        \____|__  /____|   \_______  /_______ \_______ \__//___  /         ${OIB}   ${NC} "
echo -e "  ${OIB}     ${OB}             \/                 \/        \/       \/       \/       ${OIB}     ${NC}  "
echo -e "    ${OIB}      ${OB}                                                               ${OIB}      ${NC}    "


# Check if directory exists
if [ -d "Apollo" ]; then
    exist=true
fi


# Stop processes
if [ "$exist" = true ]; then
    echo -e "\n${BR}================================= STOPPING APOLLO =================================${NC}"
    forever stop Apollo/index.js
    echo -e "${BR}===================================== STOPPED =====================================${NC}"
fi


# Clone / Update
if [ "$exist" = true ]; then
    echo -e "\n${BC}================================= UPDATING APOLLO =================================${NC}"
    rm -rf Apollo && echo $'removed \'Apollo\''
else
    echo -e "\n${BC}================================= CLONING APOLLO ==================================${NC}"
fi

git clone https://github.com/Jed556/Apollo.git

if [ "$exist" = true ]; then
    echo -e "${BC}================================= UPDATED APOLLO ==================================${NC}"
else
    echo -e "${BC}===================================== CLONED ======================================${NC}"
fi


# Copy necessary files
echo -e "\n${BY}================================== COPYING FILES ==================================${NC}"
cp -v .env Apollo
echo -e "${BY}===================================== COPIED ======================================${NC}"


# Install dependencies
echo -e "\n${BP}============================= INSTALLING DEPENDENCIES =============================${NC}"
cd Apollo

echo -e "\n${BP}APT Update${NC}"
sudo apt -y update

echo -e "\n${BP}FFMPEG${NC}"
sudo apt install -y ffmpeg

echo -e "\n${BP}Canvas Builder${RP}   ( build-essential | libcairo2-dev | libpango1.0-dev | libjpeg-dev | libgif-dev | librsvg2-dev )${NC}"
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

echo -e "\n${BP}Puppeteer Dependencies${NC}"
sudo apt install -y chromium-browser -y
# Comment the line below if you don't want to accidentally change the kernel
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

echo -e "\n${BP}Node Version Manager${RP}   ( nodejs | npm | yarn )${NC}"
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install node && nvm use node --silent
npm i -g yarn npm

echo -e "\n${BP}NPM Global Install${RP}   ( forever | surge | puppeteer )${NC}"
npm i -g forever surge
npm i -g puppeteer --unsafe-perm=true -allow-root

echo -e "\n${BP}NPM Install | Yarn${NC}"
# Install dependencies using Yarn
yarn
# If yarn failed, try installing dependencies using npm
if [ $? -ne 0 ]; then
    echo -e "\n${RP}Yarn failed. Falling back to npm...${NC}"
    npm i
fi

echo -e "${BP}==================================== INSTALLED ====================================${NC}"


# Create necesssary files
echo -e "\n${BY}================================= CREATING FILES ==================================${NC}"
touch apollo.log && echo $'created \'apollo.log\''
echo -e "${BY}===================================== CREATED =====================================${NC}"


# Run Apollo
echo -e "\n${BG}================================= STARTING APOLLO =================================${NC}"
forever start -a -l ../Apollo/apollo.log index.js
echo -e "${BG}===================================== ONLINE ======================================${NC}\n"


# Bye
exit 0