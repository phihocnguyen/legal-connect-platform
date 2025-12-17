output "ecs_task_execution_role_arn" {
  description = "ARN of ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN of ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

output "rds_monitoring_role_arn" {
  description = "ARN of RDS monitoring role"
  value       = aws_iam_role.rds_monitoring.arn
}
