$url = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
$zipPath = 'python.zip'
$extractPath = 'python'

Invoke-WebRequest -Uri $url -OutFile $zipPath
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
