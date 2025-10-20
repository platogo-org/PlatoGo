resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"
}

# Placeholder for ECS services/tasks
