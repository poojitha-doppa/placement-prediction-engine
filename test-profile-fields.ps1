# Test CGPA, LeetCode Solved, and MinPackage Fixes
Write-Host "=== Testing Profile Update Fixes ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Login
    Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
    $loginBody = @{
        email = "poojithadoppa8@gmail.com"
        password = "Poojitha@2006"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host ""
    
    # Get current profile
    Write-Host "Step 2: Getting current profile..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "Current values:" -ForegroundColor Gray
    Write-Host "  CGPA: $($profile.cgpa)" -ForegroundColor Gray
    Write-Host "  LeetCode Solved: $($profile.leetcodeSolved)" -ForegroundColor Gray
    Write-Host "  Min Package (LPA): $($profile.minPackageLPA)" -ForegroundColor Gray
    Write-Host ""
    
    # Update with specific test values
    Write-Host "Step 3: Updating profile with test values..." -ForegroundColor Yellow
    Write-Host "  Setting CGPA = 9.25" -ForegroundColor Cyan
    Write-Host "  Setting LeetCode Solved = 425" -ForegroundColor Cyan
    Write-Host "  Setting Min Package = 18.5 LPA" -ForegroundColor Cyan
    
    $updateBody = @{
        name = $profile.name
        college = $profile.college
        branch = $profile.branch
        year = $profile.year
        cgpa = 9.25
        skills = $profile.skills
        targetCompanies = $profile.targetCompanies
        targetRoles = $profile.targetRoles
        availableHoursPerWeek = 25
        githubUsername = $profile.githubUsername
        leetcodeUsername = $profile.leetcodeUsername
        codeforcesUsername = $profile.codeforcesUsername
        leetcodeSolved = 425
        minPackageLPA = 18.5
    } | ConvertTo-Json -Depth 10
    
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Put `
        -Body $updateBody `
        -Headers $headers
    
    Write-Host "✅ Profile updated!" -ForegroundColor Green
    Write-Host ""
    
    # Verify the update
    Write-Host "Step 4: Verifying the saved values..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $verifyProfile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host ""
    $allPassed = $true
    
    # Check CGPA
    if ($verifyProfile.cgpa -eq 9.25) {
        Write-Host "✅ CGPA: $($verifyProfile.cgpa) - CORRECT!" -ForegroundColor Green
    } else {
        Write-Host "❌ CGPA: $($verifyProfile.cgpa) - WRONG! Expected 9.25" -ForegroundColor Red
        $allPassed = $false
    }
    
    # Check LeetCode Solved
    if ($verifyProfile.leetcodeSolved -eq 425) {
        Write-Host "✅ LeetCode Solved: $($verifyProfile.leetcodeSolved) - CORRECT!" -ForegroundColor Green
    } else {
        Write-Host "❌ LeetCode Solved: $($verifyProfile.leetcodeSolved) - WRONG! Expected 425" -ForegroundColor Red
        $allPassed = $false
    }
    
    # Check Min Package
    if ($verifyProfile.minPackageLPA -eq 18.5) {
        Write-Host "✅ Min Package: $($verifyProfile.minPackageLPA) LPA - CORRECT!" -ForegroundColor Green
    } else {
        Write-Host "❌ Min Package: $($verifyProfile.minPackageLPA) LPA - WRONG! Expected 18.5" -ForegroundColor Red
        $allPassed = $false
    }
    
    Write-Host ""
    if ($allPassed) {
        Write-Host "🎉🎉🎉 ALL TESTS PASSED!" -ForegroundColor Green -BackgroundColor Black
        Write-Host ""
        Write-Host "✅ CGPA is saving correctly" -ForegroundColor Green
        Write-Host "✅ LeetCode Problems Solved is saving correctly" -ForegroundColor Green
        Write-Host "✅ Target Package is saving correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SOME TESTS FAILED - Check the output above" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "You can also verify in Prisma Studio at: http://localhost:5555" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Server response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
