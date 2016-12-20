FROM hypriot/rpi-node:boron

# Create app directory
RUN mkdir -p /opt/ewd3
WORKDIR /opt/ewd3

# Install app dependencies
COPY package.json /opt/ewd3
RUN npm install

# Bundle app source
COPY . /opt/ewd3


RUN mkdir /opt/ewd3/www
RUN mkdir /opt/ewd3/www/ewd-xpress-monitor

RUN cd /opt/ewd3/node_modules/ewd-xpress-monitor/www

RUN cp /opt/ewd3/node_modules/ewd-xpress-monitor/www/bundle.js /opt/ewd3/www/ewd-xpress-monitor
RUN cp /opt/ewd3/node_modules/ewd-xpress-monitor/www/*.html /opt/ewd3/www/ewd-xpress-monitor
RUN cp /opt/ewd3/node_modules/ewd-xpress-monitor/www/*.css /opt/ewd3/www/ewd-xpress-monitor

EXPOSE 8080
CMD [ "npm", "start" ]