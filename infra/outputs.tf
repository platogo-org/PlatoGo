output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.network.alb_dns_name
}

output "api_url" {
  description = "URL of the API"
  value       = "http://${module.network.alb_dns_name}/api/v1"
}

output "web_url" {
  description = "URL of the Web application"
  value       = "http://${module.network.alb_dns_name}"
}

output "ecr_api_repository_url" {
  description = "ECR repository URL for API"
  value       = module.ecr.api_repository_url
}

output "ecr_web_repository_url" {
  description = "ECR repository URL for Web"
  value       = module.ecr.web_repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "api_service_name" {
  description = "Name of the API ECS service"
  value       = module.ecs.api_service_name
}

output "web_service_name" {
  description = "Name of the Web ECS service"
  value       = module.ecs.web_service_name
}
