# GET node:argon
FROM node:argon

# ------------------------------------------------------- #
# INSTALL HERE YOUR PROGRAM DEPENDENCIES (ex below, java) #
# Think about apt-get update befor apt-get install        #
# RUN apt-get update                                      #
# RUN apt-get install -y default-jre                      #
# RUN make install                                        #
# ....                                                    #
# ------------------------------------------------------- #

# ------------------------------------------------------- #
# UPDATE HERE THE CONFIGURATION OF YOUR PROGRAM           #
# Check the Readme for more infos                         #
# ------------------------------------------------------- #
RUN echo '{ \
  "httpPort": 3000, \
  "configPath": "/app/config.json", \
  "dataPath": "/app/input/", \
  "outputPath": "/app/output/", \
  "program": { \
    "directory": "", \
    "cmd": "ls", \
    "opts": ["-alF"] \
  } \
}' > /etc/ezmaster.json
# ------------------------------------------------------- #

# INSTALLATION OF YOUR PROGRAM & THE HTTP SERVER
# IT IS ADVISED TO NOT TOUCH IT

# CREATE APP DIRECTORY
COPY . /app/

# Install server packages (required)
WORKDIR /app/server
RUN npm install

# 3000 is your web server listening port
EXPOSE 3000

# RUN APP SERVER
CMD nodejs index.js