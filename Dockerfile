# GET node:argon
FROM node:argon

# CREATE APP DIRECTORY
COPY . /app/

# ------------------------------------------------------- #
# INSTALL HERE YOUR PROGRAM DEPENDENCIES (ex below, java) #
# Think about apt-get update befor apt-get install        #
# RUN apt-get update                                      #
# RUN apt-get install -y default-jre                      #
# RUN make install                                        #
# ....                                                    #
# ------------------------------------------------------- #

# Install server packages (required)
WORKDIR /app/server
RUN npm install

# 3000 is your web server listening port
EXPOSE 3000

# Adapt configPath & dataPath if you need it !
# Check the Readme for more infos
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

# RUN APP SERVER
CMD nodejs index.js