# Infraestructura base con Terraform

## Estructura

- `main.tf` y `variables.tf`: entrypoint y variables globales
- `modules/`: módulos reutilizables (network, ecr, ecs)
- `environments/`: archivos de variables por entorno (`dev.tfvars`, `prod.tfvars`)

## Uso rápido

1. Inicializa Terraform:
   ```sh
   terraform init
   ```
2. Previsualiza cambios para un entorno:
   ```sh
   terraform plan -var-file="environments/dev.tfvars"
   ```
3. Aplica cambios:
   ```sh
   terraform apply -var-file="environments/dev.tfvars"
   ```

Cambia `dev.tfvars` por `prod.tfvars` para producción.

**Recuerda:** agrega tus credenciales AWS antes de aplicar.
