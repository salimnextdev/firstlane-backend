docker-run:
	cd .. && docker run -d \
		--name firstlane-api \
		--env-file ./infra/.env.production \
		-p 5000:3000 \
 		ghcr.io/jamforte-ebenezer/firstlane-api:8426950 

docker-build:
	cd .. && docker build -f infra/Dockerfile -t firstlane-api .

docker-stop:
	docker stop firstlane-api

docker-rm:
	docker rm firstlane-api

docker-start:
	docker start firstlane-api