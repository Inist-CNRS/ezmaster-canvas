# ezmaster-canvas
Just a simple Http Server, usefull if you need to *ezmasterize* and application with ouput data

## Server configuration

You can configure some server properties in the `Dockerfile`

```
httpPort    -> [String] HTTP port (only 3000 allowed)
configPath  -> [String] Path of your App config file
dataPath    -> [String] Path of your App data repository (input)
outputPath  -> [String] Path of your App data repository (output)
program     -> [Object] Informations about the CommandLine program
  directory -> [String] App directory
  cmd       -> [String] Command
  opts      -> [Array]  Argument(s) of command
```

## Exemple

**I want to *ezmasterize* `MyApp`**
This is a very simple Java program, it copy all files of a given directory (--input) in another directory (--output)

To run it, the command line is :
```shell
java myApp.jar --input in/ --output out/
``` 
The program is composed of only one file : `myApp.jar`

## Solution

Setp 1 :

**Fork this repository**

Step 2 :

**Copy your program in the forked repository** *(here, myApp.jar)*

Step 3 :

**Update the Dokerfile**
*You just have to update*

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
RUN apt-get update
RUN apt-get install -y default-jre
# ------------------------------------------------------- #

# ------------------------------------------------------- #
# UPDATE HERE YOUR PROGRAM INFORMATIONS                   #
# Check the Readme for more infos                         #
# ------------------------------------------------------- #
RUN echo '{ \
  "httpPort": 3000, \
  "configPath": "/app/config.json", \
  "dataPath": "/app/input/", \
  "outputPath": "/app/output/", \
  "program": { \
    "directory": "/app/", \
    "cmd": "java", \
    "opts": ["myApp.jar", --input", "/app/input/", "--output", "/app/output/"] \
  } \
}' > /etc/ezmaster.json
# ------------------------------------------------------- #

# Install server packages (required)
WORKDIR /app/server
RUN npm install

# 3000 is your web server listening port
EXPOSE 3000

# RUN APP SERVER
CMD nodejs index.js
```
Step 4 :

**Create a config.json (or update yours) at [configPath]** *(here, /app/config.json)*
A name property need to be set in this file, so the server will diplay it as the title of the HTML view.

## Explanations

*Nodejs Server will execute the command line `java myApp.jar --input /app/input/ --output /app/output/` in `/app/` directory*
