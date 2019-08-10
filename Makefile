dev: 
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.dev.yml up

dev-d:
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

prod:
	docker-compose -f docker-compose.production.yml build
	docker-compose -f docker-compose.production.yml up

prod-d:
	docker-compose -f docker-compose.production.yml build
	docker-compose -f docker-compose.production.yml up -d

prod-down:
	docker-compose -f docker-compose.production.yml down

test:
	make -C ./server test

default: prod
