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


    # Declare variables
    tempFolder="apolloTemp"
    today=$(date +%m-%d-%Y)


    # Check if directory exists
    if [[ -d "Apollo" ]]; then
        exist=true
    fi


    # Initialize args
    if [ $# > 0 ]; then
        # Set vars
        validArgs=("h" "a" "s" "c" "F" "X" "U" "S" "G" "L" "r" "t" "-" "b")
        inputArgs="$*"
        argsArr=""
        argsArrSelf=""
        invalidChars=""
        duplicateChars=""

        # Convert input args to lowercase
        # inputArgs="${inputArgs[@],,}"

        # Loop through args
        for char in $(echo $inputArgs | grep -o .); do 

            # Check for valid and invalid args
            if ! [[ ${validArgs[*]} =~ $char ]]; then

                # List invalid chars
                invalidChars+="$char, "

                # List valid chars
            elif [[ $char != "-" ]]; then
                argsArr+="$char, "

                # Args to pass after self update
                if [[ $char != "s" ]]; then
                    argsArrSelf+="-$char"
                fi

                # Check if bash file activated
                if [[ $char != "b" ]]; then
                    BASH=true
                fi

                # Check for duplicate args
                if [[ $(echo ${inputArgs[@]} | tr ' ' '\n' | grep -c $char) -gt 1 ]]; then
                        duplicateChars+="$char, "
                fi
            fi
        done

        # Remove last ", " from invalid chars and duplicate chars
        invalidChars=$(echo $invalidChars | sed 's/.$//')
        duplicateChars=$(echo $duplicateChars | sed 's/.$//')
        argsArr=$(echo $argsArr | sed 's/.$//')

        # Check for invalid chars to print
        if [[ ! -z $invalidChars ]]; then
            echo -e "${BR}[ERROR]${NC} Flags $invalidChars not found"
            exit 1
        fi

        # Check for valid chars to print
        if [[ ! -z $argsArr && "$BASH" != true ]]; then
            echo -e "${BC}[INFO]${NC} Script ran with flags: $argsArr"
        fi

        # Check for duplicate chars to print
        if [[ ! -z $duplicateChars ]]; then
            echo -e "${BY}[WARN]${NC} Characters $duplicateChars are duplicate"
        fi

        # Read args
        for char in $(echo $argsArr | grep -o .); do
            case "$char" in
                # Script related
                *h*) HELP=true;; # Display Help
                *a*) NART=true;; # Hide Art

                # Repository related
                *s*) SELF=true;;# Update Self
                *c*) CLONE=true;; # Clone repository

                # File management related
                *F*) FILES=true;; # Copy configs & manage files
                *X*) UPDATE_LOC=true;; # Clean-up files
                *U*) UPDATE=true;; # Update all dependencies
                *S*) UPDATE_SYS=true;; # Update system dependencies
                *G*) UPDATE_GLB=true;; # Update global dependencies
                *L*) UPDATE_LOC=true;; # Update package dependencies

                # Run related
                *r*) START=true;; # Start or restart
                *t*) TAIL=true;; # Tail logs
            esac
        done
    else
        NO_ARGS=true
    fi



    # Art
    if [[ ( "$NART" != true || "$NO_ARGS" = true ) && ( "$HELP" != true || "$SELF" = true ) ]]; then
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



    # Self Update
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
            $0 $argsArrSelf b
            exit
        else
            echo -e "Latest Installed"
            echo -e "${BC}================================ CHECKED apollo.sh ================================${NC}\n"
        fi
        rm -f "$file2"
    fi



    if [[ "$HELP" = true ]]; then
        echo -e "${BY}Script related${NC}"
        echo -e "   ${BW}h${NC}  Display Help"
        echo -e "   ${BW}a${NC}  Hide Art"

        echo -e "${BC}Repository related${NC}"
        echo -e "   ${BW}s${NC}  Update Self"
        echo -e "   ${BW}c${NC}  Clone repository"

        echo -e "${BP}File management related${NC}"
        echo -e "   ${BW}F${NC}  Copy configs & manage files"
        echo -e "   ${BW}X${NC}  Clean-up files"
        echo -e "   ${BW}U${NC}  Update all dependencies"
        echo -e "   ${BW}S${NC}  Update system dependencies"
        echo -e "   ${BW}G${NC}  Update global dependencies"
        echo -e "   ${BW}L${NC}  Update package dependencies"
        echo -e "   ${BW}X${NC}  Update package dependencies"

        echo -e "${BG}Run related${NC}"
        echo -e "   ${BW}r${NC}  Start or restart"
        echo -e "   ${BW}t${NC}  Tail logs"
        exit 0
    fi



    # Stop processes
    if [[ "$exist" = true ]]; then
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$UPDATE_SYS" = true || "$UPDATE_GLB" = true || "$UPDATE_LOC" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
            echo -e "\n${BR}================================= STOPPING APOLLO =================================${NC}"
            forever stop Apollo/index.js
            if [[ $? != 0 ]]; then
                echo -e "\n${BR}No instances running right now${NC}"
            else
                echo -e "\n${BR}[STOP]${NC} Stopped running instances"
            fi
            echo -e "${BR}===================================== STOPPED =====================================${NC}"
        fi
    fi



    # Clone / Update
    if [[ "$CLONE" = true || "$NO_ARGS" = true ]]; then
        if [[ "$exist" = true ]]; then
            echo -e "\n${BC}================================= UPDATING APOLLO =================================${NC}"
            rm -rf Apollo && echo -e "removed \'Apollo\'"
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
    if [[ "$UPDATE" = true || "$UPDATE_SYS" = true || "$UPDATE_GLB" = true || "$UPDATE_LOC" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BP}============================= INSTALLING DEPENDENCIES =============================${NC}"
        cd Apollo


        # Update system related dependencies
        if [[ "$UPDATE_SYS" = true || "$UPDATE" = true || "$NO_ARGS" = true ]]; then
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
        fi


        # Update global dependencies
        if [[ "$UPDATE_GLB" = true || "$UPDATE" = true || "$NO_ARGS" = true ]]; then
            echo -e "\n${BP}Node Version Manager${RP}   ( nodejs | npm | yarn )${NC}"
            wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
            
            # Use nvm without closing terminal
            source ~/.bashrc
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
            [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
            nvm install --lts --latest-npm node
            npm i -g yarn npm

            echo -e "\n${BP}NPM Global Install${RP}   ( forever | surge | puppeteer )${NC}"
            npm i -g forever surge
            npm i -g puppeteer --unsafe-perm=true -allow-root
        fi


        # Update local dependencies
        if [[ "$UPDATE_LOC" = true || "$UPDATE" = true || "$NO_ARGS" = true ]]; then
            echo -e "\n${BP}NPM Install | Yarn${NC}"
            # Install dependencies using Yarn
            yarn
            # If yarn failed, try npm
            if [[ $? != 0 ]]; then
                echo -e "\n${RP}Yarn failed. Falling back to npm...${NC}"
                npm i
            fi
        fi

        cd ..
        echo -e "${BP}==================================== INSTALLED ====================================${NC}"
    fi



    # Manage files
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BY}================================= CREATING FILES ==================================${NC}"
        if [[ "$exist" = true ]]; then
            logName="apollo_$today.log"
            errLogName="apollo_${today}_err.log"
            touch Apollo/$logName && echo -e "created '$logName'"
            touch Apollo/$errLogName && echo -e "created '$errLogName'"

            # Create temp folder if none
            if [ ! -d "$tempFolder" ]; then
            mkdir $tempFolder
            fi

            # Move old logs to temp folder
            for file in apollo-*.log
            do
                if [ "$file" != "$logName" ]; then
                    mv $file $tempFolder
                    echo "Moved $file to $tempFolder"
                fi
            done
        else
            echo -e "${BR}[ERROR]${NC} No existing Apollo repo in current directory"
            exit 1
        fi
        echo -e "${BY}===================================== CREATED =====================================${NC}"
    fi



    # Run Apollo
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NO_ARGS" = true ]]; then
        echo -e "\n${BG}================================= STARTING APOLLO =================================${NC}"
        cd Apollo
        forever start -a -o $logName -e $errLogName index.js
        cd ..
        echo -e "${BG}===================================== ONLINE ======================================${NC}\n"
    fi



    # Tail logs
    if [[ "$TAIL" = true ]]; then
        tail -n +1 -f ./Apollo/apollo_$today.log
    fi



    # Bye
    exit 0
}