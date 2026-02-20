FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

RUN apt-get update \
 && apt-get install -y curl apt-transport-https gnupg \
 && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
 && curl https://packages.microsoft.com/config/debian/10/prod.list \
    > /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev \
 && ln -s /opt/mssql-tools/bin/sqlcmd /usr/bin/sqlcmd \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY DATASET1 ./DATASET1
COPY DATASET2 ./DATASET2
COPY init.sh ./init.sh
RUN chmod +x init.sh

USER mssql