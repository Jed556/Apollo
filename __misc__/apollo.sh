#!/bin/bash

# Author: Jerrald Guiriba
# Purpose: Automate Apollo SSH installations

{
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

    # Initialize args
    if [ $# > 0 ]; then
        # Set vars
        validArgs=("a" "s" "c" "f" "u" "r" "-")
        inputArgs="$*"
        argsArr=""
        invalidChars=""
        duplicateChars=""

        # Convert input args to lowercase
        inputArgs="${inputArgs[@],,}"

        # Check for valid and invalid args
        for char in $(echo $inputArgs | grep -o .); do
            if ! [[ ${validArgs[*]} =~ $char ]]; then
                invalidChars+="$char, "
            elif [[ $char != "-" ]]; then
                argsArr+="$char, "
            fi
        done

        # Check for duplicate args
        for char in $(echo $inputArgs | grep -o .); do
            if [[ $(echo ${inputArgs[@]} | tr ' ' '\n' | grep -c $char) -gt 1 ]]; then
                duplicateChars+="$char, "
            fi
        done

        # Remove last ", " from invalid chars and duplicate chars
        invalidChars=$(echo $invalidChars | sed 's/.$//')
        duplicateChars=$(echo $duplicateChars | sed 's/.$//')
        argsArr=$(echo $argsArr | sed 's/.$//')

        # Check for valid chars to print
        if [[ ! -z $argsArr ]]; then
            echo -e "${BC}[INFO]${NC} Script ran with flags: $argsArr"
        fi

        # Check for invalid chars to print
        if [[ ! -z $invalidChars ]]; then
            echo -e "${BR}[ERROR]${NC} Flags $invalidChars not found"
            exit 1
        fi

        # Check for duplicate chars to print
        if [[ ! -z $duplicateChars ]]; then
            echo -e "${BY}[Warning]${NC} Characters $duplicateChars are duplicate"
        fi

        # Read args ("a" "s" "c" "f" "u" "r")
        for char in $(echo $argsArr | grep -o .); do
            # Display Art (Display art)
            if [ "$char" == "a" ]; then
                ART=true
            fi
            # Run Only (Do not update self)
            if [ "$char" == "s" ]; then
                SELF=true
            fi
            # Clone (Clone repo)
            if [ "$char" == "c" ]; then
                CLONE=true
            fi
            # Files (Copy configs & manage files)
            if [ "$char" == "f" ]; then
                FILES=true
            fi
            # Update (Update dependencies)
            if [ "$char" == "u" ]; then
                UPDATE=true
            fi
            # Start (Start or restart)
            if [ "$char" == "r" ]; then
                START=true
            fi
        done
    else
        NO_ARGS=true
    fi



    # Art
    if [[ "$ART" = true || "$NO_ARGS" = true ]]; then
        echo -e "${BW}"
        echo -e "${NC}    ${OIB}      ${OB}                                                               ${OIB}      ${NC}    "
        echo -e "  ${OIB}     ${OB}        _____ __________________  .____    .____    ________         ${OIB}     ${NC}  "
        echo -e " ${OIB}   ${OB}          /  _  \\\\\\______   \_____  \ |    |   |    |   \_____//\           ${OIB}   ${NC} "
        echo -e "${OIB}   ${OB}          /  /_\  \|     ___//   |   \|    |   |    |    /   //  \           ${OIB}   ${NC}"
        echo -e "${OIB}   ${OB}         /    |    \    |   /    |    \    |___|    |___/   //    \          ${OIB}   ${NC}"
        echo -e " ${OIB}   ${OB}        \____|__  /____|   \_______  /_______ \_______ \__//___  /         ${OIB}   ${NC} "
        echo -e "  ${OIB}     ${OB}             \/                 \/        \/       \/       \/       ${OIB}     ${NC}  "
        echo -e "    ${OIB}      ${OB}                                                               ${OIB}      ${NC}    "
    fi



    # Self Update (r = run-only)
    if [[ "$SELF" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BC}=================================== SELF UPDATE ===================================${NC}"
        echo -e "Updating..."
        file1="apollo.sh"
        file2="apollo.remote"
        curl -s -L https://raw.githubusercontent.com/Jed556/Apollo/main/__misc__/apollo.sh -o "$file2"
        compare="$(cmp --s $file1 $file2; echo $?)"
        if [[ "$compare" = 1 ]]; then
            cp -v "$file2" "$file1"
            echo -e "Done"
            echo -e "${BC}================================ UPDATED apollo.sh ================================${NC}\n"
            $0 -cfus
            exit
        else
            echo -e "Latest Installed"
            echo -e "${BC}================================ CHECKED apollo.sh ================================${NC}\n"
        fi
        rm -f "$file2"
    fi



    # Check if directory exists
    if [[ -d "Apollo" ]]; then
        exist=true
    fi



    # Stop processes
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
        if [[ "$exist" = true ]]; then
            echo -e "\n${BR}================================= STOPPING APOLLO =================================${NC}"
            forever stop Apollo/index.js
            echo -e "${BR}===================================== STOPPED =====================================${NC}"
        fi
    fi



    # Clone / Update
    if [[ "$CLONE" = true || "$NO_ARGS" = true ]]; then
        if [[ "$exist" = true ]]; then
            echo -e "\n${BC}================================= UPDATING APOLLO =================================${NC}"
            rm -rf Apollo && echo $'removed \'Apollo\''
        else
            echo -e "\n${BC}================================= CLONING APOLLO ==================================${NC}"
        fi

        git clone https://github.com/Jed556/Apollo.git

        if [[ "$exist" = true ]]; then
            echo -e "${BC}================================= UPDATED APOLLO ==================================${NC}"
        else
            echo -e "${BC}===================================== CLONED ======================================${NC}"
        fi
    fi



    # Copy necessary files
    if [[ "$FILES" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BY}================================== COPYING FILES ==================================${NC}"
        cp -v .env Apollo
        cp -v client.json Apollo/config
        cp -v distube.json Apollo/config
        cp -v database.json Apollo/config
        echo -e "${BY}===================================== COPIED ======================================${NC}"
    fi



    # Install dependencies
    if [[ "$UPDATE" = true || "$NO_ARGS" = true ]]; then
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
        nvm install --lts --latest-npm node
        npm i -g yarn npm

        echo -e "\n${BP}NPM Global Install${RP}   ( forever | surge | puppeteer )${NC}"
        npm i -g forever surge
        npm i -g puppeteer --unsafe-perm=true -allow-root

        echo -e "\n${BP}NPM Install | Yarn${NC}"
        # Install dependencies using Yarn
        yarn
        # If yarn failed, try installing dependencies using npm
        if [[ $? != 0 ]]; then
            echo -e "\n${RP}Yarn failed. Falling back to npm...${NC}"
            npm i
        fi

        cd ..
        echo -e "${BP}==================================== INSTALLED ====================================${NC}"
    fi



    # Create necesssary files
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BY}================================= CREATING FILES ==================================${NC}"
        touch Apollo/apollo.log && echo $'created \'apollo.log\''
        echo -e "${BY}===================================== CREATED =====================================${NC}"
    fi



    # Run Apollo
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BG}================================= STARTING APOLLO =================================${NC}"
        forever start -a -l $PWD/Apollo/apollo.log Apollo/index.js
        echo -e "${BG}===================================== ONLINE ======================================${NC}\n"
    fi



    # Bye
    exit
}