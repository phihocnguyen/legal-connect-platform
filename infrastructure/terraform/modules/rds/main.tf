# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-db-params"
  family = var.db_engine == "mysql" ? "mysql8.0" : (
    tonumber(split(".", var.db_engine_version)[0]) >= 17 ? "postgres17" :
    tonumber(split(".", var.db_engine_version)[0]) >= 16 ? "postgres16" :
    tonumber(split(".", var.db_engine_version)[0]) >= 15 ? "postgres15" :
    tonumber(split(".", var.db_engine_version)[0]) >= 14 ? "postgres14" : "postgres13"
  )

  dynamic "parameter" {
    for_each = var.db_engine == "mysql" ? [
      {
        name  = "character_set_server"
        value = "utf8mb4"
      },
      {
        name  = "collation_server"
        value = "utf8mb4_unicode_ci"
      },
      {
        name  = "max_connections"
        value = "200"
      }
    ] : []
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-db-params"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-${var.environment}-db"
  engine         = var.db_engine
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]

  backup_retention_period = var.db_backup_retention
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = var.db_engine == "mysql" ? ["error", "general", "slowquery"] : ["postgresql"]

  performance_insights_enabled = true

  deletion_protection = var.environment == "prod"

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}
