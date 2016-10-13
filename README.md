# ezmaster-canvas
Just a simple Http Server, usefull if you need to *ezmasterize* and application with ouput data

## Server configuration

You can configure some server properties in the `Dockerfile`

```
name         -> [String]  Title of HTML view
program
  directory -> [String] App directory
  cmd       -> [String] Command
  opts      -> [Array]  Argument(s) of command
```

## Exemple

**I want to *ezmasterize* `MyApp`**
This is a Java program who copy all files of directory (--input) in another directory (--output)

To run it, the command line is :
```shell
java myApp.jar --input in/ --output out/
``` 
The program is composed of only one file : `myApp.jar`

## Solution

**The Dockerfile will be**

```
# GET node:argon
FROM node:argon

# CREATE APP DIRECTORY
COPY . /app/

# ------------------------------------------------------- #
# INSTALL HERE YOUR PROGRAM DEPENDENCIES (ex below, java) #
# RUN apt-get update                                      #
# RUN apt-get install -y default-jre                      #
# RUN make install                                        #
# ....                                                    #
# ------------------------------------------------------- #
RUN apt-get install -y default-jre
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
  "configPath": "", \
  "dataPath": "/app/input/", \
  "outputPath": "/app/output/", \
  "program": { \
    "directory": "", \
    "cmd": "java", \
    "opts": ["myApp.jar", --input", "/app/input/", "--output", "/app/output/"] \
  } \
}' > /etc/ezmaster.json

# RUN APP SERVER
CMD nodejs index.js
```

## Explanations

*Nodejs Server will execute the command line `ls -alF` in `myApp/` directory*
