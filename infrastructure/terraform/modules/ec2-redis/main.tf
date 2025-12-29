# EC2 Instance for Redis
# Ultra lightweight setup for cost optimization

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance - t3.micro (FREE TIER eligible)
resource "aws_instance" "redis" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  key_name      = var.key_name  # SSH key pair name
  
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.redis.id]
  associate_public_ip_address = false
  
  # IAM instance profile for CloudWatch logs and SSM
  iam_instance_profile = aws_iam_instance_profile.redis.name

  # User data to install and configure Redis
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    redis_password = var.redis_password
  }))

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30  # 30 GB - minimum required by AMI snapshot
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis"
    Environment = var.environment
    Service     = "Redis"
  }
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for Redis EC2 instance"
  vpc_id      = var.vpc_id

  # Allow Redis port from ECS security group
  ingress {
    description     = "Redis from ECS backend"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  # Allow SSH from VPC ONLY (for emergency maintenance)
  # For normal access, use AWS Systems Manager Session Manager (no SSH key needed)
  ingress {
    description = "SSH from within VPC only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  # Allow all outbound
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  }
}

# IAM Role for EC2
resource "aws_iam_role" "redis" {
  name = "${var.project_name}-${var.environment}-redis-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-role"
  }
}

# Attach CloudWatch policy
resource "aws_iam_role_policy_attachment" "redis_cloudwatch" {
  role       = aws_iam_role.redis.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Attach SSM policy for Session Manager (secure alternative to SSH)
resource "aws_iam_role_policy_attachment" "redis_ssm" {
  role       = aws_iam_role.redis.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "redis" {
  name = "${var.project_name}-${var.environment}-redis-profile"
  role = aws_iam_role.redis.name
}

# Elastic IP (Optional - for static IP)
resource "aws_eip" "redis" {
  count    = var.enable_elastic_ip ? 1 : 0
  instance = aws_instance.redis.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-eip"
  }
}
