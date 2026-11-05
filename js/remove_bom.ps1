$path = 'plugins.js'
$text = [IO.File]::ReadAllText($path)
$utf8NoBom = New-Object System.Text.UTF8Encoding $False
[IO.File]::WriteAllText($path, $text, $utf8NoBom)
