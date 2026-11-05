import codecs, re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(path, 'r', 'utf-8-sig') as f:
    text = f.read()

idx = text.find('"Yure_CustomHub"')
param_start = text.find('"parameters":{', idx)
param_end = text.find('}}', param_start) + 2
old_params = text[param_start:param_end]

print("BEFORE:")
for m in re.findall(r'"(Help|Status) [^"]+":"[^"]*"', old_params):
    print(' ', m)

new_params = old_params

# Status Window: X=660, W=320 => covers X=660 to X=980
# Help Window harus ada di SEBELAH KIRI Status Window
# Jadi Help Window: X=510, W=140 (sampai X=650, sebelum status X=660)
# Atau pindahkan Help Window ke bawah Status Window jika ada ruang

# Cara terbaik: pindahkan Help Window agar tidak overlap
# Area bebas: X=510 sampai X=659 (149px) -> terlalu sempit
# Alternatif: letakkan Help Window DI ATAS Status Window dengan Z-order berbeda
# Atau: jadikan Help Window bagian dari area cyclops (kiri), bukan kanan

# SOLUSI TERBAIK: Help Window di X=510 dengan W=140 di kiri status,
# ATAU jadikan Status Window transparan di area yg sama (ubah order di kode)
# TAPI cara termudah: geser Help ke posisi KANAN status (X=980+)

# Cek layar: 1280 lebar. Status di X=660, W=320 = sampai X=980
# Sisa layar kanan: 1280-980 = 300px -> Help Window bisa di sana!
# Help X=980, W=290, H=700

new_params = re.sub(r'"Help X":"[^"]*"', '"Help X":"985"', new_params)
new_params = re.sub(r'"Help Y":"[^"]*"', '"Help Y":"10"', new_params)
new_params = re.sub(r'"Help W":"[^"]*"', '"Help W":"285"', new_params)
new_params = re.sub(r'"Help H":"[^"]*"', '"Help H":"700"', new_params)

new_text = text[:param_start] + new_params + text[param_end:]
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(new_text)

print("\nAFTER:")
for m in re.findall(r'"(Help|Status) [^"]+":"[^"]*"', new_params):
    print(' ', m)
print("Done!")
