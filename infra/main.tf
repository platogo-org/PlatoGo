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

# Network module
module "network" {
  source      = "./modules/network"
  environment = var.environment
}

# ECR module
module "ecr" {
  source      = "./modules/ecr"
  environment = var.environment
}

# ECS module
module "ecs" {
  source = "./modules/ecs"
  
  environment            = var.environment
  aws_region             = var.aws_region
  subnet_ids             = module.network.public_subnet_ids
  ecs_security_group_id  = module.network.ecs_security_group_id
  api_target_group_arn   = module.network.api_target_group_arn
  web_target_group_arn   = module.network.web_target_group_arn
  alb_listener_arn       = module.network.alb_arn
  
  api_image = module.ecr.api_repository_url
  web_image = module.ecr.web_repository_url
  image_tag = var.image_tag
  
  api_url     = "http://${module.network.alb_dns_name}/api/v1"
  alb_dns_name = module.network.alb_dns_name
  
  api_secrets = var.api_secrets
  
  depends_on = [module.network, module.ecr]
}
