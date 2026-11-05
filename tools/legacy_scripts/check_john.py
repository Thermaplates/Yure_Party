from PIL import Image

src = "img/characters/\x24John.png"
bak = "img/characters/\x24John_raw_backup.png"

im = Image.open(src)
print("Current $John.png size:", im.size)

bk = Image.open(bak)
print("Backup $John_raw_backup.png size:", bk.size)

# Also print how MV would slice it
w, h = im.size
cell_w = w // 3
cell_h = h // 4
print(f"MV cell size from current: {cell_w}x{cell_h}")

w2, h2 = bk.size
cell_w2 = w2 // 3
cell_h2 = h2 // 4
print(f"MV cell size from backup: {cell_w2}x{cell_h2}")
print(f"Backup image mode: {bk.mode}")

im.close()
bk.close()
