output "frontend_bucket_id" {
  description = "Frontend S3 bucket ID"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "Frontend S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}

output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_regional_domain_name" {
  description = "Frontend S3 bucket regional domain name"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "pdfs_bucket_id" {
  description = "PDFs S3 bucket ID"
  value       = aws_s3_bucket.pdfs.id
}

output "pdfs_bucket_arn" {
  description = "PDFs S3 bucket ARN"
  value       = aws_s3_bucket.pdfs.arn
}

output "pdfs_bucket_name" {
  description = "PDFs S3 bucket name"
  value       = aws_s3_bucket.pdfs.bucket
}

output "avatars_bucket_id" {
  description = "Avatars S3 bucket ID"
  value       = aws_s3_bucket.avatars.id
}

output "avatars_bucket_arn" {
  description = "Avatars S3 bucket ARN"
  value       = aws_s3_bucket.avatars.arn
}

output "avatars_bucket_name" {
  description = "Avatars S3 bucket name"
  value       = aws_s3_bucket.avatars.bucket
}

output "logs_bucket_id" {
  description = "Logs S3 bucket ID"
  value       = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  description = "Logs S3 bucket ARN"
  value       = aws_s3_bucket.logs.arn
}

output "logs_bucket_name" {
  description = "Logs S3 bucket name"
  value       = aws_s3_bucket.logs.bucket
}
