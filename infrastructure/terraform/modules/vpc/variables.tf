variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs_app" {
  description = "CIDR blocks for private app subnets"
  type        = list(string)
}

variable "private_subnet_cidrs_data" {
  description = "CIDR blocks for private data subnets"
  type        = list(string)
}
