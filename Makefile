api-development: 
	docker-compose -f docker-compose.api-development.yml build
	docker-compose -f docker-compose.api-development.yml up

api-development-detach: 
	docker-compose -f docker-compose.api-development.yml build
	docker-compose -f docker-compose.api-development.yml up -d

api-development-down:
	docker-compose -f docker-compose.api-development.yml down

production:
	docker-compose -f docker-compose.production.yml build
	docker-compose -f docker-compose.production.yml up

production-down:
	docker-compose -f docker-compose.production.yml down

test:
	make -C ./api-server test
	make -C ./web-server test

web-development:
	docker-compose -f docker-compose.web-development.yml build
	docker-compose -f docker-compose.web-development.yml up -d
	make -C ./web-server development

web-development-down:
	docker-compose -f docker-compose.web-development.yml down

default: production
