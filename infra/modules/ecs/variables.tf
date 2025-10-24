variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "subnet_ids" {
  description = "List of subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "api_target_group_arn" {
  description = "ARN of the API target group"
  type        = string
}

variable "web_target_group_arn" {
  description = "ARN of the web target group"
  type        = string
}

variable "alb_listener_arn" {
  description = "ARN of the ALB listener"
  type        = string
}

variable "api_image" {
  description = "Docker image for API"
  type        = string
}

variable "web_image" {
  description = "Docker image for Web"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "api_cpu" {
  description = "CPU units for API task"
  type        = string
  default     = "256"
}

variable "api_memory" {
  description = "Memory for API task"
  type        = string
  default     = "512"
}

variable "web_cpu" {
  description = "CPU units for Web task"
  type        = string
  default     = "256"
}

variable "web_memory" {
  description = "Memory for Web task"
  type        = string
  default     = "512"
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 1
}

variable "web_desired_count" {
  description = "Desired number of Web tasks"
  type        = number
  default     = 1
}

variable "api_url" {
  description = "API URL for frontend"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for WebSocket connection"
  type        = string
}

variable "api_secrets" {
  description = "Secrets for API container"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}
