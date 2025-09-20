# Gerar certificado SSL auto-assinado para localhost
$certParams = @{
    Subject = "CN=localhost"
    DnsName = @("localhost", "127.0.0.1")
    CertStoreLocation = "Cert:\CurrentUser\My"
    KeyUsage = "DigitalSignature", "KeyEncipherment"
    KeyAlgorithm = "RSA"
    KeyLength = 2048
    NotAfter = (Get-Date).AddYears(1)
    Type = "SSLServerAuthentication"
}

Write-Host "Gerando certificado SSL auto-assinado..."
$cert = New-SelfSignedCertificate @certParams

# Exportar certificado e chave privada
$certPath = ".\cert.pem"
$keyPath = ".\key.pem"

# Exportar certificado
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
$certBase64 = [System.Convert]::ToBase64String($certBytes)
$certPem = "-----BEGIN CERTIFICATE-----`n"
$certPem += ($certBase64 -replace '(.{64})', '$1`n')
$certPem += "`n-----END CERTIFICATE-----"
$certPem | Out-File -FilePath $certPath -Encoding ascii

Write-Host "Certificado criado: $certPath"

# Para a chave privada, vamos usar uma abordagem diferente
# Criar um certificado PFX temporário e extrair a chave
$pfxPath = ".\temp.pfx"
$pfxPassword = ConvertTo-SecureString -String "temp123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pfxPassword

# Usar openssl se disponível, senão criar um script alternativo
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
if ($opensslPath) {
    & openssl pkcs12 -in $pfxPath -nocerts -out $keyPath -nodes -password pass:temp123
    Remove-Item $pfxPath -Force
} else {
    Write-Host "OpenSSL não encontrado. Usando abordagem alternativa..."
    # Criar arquivo de chave usando .NET
    $rsa = [System.Security.Cryptography.RSACryptoServiceProvider]::new()
    $rsa.FromXmlString($cert.PrivateKey.ToXmlString($true))
    $keyBytes = $rsa.ExportRSAPrivateKey()
    $keyBase64 = [System.Convert]::ToBase64String($keyBytes)
    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $keyPem += ($keyBase64 -replace '(.{64})', '$1`n')
    $keyPem += "`n-----END RSA PRIVATE KEY-----"
    $keyPem | Out-File -FilePath $keyPath -Encoding ascii
    Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Chave privada criada: $keyPath"
Write-Host "Certificados SSL criados com sucesso!"
Write-Host ""
Write-Host "IMPORTANTE: Como este é um certificado auto-assinado, você precisará:"
Write-Host "1. Aceitar o aviso de segurança no navegador ao acessar https://localhost:8765"
Write-Host "2. Ou adicionar uma exceção de segurança para localhost"