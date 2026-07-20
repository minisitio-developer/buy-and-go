variable "identifier" {
  description = "RDS instance identifier"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 100
}

variable "max_allocated_storage" {
  description = "Maximum storage in GB for autoscaling"
  type        = number
  default     = 500
}

variable "multi_az" {
  description = "Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "username" {
  description = "Master username"
  type        = string
}

resource "random_password" "password" {
  length  = 24
  special = false
}

resource "aws_db_instance" "main" {
  identifier = var.identifier
  engine     = "postgres"
  engine_version = "16.3"

  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.database_name
  username = var.username
  password = random_password.password.result

  multi_az = var.multi_az

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:05:00-sun:06:00"

  deletion_protection = true
  skip_final_snapshot = false

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.identifier}-subnet-group"
  subnet_ids = data.aws_subnets.private.ids
}

resource "aws_security_group" "rds" {
  name        = "${var.identifier}-sg"
  description = "RDS security group"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "tag:Tier"
    values = ["private"]
  }
}

output "endpoint" {
  value = aws_db_instance.main.endpoint
}

output "password" {
  value     = random_password.password.result
  sensitive = true
}
