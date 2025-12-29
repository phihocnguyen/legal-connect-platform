output "ecs_log_group_name" {
  description = "ECS CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "ecs_log_group_arn" {
  description = "ECS CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.ecs.arn
}

output "alb_log_group_name" {
  description = "ALB CloudWatch log group name"
  value       = aws_cloudwatch_log_group.alb.name
}

output "alb_log_group_arn" {
  description = "ALB CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.alb.arn
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}
