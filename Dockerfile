FROM debian:jessie

RUN apt-get update -y \
	&& apt-get install -y curl bzip2 build-essential python git \
	&& curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh \
	&& apt-get autoremove -y

ADD . /app

WORKDIR /app

CMD ["meteor", "npm", "start"]
