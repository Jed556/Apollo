#!/bin/bash
# Author: Jerrald Guiriba
# Purpose: Automate Apollo SSH installations
# --------------------------------------------------------

# Output Style
BR='\033[1;31m'
BG='\033[1;32m'
BY='\033[1;33m'
BB='\033[1;34m'
BP='\033[1;35m'
RP='\033[0;35m'
BC='\033[1;36m'
BW='\033[1;37m'
OB='\033[44m'
OIB='\033[104m'
NC='\033[0m'

# Variables
exist=false


# Art
echo -e "${BW}"
echo -e "${NC}    ${OIB}      ${OB}                                                               ${OIB}      ${NC}    "
echo -e "  ${OIB}     ${OB}        _____ __________________  .____    .____    ________         ${OIB}     ${NC}  "
echo -e " ${OIB}   ${OB}          /  _  \\\\\\______   \_____  \ |    |   |    |   \_____//\           ${OIB}   ${NC} "
echo -e "${OIB}   ${OB}          /  /_\  \|     ___//   |   \|    |   |    |    /   //  \           ${OIB}   "
echo -e "   ${OB}         /    |    \    |   /    |    \    |___|    |___/   //    \          ${OIB}   ${NC}"
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
sudo apt update

echo -e "\n${BP}FFMPEG${NC}"
sudo apt install ffmpeg

echo -e "\n${BP}Canvas Builder${RP}   ( build-essential | libcairo2-dev | libpango1.0-dev | libjpeg-dev | libgif-dev | librsvg2-dev )${NC}"
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

echo -e "\n${BP}NPM Global Install${RP}   ( forever | surge )${NC}"
npm i forever surge -g

echo -e "\n${BP}NPM Install${NC}"
npm i
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