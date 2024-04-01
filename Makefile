# Define variables
COMPOSE=docker-compose

# Default target
.PHONY: help
help:
	@echo "Usage:"
	@echo "  make up           - Run docker-compose up"
	@echo "  make down         - Stop and remove containers"

# Target to run docker-compose up
.PHONY: up
up:
	$(COMPOSE) up -d

# Target to stop and remove containers
.PHONY: down
down:
	$(COMPOSE) down