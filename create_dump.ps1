$outputFile = "claude_context.txt"
$filesToInclude = @(
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    ".env.local",
    ".env"
)

Remove-Item -Path $outputFile -ErrorAction SilentlyContinue

Add-Content -Path $outputFile -Value "# FIFA 2026 Globe Project Complete Context"
Add-Content -Path $outputFile -Value ""

foreach ($file in $filesToInclude) {
    if (Test-Path $file) {
        Add-Content -Path $outputFile -Value "## File: $file"
        Add-Content -Path $outputFile -Value "````"
        Get-Content -LiteralPath $file | Add-Content -Path $outputFile
        Add-Content -Path $outputFile -Value "````"
        Add-Content -Path $outputFile -Value ""
    }
}

$srcFiles = Get-ChildItem -LiteralPath .\src, .\prisma, .\public -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in @(".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".prisma") -or $_.Name -eq "schema.prisma" }

foreach ($file in $srcFiles) {
    $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1).Replace('\', '/')
    Add-Content -Path $outputFile -Value "## File: $relativePath"
    Add-Content -Path $outputFile -Value "````"
    Get-Content -LiteralPath $file.FullName | Add-Content -Path $outputFile
    Add-Content -Path $outputFile -Value "````"
    Add-Content -Path $outputFile -Value ""
}

Write-Host "Done"
