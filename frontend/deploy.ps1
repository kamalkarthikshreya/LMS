$BucketName = "student-lms-frontend-bucket"
Write-Host "Building project..."
npm run build
Write-Host "Syncing to S3..."
aws s3 sync dist/ s3://$BucketName/ --delete
Write-Host "Deployment Complete!"