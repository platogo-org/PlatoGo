# Script para buildear y pushear imágenes Docker a AWS ECR (Windows)

param(
    [string]$Environment = "dev",
    [string]$AwsRegion = "us-east-1",
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Docker build and push process..." -ForegroundColor Green
Write-Host "Environment: $Environment"
Write-Host "Region: $AwsRegion"
Write-Host "Image Tag: $ImageTag"

# Obtener el Account ID
Write-Host "`nGetting AWS Account ID..." -ForegroundColor Yellow
$AwsAccountId = aws sts get-caller-identity --query Account --output text
Write-Host "AWS Account ID: $AwsAccountId"

# Nombres de los repositorios ECR
$ApiRepo = "$Environment-api"
$WebRepo = "$Environment-web"

# URLs completas de ECR
$ApiImage = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/${ApiRepo}:$ImageTag"
$WebImage = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/${WebRepo}:$ImageTag"

Write-Host "`nStep 1: Login to ECR" -ForegroundColor Yellow
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

Write-Host "`nStep 2: Building API image" -ForegroundColor Yellow
docker build -t "${ApiRepo}:$ImageTag" .\back
docker tag "${ApiRepo}:$ImageTag" $ApiImage

Write-Host "`nStep 3: Pushing API image" -ForegroundColor Yellow
docker push $ApiImage

Write-Host "`nStep 4: Building Web image" -ForegroundColor Yellow
docker build -t "${WebRepo}:$ImageTag" .\front
docker tag "${WebRepo}:$ImageTag" $WebImage

Write-Host "`nStep 5: Pushing Web image" -ForegroundColor Yellow
docker push $WebImage

Write-Host "`n✅ Docker images successfully pushed to ECR!" -ForegroundColor Green
Write-Host "API Image: $ApiImage"
Write-Host "Web Image: $WebImage"

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update infra\environments\$Environment.tfvars if needed"
Write-Host "2. Run: cd infra; terraform apply -var-file=environments\$Environment.tfvars -var=`"image_tag=$ImageTag`""
