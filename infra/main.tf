// Terraform main entrypoint

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"
  environment = var.environment
}

module "ecr" {
  source = "./modules/ecr"
  environment = var.environment
}

module "ecs" {
  source = "./modules/ecs"
  environment = var.environment
}
