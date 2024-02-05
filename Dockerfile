FROM ubuntu:jammy

WORKDIR /usr/src/app

COPY . .

RUN apt-get update
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get update
RUN apt-get install dos2unix python3-pip nodejs -y
RUN apt-get dist-upgrade -y
RUN /usr/bin/pip install -r requirements.txt
RUN find . -type f -exec dos2unix {} \;
RUN npm install -g @angular/cli > /dev/null
RUN npm install --silent
RUN ng build

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8888
CMD ["./backend.py"]
