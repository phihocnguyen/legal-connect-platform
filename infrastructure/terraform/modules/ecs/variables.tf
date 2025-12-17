variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ARN of ECS task execution role"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ARN of ECS task role"
  type        = string
}

variable "alb_target_group_arn" {
  description = "ARN of ALB target group"
  type        = string
}

variable "backend_image" {
  description = "Docker image for backend"
  type        = string
}

variable "backend_cpu" {
  description = "CPU units for backend"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired count of backend tasks"
  type        = number
  default     = 2
}

variable "backend_container_port" {
  description = "Backend container port"
  type        = number
  default     = 8080
}

variable "db_endpoint" {
  description = "Database endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "s3_bucket_pdfs" {
  description = "S3 bucket for PDFs"
  type        = string
}

variable "s3_bucket_avatars" {
  description = "S3 bucket for avatars"
  type        = string
}

variable "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}

# OAuth2 Configuration Variables
variable "google_client_id" {
  description = "Google OAuth2 Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth2 Client Secret"
  type        = string
  sensitive   = true
}

variable "google_oauth_scope" {
  description = "Google OAuth2 Scope"
  type        = string
  default     = "openid,profile,email"
}

variable "backend_url" {
  description = "Backend URL for OAuth redirect"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for OAuth callback"
  type        = string
}

# Additional Application Variables
variable "cloudinary_cloud_name" {
  description = "Cloudinary cloud name"
  type        = string
  default     = ""
}

variable "cloudinary_api_key" {
  description = "Cloudinary API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudinary_api_secret" {
  description = "Cloudinary API secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins"
  type        = string
  default     = ""
}

# Redis Configuration
variable "redis_host" {
  description = "Redis host"
  type        = string
  default     = ""
}

variable "redis_port" {
  description = "Redis port"
  type        = string
  default     = "6379"
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
  default     = ""
}

# Frontend Configuration Variables
variable "frontend_image" {
  description = "Docker image for frontend"
  type        = string
}

variable "frontend_cpu" {
  description = "CPU units for frontend"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired count of frontend tasks"
  type        = number
  default     = 2
}

variable "frontend_container_port" {
  description = "Frontend container port"
  type        = number
  default     = 3000
}

variable "alb_frontend_target_group_arn" {
  description = "ARN of ALB target group for frontend"
  type        = string
}

variable "alb_listener_dependency" {
  description = "ALB listener ARN to ensure proper dependency ordering"
  type        = string
}
