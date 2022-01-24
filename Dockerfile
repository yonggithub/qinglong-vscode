FROM linuxserver/code-server:3.12.0
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    LANG=zh_CN.UTF-8 \
    SHELL=/bin/bash 
WORKDIR /ql
#ADD sources.list /etc/apt/
#set aliyun source for debian
RUN sed -i s/deb.debian.org/mirrors.aliyun.com/g /etc/apt/sources.list
RUN apt-get clean
RUN apt-get update

RUN apt-get update && apt-get install wget -y && apt-get install -y vim nginx cron && apt-get autoremove && apt-get clean && rm -rf /var/lib/apt/lists/*
#install python3
RUN apt update && apt install software-properties-common -y && add-apt-repository ppa:deadsnakes/ppa -y && apt install python3.8 -y && apt install python3-pip -y && ln -s /usr/bin/python3 /usr/bin/python
#ENV LANG C.UTF-8
ENV LANG zh_CN.utf8

COPY . . 

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && touch ~/.bashrc \
    && cd /ql \
    && cp -f .env.example .env \
    && chmod 777 /ql/shell/*.sh \
    && chmod 777 /ql/docker/*.sh \
    && npm install -g pnpm \
    && pnpm install -g pm2 \
    && pnpm install -g ts-node typescript tslib \
    && rm -rf /root/.npm \
    && pnpm install --prod \
    && rm -rf /root/.pnpm-store 


ENTRYPOINT ["./docker-entrypoint.sh"]
