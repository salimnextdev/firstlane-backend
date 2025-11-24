provider "aws" {
    region = "eu-west-2"
    profile = "jamforte-firstlane"
}

resource "aws_s3_bucket" "firstlane-bucket" {
    bucket = "firstlane-0001-multinvestment"
    force_destroy = true
    tags = {
        Name = "FirstlaneBucket"
        Environment = "Production"
    }
}

resource "aws_s3_bucket_public_access_block" "firstlane-bucket-public-access-block" {
  bucket = aws_s3_bucket.firstlane-bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_iam_user" "firstlane-bucket-user" {
    name = "firstlane-bucket-user"
}

resource "aws_iam_access_key" "firstlane-bucket-user-key" {
    user = aws_iam_user.firstlane-bucket-user.name
}

resource "aws_iam_user_policy" "firstlane-bucket-user-policy" {
  name = "firstlane-bucket-access"
  user = aws_iam_user.firstlane-bucket-user.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ],
        Resource = [
          aws_s3_bucket.firstlane-bucket.arn,
          "${aws_s3_bucket.firstlane-bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.firstlane-bucket.id
  depends_on = [aws_s3_bucket_public_access_block.firstlane-bucket-public-access-block]

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "PublicReadGetObject",
        Effect = "Allow",
        Principal = "*",
        Action = "s3:GetObject",
        Resource = "${aws_s3_bucket.firstlane-bucket.arn}/*"
      }
    ]
  })
}

output "bucket_name" {
    value = aws_s3_bucket.firstlane-bucket.bucket
}

output "bucket_region" {
    value = aws_s3_bucket.firstlane-bucket.region
}

output "access_key_id" {
    value = aws_iam_access_key.firstlane-bucket-user-key.id
}

output "secret_access_key" {
    value = aws_iam_access_key.firstlane-bucket-user-key.secret
    sensitive = true
}