variable "cluster_id" {
  description = "ElastiCache cluster ID"
  type        = string
}

variable "node_type" {
  description = "Cache node type"
  type        = string
  default     = "cache.r6g.large"
}

variable "num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = var.cluster_id
  description         = "Redis cluster for EventOS AI"

  node_type            = var.node_type
  num_cache_clusters   = var.num_cache_nodes
  engine               = "redis"
  engine_version       = "7.1"
  port                 = 6379

  automatic_failover_enabled = true
  multi_az_enabled          = var.num_cache_nodes > 1

  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.cluster_id}-subnet-group"
  subnet_ids = data.aws_subnets.private.ids
}

resource "aws_security_group" "redis" {
  name        = "${var.cluster_id}-sg"
  description = "Redis security group"

  ingress {
    from_port   = 6379
    to_port     = 6379
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

output "primary_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "port" {
  value = 6379
}
