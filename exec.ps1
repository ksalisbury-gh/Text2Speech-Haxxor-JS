param([Parameter(Mandatory = $true)][string]$voice, [Parameter(Mandatory = $true)][string]$text, [Parameter(Mandatory = $true)][string]$file)
node ".\main.js" $voice $text $file