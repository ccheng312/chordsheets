# Build:
# docker build -t chordsheets .
#
# Run:
# docker run -it chordsheets
#
# Compose:
# docker-compose up -d

FROM ubuntu:trusty

# 80 = HTTP, 443 = HTTPS, 3000 = app server, 35729 = livereload, 8080 = node-inspector
EXPOSE 80 443 3000 35729 8080

# Set development environment as default and seed data
ENV NODE_ENV=development MONGO_SEED=true

# Install Utilities
RUN apt-get update -q  \
 && apt-get install -yqq curl \
 wget \
 aptitude \
 htop \
 vim \
 git \
 traceroute \
 dnsutils \
 curl \
 ssh \
 tree \
 tcpdump \
 nano \
 psmisc \
 gcc \
 make \
 build-essential \
 libfreetype6 \
 libfontconfig \
 libkrb5-dev \
 ruby \
 sudo \
 apt-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install --quiet -g npm
RUN npm install --quiet -g gulp bower yo mocha karma-cli pm2 && npm cache clean

RUN mkdir -p /opt/chordsheets/public/lib
WORKDIR /opt/chordsheets

# Copies the local package.json file to the container
# and utilities docker container cache to not needing to rebuild
# and install node_modules/ everytime we build the docker, but only
# when the local package.json file changes.
# Install npm packages
COPY package.json /opt/chordsheets/package.json
RUN npm install --quiet && npm cache clean

# Install bower packages
COPY bower.json /opt/chordsheets/bower.json
COPY .bowerrc /opt/chordsheets/.bowerrc
RUN bower install --quiet --allow-root --config.interactive=false

COPY . /opt/chordsheets

# Run server
CMD ["npm", "start"]
