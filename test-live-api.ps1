# Test Profile Update via Live API
# This tests the actual running backend server

Write-Host "=== Live API Database Persistence Test ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Signup/Login
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
    Write-Host "   User: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host ""
    
    # Step 2: Get current profile
    Write-Host "Step 2: Fetching profile from live API..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile fetched!" -ForegroundColor Green
    Write-Host "   College: $($profile.college)" -ForegroundColor Gray
    Write-Host "   Branch: $($profile.branch)" -ForegroundColor Gray
    Write-Host "   CGPA: $($profile.cgpa)" -ForegroundColor Gray
    Write-Host "   Current Skills: $($profile.skills -join ', ')" -ForegroundColor Gray
    Write-Host ""
    
    # Step 3: Update profile
    Write-Host "Step 3: Updating profile via live API..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "HHmmss"
    $testSkill = "Live-API-Test-$timestamp"
    
    # Ensure we're sending all required fields
    $updateBody = @{
        name = $profile.name
        college = if($profile.college) { $profile.college } else { "VIT" }
        branch = if($profile.branch) { $profile.branch } else { "CSE" }
        year = if($profile.year) { $profile.year } else { 2026 }
        cgpa = if($profile.cgpa) { $profile.cgpa } else { 8.5 }
        skills = @($profile.skills) + @($testSkill)
        targetCompanies = if($profile.targetCompanies) { $profile.targetCompanies } else { @("Google") }
        targetRoles = if($profile.targetRoles) { $profile.targetRoles } else { @("SDE") }
        availableHoursPerWeek = 25
        githubUsername = $profile.githubUsername
        leetcodeUsername = $profile.leetcodeUsername
        codeforcesUsername = $profile.codeforcesUsername
    } | ConvertTo-Json -Depth 10
    
    Write-Host "   Adding skill: $testSkill" -ForegroundColor Gray
    
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Put `
        -Body $updateBody `
        -Headers $headers
    
    Write-Host "✅ Profile updated!" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Verify persistence
    Write-Host "Step 4: Re-fetching to verify persistence..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $verifyProfile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile re-fetched!" -ForegroundColor Green
    Write-Host ""
    
    # Check if the test skill persisted
    if ($verifyProfile.skills -contains $testSkill) {
        Write-Host "🎉🎉🎉 SUCCESS! DATA IS PERSISTING IN DATABASE!" -ForegroundColor Green -BackgroundColor Black
        Write-Host ""
        Write-Host "VERIFIED:" -ForegroundColor Green
        Write-Host "  ✅ Profile updates are saving to MongoDB" -ForegroundColor Green
        Write-Host "  ✅ Data persists across API calls" -ForegroundColor Green
        Write-Host "  ✅ The test skill '$testSkill' was found" -ForegroundColor Green
        Write-Host ""
        Write-Host "Current Profile in Database:" -ForegroundColor Cyan
        Write-Host "  Name: $($verifyProfile.name)"
        Write-Host "  College: $($verifyProfile.college)"
        Write-Host "  Branch: $($verifyProfile.branch)"
        Write-Host "  Year: $($verifyProfile.year)"
        Write-Host "  CGPA: $($verifyProfile.cgpa)"
        Write-Host "  Skills ($($verifyProfile.skills.Count)): $($verifyProfile.skills -join ', ')"
        Write-Host "  Companies: $($verifyProfile.targetCompanies -join ', ')"
        Write-Host "  Roles: $($verifyProfile.targetRoles -join ', ')"
    } else {
        Write-Host "❌ WARNING: Test skill not found in re-fetched profile" -ForegroundColor Red
        Write-Host "   Skills returned: $($verifyProfile.skills -join ', ')" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Server response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
