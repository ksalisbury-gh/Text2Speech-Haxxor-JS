param([Parameter(Mandatory = $true)][string]$voice, [Parameter(Mandatory = $true)][string]$text, [Parameter(Mandatory = $true)][string]$file)
node ".\load.js" $voice $text $file