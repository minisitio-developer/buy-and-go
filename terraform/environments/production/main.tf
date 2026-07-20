terraform {
  required_version = ">= 1.6"
  backend "s3" {
    bucket = "eventos-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source = "../modules/eks"
  cluster_name    = "eventos-production"
  instance_types  = ["t3.large", "t3.xlarge"]
  gpu_instance_types = ["g4dn.xlarge"]
  desired_nodes   = 5
  min_nodes       = 3
  max_nodes       = 20
}

module "rds" {
  source          = "../modules/rds"
  identifier      = "eventos-production"
  instance_class  = "db.r6g.large"
  allocated_storage = 100
  max_allocated_storage = 500
  multi_az        = true
  database_name   = "eventos"
  username        = "eventos"
}

module "redis" {
  source          = "../modules/redis"
  cluster_id      = "eventos-production"
  node_type       = "cache.r6g.large"
  num_cache_nodes = 2
}

module "s3" {
  source = "../modules/s3"
  buckets = [
    "eventos-media-production",
    "eventos-backups-production",
    "eventos-logs-production",
  ]
}

module "ecr" {
  source = "../modules/ecr"
  repositories = [
    "eventos-ai/identity",
    "eventos-ai/event",
    "eventos-ai/ticket",
    "eventos-ai/checkin",
    "eventos-ai/crm",
    "eventos-ai/sponsor",
    "eventos-ai/payment",
    "eventos-ai/ai",
  ]
}
