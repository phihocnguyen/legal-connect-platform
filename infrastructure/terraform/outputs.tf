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
  value       = module.cloudfront.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.cloudfront_distribution_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
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
  value       = module.s3.frontend_bucket_name
}

output "pdfs_bucket_name" {
  description = "S3 bucket name for PDFs"
  value       = module.s3.pdfs_bucket_name
}

output "avatars_bucket_name" {
  description = "S3 bucket name for avatars"
  value       = module.s3.avatars_bucket_name
}
