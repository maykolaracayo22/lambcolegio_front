# Test de sistema de pagos

$baseUrl = "http://localhost:3001/api/payments"
$headers = @{ 'Content-Type' = 'application/json' }

Write-Host "`n1. Creando referencia de pago..."
$body = @{
    amount = 150
    studentId = "EST123"
    concept = "Mensualidad Noviembre"
} | ConvertTo-Json

$payment = Invoke-RestMethod -Uri "$baseUrl/reference" -Method Post -Headers $headers -Body $body
Write-Host "Referencia creada:" -ForegroundColor Green
$payment | ConvertTo-Json

Write-Host "`n2. Consultando referencia..."
$reference = Invoke-RestMethod -Uri "$baseUrl/reference/$($payment.id)" -Method Get
Write-Host "Estado de referencia:" -ForegroundColor Green
$reference | ConvertTo-Json

Write-Host "`n3. Confirmando pago..."
$confirmation = Invoke-RestMethod -Uri "$baseUrl/confirm/$($payment.id)" -Method Post
Write-Host "Confirmación:" -ForegroundColor Green
$confirmation | ConvertTo-Json

Write-Host "`n4. Listando todos los pagos..."
$list = Invoke-RestMethod -Uri "$baseUrl/list" -Method Get
Write-Host "Lista de pagos:" -ForegroundColor Green
$list | ConvertTo-Json