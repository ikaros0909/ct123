$content = Get-Content 'app\page.tsx'
$section = $content[520..542] -join "`n"
$section | Out-File test-snippet.txt