#!/bin/bash
# Script para buildear y pushear imágenes Docker a AWS ECR

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-dev}
AWS_REGION=${2:-us-east-1}
IMAGE_TAG=${3:-latest}

echo -e "${GREEN}Starting Docker build and push process...${NC}"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Image Tag: $IMAGE_TAG"

# Obtener el Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Nombres de los repositorios ECR
API_REPO="${ENVIRONMENT}-api"
WEB_REPO="${ENVIRONMENT}-web"

# URLs completas de ECR
API_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${API_REPO}:${IMAGE_TAG}"
WEB_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${WEB_REPO}:${IMAGE_TAG}"

echo -e "\n${YELLOW}Step 1: Login to ECR${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo -e "\n${YELLOW}Step 2: Building API image${NC}"
docker build -t ${API_REPO}:${IMAGE_TAG} ./back
docker tag ${API_REPO}:${IMAGE_TAG} ${API_IMAGE}

echo -e "\n${YELLOW}Step 3: Pushing API image${NC}"
docker push ${API_IMAGE}

echo -e "\n${YELLOW}Step 4: Building Web image${NC}"
docker build -t ${WEB_REPO}:${IMAGE_TAG} ./front
docker tag ${WEB_REPO}:${IMAGE_TAG} ${WEB_IMAGE}

echo -e "\n${YELLOW}Step 5: Pushing Web image${NC}"
docker push ${WEB_IMAGE}

echo -e "\n${GREEN}✅ Docker images successfully pushed to ECR!${NC}"
echo "API Image: ${API_IMAGE}"
echo "Web Image: ${WEB_IMAGE}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update infra/environments/${ENVIRONMENT}.tfvars if needed"
echo "2. Run: cd infra && terraform apply -var-file=environments/${ENVIRONMENT}.tfvars -var=\"image_tag=${IMAGE_TAG}\""
