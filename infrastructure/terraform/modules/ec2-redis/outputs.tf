output "instance_id" {
  description = "Redis EC2 instance ID"
  value       = aws_instance.redis.id
}

output "private_ip" {
  description = "Redis private IP address"
  value       = aws_instance.redis.private_ip
}

output "redis_endpoint" {
  description = "Redis endpoint (host:port)"
  value       = "${aws_instance.redis.private_ip}:6379"
}

output "security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

output "redis_host" {
  description = "Redis host"
  value       = aws_instance.redis.private_ip
}

output "redis_port" {
  description = "Redis port"
  value       = "6379"
}
