#!/bin/bash

echo "Installing production dependencies..."

npm install \
@nestjs/config \
class-validator \
class-transformer \
@nestjs/typeorm \
typeorm \
pg \
@nestjs/jwt \
@nestjs/passport \
passport \
passport-jwt \
bcrypt \
nestjs-pino \
pino \
pino-pretty \
helmet \
@nestjs/throttler \
@nestjs/swagger \
swagger-ui-express\
uuid


echo "Installing dev dependencies..."

npm install -D \
prettier \
eslint \
husky \
lint-staged \
@types/passport-jwt \
@types/bcrypt \
uuid


echo "All dependencies installed successfully ✅"

#Command
# chmod +x install.sh
# sh install.sh