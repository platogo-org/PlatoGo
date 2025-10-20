resource "aws_ecr_repository" "api" {
  name = "${var.environment}-api"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}

resource "aws_ecr_repository" "web" {
  name = "${var.environment}-web"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}
