# 🚀 PlatoGo - Deployment Guide

Guía completa para desplegar PlatoGo en AWS usando Docker, ECR, ECS y Terraform.

## 📋 Pre-requisitos

### 1. Herramientas necesarias

- **AWS CLI** configurado con credenciales válidas
- **Docker Desktop** instalado y corriendo
- **Terraform** >= 1.3.0
- **Git** (opcional para control de versiones)

### 2. Verificar instalaciones

```bash
aws --version
docker --version
terraform --version
```

### 3. Configurar AWS CLI

```bash
aws configure
# Ingresa tu AWS Access Key ID
# Ingresa tu AWS Secret Access Key
# Region: us-east-1 (o la que prefieras)
# Output format: json
```

## 🏗️ Arquitectura

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│   Application Load Balancer │
│   (ALB)                      │
└──────┬──────────────────────┘
       │
       ├────────────────┬
       │                │
┌──────▼────┐    ┌──────▼────┐
│  Frontend │    │  Backend  │
│  (Nginx)  │    │  (Node.js)│
│  ECS Task │    │  ECS Task │
└───────────┘    └───────────┘
       │                │
       └────────┬───────┘
                │
        ┌───────▼────────┐
        │   MongoDB      │
        │   Atlas        │
        └────────────────┘
```

## 📦 Paso 1: Crear repositorios ECR con Terraform

Los repositorios ECR se crean automáticamente con Terraform.

### 1.1. Inicializar Terraform

```bash
cd infra
terraform init
```

### 1.2. Crear solo los repositorios ECR primero

```bash
terraform apply -target=module.ecr -var-file=environments/dev.tfvars
```

Esto creará:

- `dev-api` - Repositorio para backend
- `dev-web` - Repositorio para frontend

## 🐳 Paso 2: Buildear y Pushear imágenes Docker a ECR

### Opción A: Usar script automatizado (PowerShell - Windows)

```powershell
# Desde la raíz del proyecto
.\scripts\build-and-push.ps1 -Environment dev -AwsRegion us-east-1 -ImageTag v1.0.0
```

### Opción B: Usar script automatizado (Bash - Linux/Mac)

```bash
# Desde la raíz del proyecto
chmod +x scripts/build-and-push.sh
./scripts/build-and-push.sh dev us-east-1 v1.0.0
```

### Opción C: Manual

#### 2.1. Login a ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

#### 2.2. Build Backend

```bash
cd back
docker build -t dev-api:v1.0.0 .
docker tag dev-api:v1.0.0 <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dev-api:v1.0.0
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dev-api:v1.0.0
```

#### 2.3. Build Frontend

```bash
cd front
docker build -t dev-web:v1.0.0 .
docker tag dev-web:v1.0.0 <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dev-web:v1.0.0
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dev-web:v1.0.0
```

## ⚙️ Paso 3: Configurar Variables de Entorno Sensibles

### 3.1. Crear secretos en AWS Systems Manager Parameter Store

```bash
# MongoDB connection string
aws ssm put-parameter \
  --name "/platogo/dev/database-url" \
  --value "mongodb+srv://user:password@cluster.mongodb.net/platogo" \
  --type SecureString \
  --region us-east-1

# JWT Secret
aws ssm put-parameter \
  --name "/platogo/dev/jwt-secret" \
  --value "your-super-secret-jwt-key" \
  --type SecureString \
  --region us-east-1

# JWT Expires In
aws ssm put-parameter \
  --name "/platogo/dev/jwt-expires-in" \
  --value "90d" \
  --type String \
  --region us-east-1
```

### 3.2. Actualizar `dev.tfvars`

```hcl
# infra/environments/dev.tfvars
aws_region = "us-east-1"
environment = "dev"

api_secrets = [
  {
    name      = "DATABASE"
    valueFrom = "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/platogo/dev/database-url"
  },
  {
    name      = "JWT_SECRET"
    valueFrom = "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/platogo/dev/jwt-secret"
  },
  {
    name      = "JWT_EXPIRES_IN"
    valueFrom = "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/platogo/dev/jwt-expires-in"
  }
]
```

> ⚠️ **Importante**: Reemplaza `<ACCOUNT_ID>` con tu AWS Account ID

## 🚀 Paso 4: Desplegar toda la infraestructura

```bash
cd infra

# Preview de cambios
terraform plan -var-file=environments/dev.tfvars -var="image_tag=v1.0.0"

# Aplicar cambios
terraform apply -var-file=environments/dev.tfvars -var="image_tag=v1.0.0"
```

Esto creará:

- ✅ VPC con subnets públicas
- ✅ Internet Gateway y Route Tables
- ✅ Security Groups
- ✅ Application Load Balancer (ALB)
- ✅ Target Groups
- ✅ ECS Cluster
- ✅ ECS Task Definitions
- ✅ ECS Services

## 📊 Paso 5: Verificar el despliegue

### 5.1. Obtener la URL del ALB

```bash
terraform output alb_dns_name
```

### 5.2. Verificar health checks

```bash
# Health check del API
curl http://<ALB_DNS_NAME>/api/v1/health

# Acceder al frontend
# Abrir en navegador: http://<ALB_DNS_NAME>
```

### 5.3. Ver logs en CloudWatch

```bash
# API logs
aws logs tail /ecs/dev/api --follow --region us-east-1

# Web logs
aws logs tail /ecs/dev/web --follow --region us-east-1
```

## 🔄 Actualizaciones de código

Para deployar nuevos cambios:

### 1. Build y push nuevas imágenes

```powershell
.\scripts\build-and-push.ps1 -Environment dev -ImageTag v1.0.1
```

### 2. Actualizar ECS services

```bash
cd infra
terraform apply -var-file=environments/dev.tfvars -var="image_tag=v1.0.1"
```

### 3. Forzar nuevo deployment (si es necesario)

```bash
aws ecs update-service \
  --cluster dev-cluster \
  --service dev-api-service \
  --force-new-deployment \
  --region us-east-1

aws ecs update-service \
  --cluster dev-cluster \
  --service dev-web-service \
  --force-new-deployment \
  --region us-east-1
```

## 🗑️ Destruir la infraestructura

```bash
cd infra
terraform destroy -var-file=environments/dev.tfvars
```

> ⚠️ **Cuidado**: Esto eliminará todos los recursos en AWS

## 💰 Estimación de costos (us-east-1)

| Recurso                   | Configuración     | Costo estimado/mes |
| ------------------------- | ----------------- | ------------------ |
| ECS Fargate (API)         | 0.25 vCPU, 0.5 GB | ~$10               |
| ECS Fargate (Web)         | 0.25 vCPU, 0.5 GB | ~$10               |
| Application Load Balancer | 1 ALB             | ~$16               |
| Data Transfer             | ~10 GB/mes        | ~$1                |
| CloudWatch Logs           | ~5 GB/mes         | ~$2.50             |
| **Total estimado**        |                   | **~$40/mes**       |

> 💡 MongoDB Atlas tiene un tier gratuito (M0) que puedes usar para desarrollo

## 🐛 Troubleshooting

### Las tareas ECS no inician

- Verificar logs en CloudWatch: `/ecs/dev/api` o `/ecs/dev/web`
- Verificar que las imágenes existen en ECR
- Verificar que los secrets estén configurados correctamente

### Health checks fallan

- Verificar que el backend responda en `/api/v1/health`
- Verificar security groups permitan tráfico del ALB a ECS

### Frontend no puede conectarse al backend

- Verificar variable de entorno `API_URL` en el contenedor web
- Verificar reglas del ALB listener

## 📚 Recursos adicionales

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Soporte

Si encuentras problemas, revisa:

1. CloudWatch Logs
2. ECS Task Events
3. ALB Target Health

---

**Desarrollado con ❤️ para el curso de Desarrollo Colaborativo**
