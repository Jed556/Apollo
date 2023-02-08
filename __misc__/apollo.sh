#!/bin/bash

# Author: Jerrald Guiriba
# Purpose: Automate Apollo SSH installations

{
    # Output Style
    # Source: https://stackoverflow.com/a/28938235
    BR='\033[1;31m' # Bold Red
    BG='\033[1;32m' # Bold Green
    BY='\033[1;33m' # Bold Yellow
    RY='\033[0;33m' # Regular Yellow
    BB='\033[1;34m' # Bold Blue
    BP='\033[1;35m' # Bold Purple
    RP='\033[0;35m' # Regular Purple
    BC='\033[1;36m' # Bold Cyan
    RC='\033[0;36m' # Regular Cyan
    BW='\033[1;37m' # Bold White
    OB='\033[44m'   # On Blue (Background)
    OIB='\033[104m' # On High Intensity Blue (Background)
    NC='\033[0m'    # Normal Color


    # Declare variables
    repoName="Apollo"
    tempFolder=".apolloTemp"
    today=$(date +%m-%d-%Y)
    logName="apollo_$today.log"
    errLogName="apollo_${today}_err.log"


    # Check if directory exists
    [ -d "$repoName" ] && exist=true

    # Create temp folder if none
    createTemp () {
        [ ! -d "$tempFolder" ] && mkdir $tempFolder
    }

    # Initialize args
    if [[ $# > 0 ]]; then
        # Set vars
        validArgs=("h" "a" "n" "l" "s" "c" "F" "X" "U" "S" "G" "L" "Y" "r" "t" "-" "b")
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

                # List invalid args
                invalidChars+="$char, "

                # List valid args
            elif [[ "$char" != "-" ]]; then
                argsArr+="$char, "

                # Args to pass after self update
                if [[ "$char" != "s" && "$char" != "b" ]]; then
                    argsArrSelf+="$char"
                fi

                # Check if bash activated
                if [[ $char == "b" ]]; then
                    # Exit if no other args passed
                    if [[ $# == 1 ]]; then
                        exit 0
                    elif [[ $# == 2 && $2 == "-" ]]; then
                        NORMAL=true
                    fi
                    BASH=true
                fi

                # List duplicate args
                if [[ $(echo ${inputArgs[@]} | tr ' ' '\n' | grep -c $char) -gt 1 ]]; then
                        duplicateChars+="$char, "
                fi
            fi
        done

        # Remove last ", " from invalid args and duplicate args
        invalidChars=$(echo $invalidChars | sed 's/.$//')
        duplicateChars=$(echo $duplicateChars | sed 's/.$//')
        argsArr=$(echo $argsArr | sed 's/.$//')

        # Check for invalid args
        if [[ ! -z $invalidChars ]]; then
            echo -e "${BR}[ERROR]${NC} Flags $invalidChars not found"
            exit 1
        fi

        # Check for duplicate args
        if [[ ! -z $duplicateChars ]]; then
            echo -e "${BY}[WARN]${NC} Characters $duplicateChars are duplicate"
        fi

        # Read args
        for char in $(echo $argsArr | grep -o .); do
            case "$char" in
                # Script related
                *h*) HELP=true;; # Display Help
                *a*) NART=true;; # Hide Art
                *n*) NORMAL=true;; # Run script normally (Defaults)
                *l*) ONE_LOG=true;; # Only use one logfile

                # Repository related
                *s*) SELF=true;; # Update Self
                *c*) CLONE=true;; # Clone repository

                # File management related
                *F*) FILES=true;; # Copy configs & manage files
                *X*) CLEAN=true;; # Clean-up files
                *U*) UPDATE=true;; # Update all dependencies
                *S*) UPDATE_SYS=true;; # Update system dependencies
                *G*) UPDATE_GLB=true;; # Update global dependencies
                *L*) UPDATE_LOC=true;; # Update package dependencies
                *Y*) YARN=true;; # Try to update package dependencies using Yarn

                # Run related
                *r*) START=true;; # Start or restart
                *t*) TAIL=true;; # Tail logs
            esac
        done
    else
        NORMAL=true
        argsArrSelf+="-"
    fi



    #! Art
    if [[ "$NART" != true && "$BASH" != true && "$HELP" != true ]]; then
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



    #! Check for valid args
    if [[ ! -z $argsArr && "$BASH" != true ]]; then
        echo -e "\n${BC}[INFO]${NC} Script ran with flags: $argsArr"
    fi



    #! Self Update
    if [[ ( "$SELF" = true || "$NORMAL" = true ) && "$BASH" != true ]]; then
        echo -e "\n${BC}=================================== SELF UPDATE ===================================${NC}"
        echo -e "Updating..."

        # Initialize temp files
        createTemp
        file1="apollo.sh"
        file2="apollo.remote"

        # Pull bash from remote
        curl -s -L https://raw.githubusercontent.com/Jed556/Apollo/main/__misc__/apollo.sh -o $tempFolder/$file2

        # Check for file changes
        compare="$(cmp --s $file1 $tempFolder/$file2; echo $?)"
        if [[ "$compare" = 1 ]]; then
            cp -v "$tempFolder/$file2" "$file1" # Copy remote bash if diffs are found
            echo -e "Done"
            echo -e "${BC}================================ UPDATED apollo.sh ================================${NC}"
            # Execute self with input args (except s) + b
            $0 b $argsArrSelf
            exit 0
        else
            echo -e "Latest Installed"
            echo -e "${BC}================================ CHECKED apollo.sh ================================${NC}"
        fi
    fi



    #! Help list
    if [[ "$HELP" = true ]]; then
        echo -e "\n${BW}HELP${NC}\n"
        echo -e "${BY}Script related${NC}"
        echo -e "   ${BW}h${NC}  Display Help"
        echo -e "   ${BW}a${NC}  Hide Art"
        echo -e "   ${BW}n${NC}  Run script normally (No arguments / Defaults) and execute additional argumentss"
        echo -e "   ${BW}l${NC}  Use one log file for errors and output"

        echo -e "${BC}Repository related${NC}"
        echo -e "   ${BW}s${NC}  Update Self"
        echo -e "   ${BW}c${NC}  Clone repository"

        echo -e "${BP}File management related${NC}"
        echo -e "   ${BW}F${NC}  Copy configs & manage files"
        echo -e "   ${BW}X${NC}  Clean-up files ( logs | temps | cache )"
        echo -e "   ${BW}U${NC}  Update all dependencies"
        echo -e "   ${BW}S${NC}  Update system dependencies"
        echo -e "   ${BW}G${NC}  Update global dependencies"
        echo -e "   ${BW}L${NC}  Update package dependencies"
        echo -e "   ${BW}Y${NC}  Try to update package dependencies using Yarn"

        echo -e "${BG}Run related${NC}"
        echo -e "   ${BW}r${NC}  Start or restart"
        echo -e "   ${BW}t${NC}  Tail logs"
        echo -e "\n"
        exit 0
    fi



    #! Stop processes
    if [[ "$exist" = true ]]; then
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$UPDATE_SYS" = true || "$UPDATE_GLB" = true || "$UPDATE_LOC" = true || "$FILES" = true || "$NORMAL" = true ]]; then
            echo -e "\n${BR}================================= STOPPING APOLLO =================================${NC}"
            forever stop $repoName/index.js
            if [[ $? != 0 ]]; then
                echo -e "\n${BR}No instances running right now${NC}"
            else
                echo -e "\n${BR}[STOP]${NC} Stopped running instances"
            fi
            echo -e "${BR}===================================== STOPPED =====================================${NC}"
        fi
    fi



    if [[ "$exist" = true ]]; then
        echo -e "\n${BY}=================================== SAVING LOGS ===================================${NC}"
            createTemp
            # Loop through log files and move them to $tempFolder
            for file in $repoName/apollo_*.log; do
                if [[ "$file" != "$logName" && "$file" != "$errLogName" ]]; then
                    mv "$file" "$tempFolder/" && echo "moved '$file' to '$tempFolder'"
                fi
            done
        echo -e "${BY}=================================== SAVED LOGS ====================================${NC}"
    fi



    #! Clone / Update
    if [[ "$CLONE" = true || "$NORMAL" = true ]]; then
        if [[ "$exist" = true ]]; then
            echo -e "\n${BC}================================= UPDATING APOLLO =================================${NC}"
        else
            echo -e "\n${BC}================================= CLONING APOLLO ==================================${NC}"
        fi

        # Install git if missing
        if [[ ! command -v git &>/dev/null ]]; then
            echo -e "${RP}Installing git...${NC}"
            sudo apt-get -y update
            sudo apt-get -y install git
        fi

        if [[ "$exist" = true ]]; then
            echo -e "${RC}Pulling repository...${NC}"
            cd $repoName
            git pull origin main
            cd ..
        else
            echo -e "${RC}Cloning repository...${NC}"
            git clone https://github.com/Jed556/Apollo.git
        fi

        if [[ "$exist" = true ]]; then
            echo -e "${BC}================================= UPDATED APOLLO ==================================${NC}"
        else
            echo -e "${BC}===================================== CLONED ======================================${NC}"
        fi
    fi



    #! Clean up
    if [[ "$CLEAN" = true ]]; then
        echo -e "\n${BR}================================= REMOVING FILES ==================================${NC}"
        rm -d -r $tempFolder && echo -e "removed '$tempFolder'"
        echo -e "${BR}================================= REMOVED FILES ===================================${NC}"
    fi



    #! Copy necessary files
    if [[ "$FILES" = true || "$NORMAL" = true ]]; then
        echo -e "\n${BY}================================== COPYING FILES ==================================${NC}"
        cp -v .env $repoName
        cp -v client.json $repoName/config
        cp -v distube.json $repoName/config
        cp -v database.json $repoName/config
        echo -e "${BY}===================================== COPIED ======================================${NC}"
    fi



    #! Install dependencies
    if [[ "$UPDATE" = true || "$UPDATE_SYS" = true || "$UPDATE_GLB" = true || "$UPDATE_LOC" = true || "$NORMAL" = true ]]; then
        echo -e "\n${BP}============================= INSTALLING DEPENDENCIES =============================${NC}"
        cd $repoName


        #! Update system related dependencies
        if [[ "$UPDATE_SYS" = true || "$UPDATE" = true || "$NORMAL" = true ]]; then
            # Update APT
            echo -e "\n${BP}APT Update${NC}"
            sudo apt -y update

            # Update Git
            echo -e "\n${BP}Git Update${NC}"
            sudo apt-get -y install git

            # Install FFMPEG
            echo -e "\n${BP}FFMPEG${NC}"
            sudo apt install -y ffmpeg

            # Install Canvas builder
            echo -e "\n${BP}Canvas Builder${RP}   ( build-essential | libcairo2-dev | libpango1.0-dev | libjpeg-dev | libgif-dev | librsvg2-dev )${NC}"
            sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

            # Install Puppeteer dependencies
            echo -e "\n${BP}Puppeteer Dependencies${NC}"
            sudo apt install -y chromium-browser -y
            # Comment the line below if you don't want to accidentally change the kernel
            sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
        fi


        #! Update global dependencies
        if [[ "$UPDATE_GLB" = true || "$UPDATE" = true || "$NORMAL" = true ]]; then
            echo -e "\n${BP}Node Version Manager${RP}   ( nodejs | npm | yarn )${NC}"
            # Install nvm
            wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
            
            # Use nvm without closing the terminal
            source ~/.bashrc
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
            [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
            nvm install --lts --latest-npm node # Install Node
            [ "$YARN" = true ] && npm i -g yarn npm # Install Yarn if needed

            # Install keep alive dependencies
            echo -e "\n${BP}NPM Global Install${RP}   ( forever | surge | puppeteer )${NC}"
            npm i -g forever surge
            npm i -g puppeteer --unsafe-perm=true -allow-root
        fi


        #! Update local dependencies
        if [[ "$UPDATE_LOC" = true || "$UPDATE" = true || "$NORMAL" = true ]]; then
            if [[ "$YARN" = true ]]; then
                echo -e "\n${BP}Yarn${NC}"
                # Install dependencies using Yarn
                yarn
                # If yarn failed, try npm
                if [[ $? != 0 ]]; then
                    echo -e "\n${RP}Yarn failed. Falling back to npm...${NC}"
                    npm i
                fi
            else
                echo -e "\n${BP}NPM Install${NC}"
                npm i
            fi
        fi

        cd ..
        echo -e "${BP}==================================== INSTALLED ====================================${NC}"
    fi



    #! Create files needed
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NORMAL" = true ]]; then
        echo -e "\n${BY}================================= CREATING FILES ==================================${NC}"
        if [[ "$exist" = true ]]; then
            touch "$repoName/$logName" && echo "created '$logName'"
            touch "$repoName/$errLogName" && echo "created '$errLogName'"
        else
            echo -e "${BR}[ERROR]${NC} No existing $repoName repo in current directory"
            exit 1
        fi
        echo -e "${BY}===================================== CREATED =====================================${NC}"
    fi



    #! Run Apollo
    if [[ "$START" = true || "$CLONE" = true || "$UPDATE" = true || "$FILES" = true || "$NORMAL" = true ]]; then
        echo -e "\n${BG}================================= STARTING APOLLO =================================${NC}"
        cd $repoName
        # Run using forever
        [ "$ONE_LOG" = true ] && errLogName=$logName
        forever start -a -o $logName -e $errLogName index.js
        cd ..
        echo -e "${BG}===================================== ONLINE ======================================${NC}\n"
    fi



    #! Tail logs
    if [[ "$TAIL" = true ]]; then
        echo -e "\n${BG}====================================== TAIL =======================================${NC}"
        tail -n +1 -f "./$repoName/apollo_$today.log"
    fi



    #! Bye
    exit 0
}