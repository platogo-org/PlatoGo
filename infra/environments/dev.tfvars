aws_region = "us-east-1"
environment = "dev"

api_secrets = [
  {
    name      = "DATABASE"
    valueFrom = "arn:aws:ssm:us-east-1:740279881872:parameter/platogo/dev/database-url"
  },
  {
    name      = "JWT_SECRET"
    valueFrom = "arn:aws:ssm:us-east-1:740279881872:parameter/platogo/dev/jwt-secret"
  },
  {
    name      = "JWT_EXPIRES_IN"
    valueFrom = "arn:aws:ssm:us-east-1:740279881872:parameter/platogo/dev/jwt-expires-in"
  }
]