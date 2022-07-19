FROM node:17-bullseye

ARG SSH_KEY

ENV DEBIAN_FRONTEND noninteractive

COPY package.json /opt/sd/package.json
COPY src          /opt/sd/src

WORKDIR /opt/sd

RUN ssh-agent sh -c 'echo $SSH_KEY | base64 -d | ssh-add - ; npm install --production'

CMD [ "npm", "start" ]
