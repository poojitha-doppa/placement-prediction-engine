# Test Profile Update - PowerShell Script
# This script tests the complete profile update flow

Write-Host "=== Profile Update Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "poojithadoppa8@gmail.com"
    password = "Poojitha@2006"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful! Token received." -ForegroundColor Green
    Write-Host ""
    
    # Step 2: Get current profile
    Write-Host "Step 2: Fetching current profile..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile fetched successfully!" -ForegroundColor Green
    Write-Host "Name: $($profile.name)" -ForegroundColor Gray
    Write-Host "Email: $($profile.email)" -ForegroundColor Gray
    Write-Host "College: $($profile.college)" -ForegroundColor Gray
    Write-Host "Skills: $($profile.skills -join ', ')" -ForegroundColor Gray
    Write-Host ""
    
    # Step 3: Update profile with new data
    Write-Host "Step 3: Updating profile (adding 'API Testing' skill)..." -ForegroundColor Yellow
    
    $updateBody = @{
        name = $profile.name
        college = if ($profile.college) { $profile.college } else { "Test College" }
        branch = if ($profile.branch) { $profile.branch } else { "Computer Science" }
        year = if ($profile.year) { $profile.year } else { 2026 }
        cgpa = if ($profile.cgpa) { $profile.cgpa } else { 8.5 }
        skills = @($profile.skills) + @("API Testing - $(Get-Date -Format 'HH:mm:ss')")
        targetCompanies = if ($profile.targetCompanies) { $profile.targetCompanies } else { @("Google", "Microsoft") }
        targetRoles = if ($profile.targetRoles) { $profile.targetRoles } else { @("Software Engineer") }
        availableHoursPerWeek = 20
        githubUsername = $profile.githubUsername
        leetcodeUsername = $profile.leetcodeUsername
        codeforcesUsername = $profile.codeforcesUsername
    } | ConvertTo-Json
    
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Put `
        -Body $updateBody `
        -Headers $headers
    
    Write-Host "✅ Profile updated successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Verify the update
    Write-Host "Step 4: Verifying update by re-fetching profile..." -ForegroundColor Yellow
    
    $verifyProfile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile re-fetched!" -ForegroundColor Green
    Write-Host "Updated Skills: $($verifyProfile.skills -join ', ')" -ForegroundColor Gray
    Write-Host ""
    
    # Check if update persisted
    $lastSkill = $verifyProfile.skills[-1]
    if ($lastSkill -like "*API Testing*") {
        Write-Host "✅✅✅ SUCCESS! Profile updates are working correctly!" -ForegroundColor Green -BackgroundColor Black
        Write-Host "The 'API Testing' skill was successfully added and persisted." -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Could not verify if the update persisted." -ForegroundColor Yellow
        Write-Host "Last skill: $lastSkill" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Details:" -ForegroundColor Gray
    Write-Host $_.Exception -ForegroundColor Gray
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Server response:" -ForegroundColor Gray
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
