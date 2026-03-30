Write-Host "Zipping Backend files for AWS..."
$exclude = @("node_modules", ".env", ".git", "zip-backend.ps1", "backend-deploy.zip")
Compress-Archive -Path * -DestinationPath backend-deploy.zip -Update -Exclude $exclude
Write-Host "Success! Upload backend-deploy.zip to Elastic Beanstalk."