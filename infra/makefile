docker-run:
	cd .. && docker run -d \
		--name firstlane-api \
		--env-file infra/.env.production \
		-p 5000:5000 \
		firstlane-api

docker-build:
	cd .. && docker build -f infra/Dockerfile -t firstlane-api .

docker-stop:
	docker stop firstlane-api

docker-rm:
	docker rm firstlane-api

docker-start:
	docker start firstlane-api


# no change change