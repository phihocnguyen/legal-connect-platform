variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "alb_target_group_arn" {
  description = "ARN of ALB target group for alarms"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name for alarms"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name for alarms"
  type        = string
}

variable "rds_instance_id" {
  description = "RDS instance ID for alarms"
  type        = string
}

variable "alarm_email" {
  description = "Email address for alarm notifications"
  type        = string
}
