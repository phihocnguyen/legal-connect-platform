output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.alb_dns_name
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = "Not available - CloudFront module skipped"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = "Not available - CloudFront module skipped"
}

output "neon_db_host" {
  description = "Neon PostgreSQL host (external database)"
  value       = var.neon_db_host
}

output "redis_endpoint" {
  description = "Redis EC2 endpoint"
  value       = "${module.redis.redis_host}:${module.redis.redis_port}"
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS backend service name"
  value       = module.ecs.service_name
}

output "ecs_frontend_service_name" {
  description = "ECS frontend service name"
  value       = module.ecs.frontend_service_name
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${module.alb.alb_dns_name}/api"
}

output "frontend_url" {
  description = "Frontend URL (via ALB)"
  value       = "http://${module.alb.alb_dns_name}"
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = "legal-connect-prod-frontend"
}

output "pdfs_bucket_name" {
  description = "S3 bucket name for PDFs"
  value       = "legal-connect-prod-pdfs"
}

output "avatars_bucket_name" {
  description = "S3 bucket name for avatars"
  value       = "legal-connect-prod-avatars"
}
