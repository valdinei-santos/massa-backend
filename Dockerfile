FROM node:10-alpine

RUN apk update && apk add --no-cache --update tzdata

# INCLUIDO PARA NGINX
RUN apk update && apk add --no-cache --update nginx
RUN rm /etc/nginx/nginx.conf
COPY ./docker/nginx.conf /etc/nginx/
#COPY ./docker/web.previg.org.br.crt /etc/nginx/certs/
#COPY ./docker/web.previg.org.br.key /etc/nginx/certs/
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log
#VOLUME ["/var/cache/nginx"]

ENV TZ='America/Belem'
RUN echo $TZ > /etc/timezone
RUN cp -r -f /usr/share/zoneinfo/America/Belem /etc/localtime

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./package*.json ./
# Tirei fora por causa do NGINX que precisa de ROOT para rodar
#USER node
RUN npm install

#RUN npm install -D typescript

# Fazendo copia normal porque agora esta usando o ROOT
#COPY --chown=node:node . .
COPY . .

RUN chmod +x start-app.sh

#RUN ln -sf /dev/stdout /home/node/app/logs o/src/app/logs/logfile.log \
#    && ln -sf /dev/stderr /go/src/app/ logs/logfile.log

EXPOSE 80

#CMD [ "npm", "run", "start" ]
CMD [ "sh", "-c", "./start-app.sh" ]
