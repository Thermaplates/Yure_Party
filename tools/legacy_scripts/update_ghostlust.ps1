$raw = Get-Content 'data\States.json' -Raw
$states = ConvertFrom-Json $raw
$states[13].note = @"
<Custom React Effect>
// Tanker/Resister: Mengurangi damage yang diterima berdasarkan HP yang hilang (Maksimal 75% pengurangan)
if (value > 0) {
  var missingHpRate = 1.0 - (target.hp / target.mhp);
  var reduction = 1.0 - (missingHpRate * 0.75);
  value = Math.floor(value * reduction);
}
</Custom React Effect>

<Custom Confirm Effect>
// Berserker: Menambah damage serangan fisik yang diberikan berdasarkan HP yang hilang (Maksimal 2x lipat)
if (value > 0 && this.isPhysical()) {
  var missingHpRate = 1.0 - (user.hp / user.mhp);
  var bonusDamage = 1.0 + missingHpRate;
  value = Math.floor(value * bonusDamage);
}
</Custom Confirm Effect>
"@

# Tambahkan Trait TGR (Target Rate) sebesar 300% agar musuh lebih sering menyerang Saki
$trait = New-Object PSObject -Property @{
    code = 22
    dataId = 0
    value = 3.0
}
$states[13].traits = @($trait)

$json = ConvertTo-Json $states -Depth 10 -Compress
Set-Content 'data\States.json' $json
