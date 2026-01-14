terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # backend "s3" {
  #   bucket         = "legal-connect-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   encrypt        = true
  #   use_lockfile   = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "legal-connect"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs_app = var.private_subnet_cidrs_app
  private_subnet_cidrs_data = var.private_subnet_cidrs_data
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  project_name = var.project_name
  environment  = var.environment
  s3_bucket_arns = []
}

# Security Groups
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  certificate_arn       = var.ssl_certificate_arn
}

# Redis EC2 Instance
module "redis" {
  source = "./modules/ec2-redis"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  vpc_cidr              = var.vpc_cidr
  subnet_id             = module.vpc.private_subnet_ids_data[0]  # Use first private data subnet
  ecs_security_group_id = module.security_groups.ecs_security_group_id
  instance_type         = var.redis_instance_type
  redis_password        = var.redis_password
  key_name              = var.redis_key_name
}

# ECS Cluster and Services
module "ecs" {
  source = "./modules/ecs"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids_app
  ecs_security_group_id      = module.security_groups.ecs_security_group_id
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn          = module.iam.ecs_task_role_arn
  alb_target_group_arn       = module.alb.target_group_arn
  alb_frontend_target_group_arn = module.alb.frontend_target_group_arn
  alb_listener_dependency    = module.alb.http_listener_arn
  
  # Backend configuration
  backend_image            = var.backend_image
  backend_cpu              = var.backend_cpu
  backend_memory           = var.backend_memory
  backend_desired_count    = var.backend_desired_count
  backend_container_port   = var.backend_container_port
  
  # Frontend configuration
  frontend_image           = var.frontend_image
  frontend_cpu             = var.frontend_cpu
  frontend_memory          = var.frontend_memory
  frontend_desired_count   = var.frontend_desired_count
  frontend_container_port  = var.frontend_container_port
  
  # Neon PostgreSQL configuration (external)
  neon_db_host             = var.neon_db_host
  neon_db_port             = var.neon_db_port
  neon_db_name             = var.neon_db_name
  neon_db_username         = var.neon_db_username
  neon_db_password         = var.neon_db_password
  
  # Application configuration
  jwt_secret               = var.jwt_secret
  s3_bucket_pdfs           = "legal-connect-prod-pdfs"
  s3_bucket_avatars        = "legal-connect-prod-avatars"
  
  # OAuth2 configuration
  google_client_id         = var.google_client_id
  google_client_secret     = var.google_client_secret
  google_oauth_scope       = var.google_oauth_scope
  backend_url              = var.backend_url
  frontend_url             = var.frontend_url
  
  # Optional services
  cloudinary_cloud_name    = var.cloudinary_cloud_name
  cloudinary_api_key       = var.cloudinary_api_key
  cloudinary_api_secret    = var.cloudinary_api_secret
  cors_allowed_origins     = var.cors_allowed_origins
  
  # Redis configuration
  redis_host               = module.redis.redis_host
  redis_port               = module.redis.redis_port
  redis_password           = var.redis_password
  
  # ALB DNS for automatic URL generation
  alb_dns_name = module.alb.alb_dns_name
}

# S3 Buckets - Skipped (created manually via AWS CLI)
# CloudFront - Skipped (not currently needed)
# CloudWatch - Skipped (simplified deployment)
