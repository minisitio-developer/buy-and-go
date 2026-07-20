variable "buckets" {
  description = "List of S3 bucket names"
  type        = list(string)
}

resource "aws_s3_bucket" "buckets" {
  for_each = toset(var.buckets)
  bucket   = each.key
}

resource "aws_s3_bucket_versioning" "versioning" {
  for_each = aws_s3_bucket.buckets
  bucket   = each.value.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  for_each = aws_s3_bucket.buckets
  bucket   = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  for_each = aws_s3_bucket.buckets
  bucket   = each.value.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_names" {
  value = [for b in aws_s3_bucket.buckets : b.id]
}

output "bucket_arns" {
  value = [for b in aws_s3_bucket.buckets : b.arn]
}
