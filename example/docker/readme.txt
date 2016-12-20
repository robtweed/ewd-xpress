Source is in ~/docker

Build:
cd ~/docker
sudo docker build -t rtweed/ewd-xpress .

Then:

sudo docker run -d --name redis -p 6379:6379 redis
create local directory ~/ewd3/mapped

sudo docker run -d -p 8080:8080 --link redis:redis -v /home/robtweed/ewd3/mapped:/opt/ewd3/mapped rtweed/ewd-xpress


Raspberry Pi:

sudo docker run -d --name redis -p 6379:6379 hypriot/rpi-redis
sudo docker run -d -p 8080:8080 --link redis:redis -v /home/robtweed/ewd3/mapped:/opt/ewd3/mapped rtweed/rpi-ewd-xpress
