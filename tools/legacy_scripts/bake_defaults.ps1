$content = Get-Content 'js\plugins.js' -Raw
$startIndex = $content.IndexOf('[')
$endIndex = $content.LastIndexOf(']')
$jsonText = $content.Substring($startIndex, $endIndex - $startIndex + 1)
$plugins = $jsonText | ConvertFrom-Json

function Bake-Plugin {
    param($pluginName, $filePath)
    $plugin = $plugins | Where-Object { $_.name -eq $pluginName }
    if (-not $plugin) {
        Write-Host "Plugin $pluginName not found"
        return
    }
    
    $fileContent = Get-Content $filePath -Raw
    
    foreach ($prop in $plugin.parameters.psobject.properties) {
        $key = $prop.Name
        $val = $prop.Value
        if ([string]::IsNullOrWhiteSpace($val)) { continue }
        
        $safeKey = [regex]::Escape($key)
        
        $pattern1 = "(parameters\['$safeKey'\]\s*\|\|\s*)([^\);,\n\}]+)"
        $fileContent = [regex]::Replace($fileContent, $pattern1, {
            param($match)
            $p1 = $match.Groups[1].Value
            $p2 = $match.Groups[2].Value.Trim()
            
            $newVal = $val
            if ($p2.StartsWith("'") -or $p2.StartsWith('"')) {
                $quote = $p2.Substring(0, 1)
                $newVal = "$quote$val$quote"
            } elseif ($p2 -eq 'true' -or $p2 -eq 'false') {
                $newVal = $val.ToLower()
            } elseif (-not [double]::TryParse($p2, [ref]0) -and -not ($p2 -eq 'true') -and -not ($p2 -eq 'false')) {
                if ([double]::TryParse($val, [ref]0)) {
                    $newVal = $val
                } else {
                    $newVal = "'$val'"
                }
            } else {
                $newVal = $val
            }
            return "$p1$newVal"
        })
        
        $pattern2 = "(parameters\[`"$safeKey`"\]\s*\|\|\s*)([^\);,\n\}]+)"
        $fileContent = [regex]::Replace($fileContent, $pattern2, {
            param($match)
            $p1 = $match.Groups[1].Value
            $p2 = $match.Groups[2].Value.Trim()
            
            $newVal = $val
            if ($p2.StartsWith("'") -or $p2.StartsWith('"')) {
                $quote = $p2.Substring(0, 1)
                $newVal = "$quote$val$quote"
            } elseif ($p2 -eq 'true' -or $p2 -eq 'false') {
                $newVal = $val.ToLower()
            } elseif (-not [double]::TryParse($p2, [ref]0) -and -not ($p2 -eq 'true') -and -not ($p2 -eq 'false')) {
                if ([double]::TryParse($val, [ref]0)) {
                    $newVal = $val
                } else {
                    $newVal = "'$val'"
                }
            } else {
                $newVal = $val
            }
            return "$p1$newVal"
        })
    }
    
    Set-Content -Path $filePath -Value $fileContent
    Write-Host "Baked $pluginName"
}

Bake-Plugin -pluginName "MOG_SceneMenu" -filePath "js\plugins\MOG_SceneMenu.js"
Bake-Plugin -pluginName "Custom_SaveStatus_MOG" -filePath "js\plugins\Custom_SaveStatus_MOG.js"
