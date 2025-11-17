variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, qa, prod)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "api_secrets" {
  description = "Secrets for API container (from AWS Secrets Manager)"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
  
}
