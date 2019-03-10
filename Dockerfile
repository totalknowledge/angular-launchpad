FROM node:carbon

WORKDIR /usr/src/app

COPY . .

RUN apt update
RUN apt dist-upgrade -y
RUN apt install dos2unix python-pip -y
RUN pip install -r requirements.txt
RUN find . -type f -exec dos2unix {} \;
RUN npm install -g @angular/cli
RUN npm install --silent
RUN ng build

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8888
CMD ["npm", "start"]
