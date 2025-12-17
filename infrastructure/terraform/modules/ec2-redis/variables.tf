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

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for Redis instance (should be private subnet)"
  type        = string
}

variable "ecs_security_group_id" {
  description = "ECS security group ID (to allow Redis access)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for Redis"
  type        = string
  default     = "t3.micro"  # FREE TIER eligible
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

variable "enable_elastic_ip" {
  description = "Enable Elastic IP for Redis instance"
  type        = bool
  default     = false
}

variable "key_name" {
  description = "SSH key pair name for EC2 instance (optional - leave empty to use SSM Session Manager)"
  type        = string
  default     = ""
}
