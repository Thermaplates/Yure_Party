from PIL import Image
import os, sys

SRC = os.path.join("img", "characters", "$John.png")
BAK = os.path.join("img", "characters", "$John_raw_backup.png")

if not os.path.exists(SRC):
    sys.exit("Missing " + SRC + " - run from game root.")

img = Image.open(SRC).convert("RGBA")
W, H = img.size
data = img.load()

print("Raw sheet: {}x{}".format(W, H))

if W == 288 and H % 4 == 0:
    print("$John.png already looks like a fixed MV sheet - nothing to do.")
    sys.exit(0)

def row_has_pixel(y):
    return any(data[x, y][3] > 8 for x in range(W))

def col_has_pixel(x, y0, y1):
    return any(data[x, y][3] > 8 for y in range(y0, y1 + 1))

# Detect horizontal separator gaps -> 4 row windows
bands = []
in_gap = False
gap_start = 0
for y in range(H):
    is_empty = not row_has_pixel(y)
    if is_empty and not in_gap:
        in_gap = True
        gap_start = y
    elif not is_empty and in_gap:
        in_gap = False
        gap_end = y - 1
        if gap_end - gap_start >= 2 and gap_start > 0 and gap_end < H - 1:
            bands.append((gap_start, gap_end))
if in_gap and gap_start > 0:
    bands.append((gap_start, H - 1))

print("Separator gaps:", bands)

if len(bands) < 3:
    print("Warning: fewer than 3 gaps found - using even split.")
    row_h = H // 4
    row_wins = [(r * row_h, (r + 1) * row_h - 1) for r in range(4)]
else:
    row_wins = []
    prev_end = 0
    for (gs, ge) in sorted(bands)[:3]:
        row_wins.append((prev_end, gs - 1))
        prev_end = ge + 1
    row_wins.append((prev_end, H - 1))

print("Row windows:", row_wins)

def tight_bbox(x0, x1, y0, y1):
    bx0, by0, bx1, by1 = x1, y1, x0, y0
    found = False
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if data[x, y][3] > 8:
                found = True
                bx0 = min(bx0, x)
                by0 = min(by0, y)
                bx1 = max(bx1, x)
                by1 = max(by1, y)
    if not found:
        return None
    return (bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1)

all_figs = []
max_fig_h = 0

for r, (ry0, ry1) in enumerate(row_wins):
    runs = []
    in_run = False
    run_start = 0
    for x in range(W):
        has = col_has_pixel(x, ry0, ry1)
        if has and not in_run:
            in_run = True
            run_start = x
        elif not has and in_run:
            in_run = False
            runs.append((run_start, x - 1))
    if in_run:
        runs.append((run_start, W - 1))

    if len(runs) < 4:
        cw = W // 4
        runs = [(c * cw, (c + 1) * cw - 1) for c in range(4)]
        print("  Row {}: only {} runs found, using even split col={}px".format(r, len(runs), cw))

    row_figs = []
    for ci, (cx0, cx1) in enumerate(runs[:4]):
        bb = tight_bbox(cx0, cx1, ry0, ry1)
        if bb is None:
            bb = (cx0, ry0, cx1 - cx0 + 1, ry1 - ry0 + 1)
        row_figs.append(bb)
        max_fig_h = max(max_fig_h, bb[3])
        print("  Row {} col {}: x={} y={} {}x{}".format(r, ci, bb[0], bb[1], bb[2], bb[3]))

    all_figs.append(row_figs)

# Compose MV 3-col sheet
CELL_W = 96
CELL_H = max(128, max_fig_h + 16)
FOOT_MARGIN = 8
MAP = [1, 0, 3]  # MV col -> raw col: [step1, stand, step2]

out_w = CELL_W * 3
out_h = CELL_H * 4
out = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))

for r in range(4):
    for f, raw_col in enumerate(MAP):
        bb = all_figs[r][raw_col]
        fx, fy, fw, fh = bb

        if fw > CELL_W:
            print("  Warning: Row {} col {} width {} > cell {}, clamping".format(r, raw_col, fw, CELL_W))
            fw = CELL_W
        if fh > (CELL_H - FOOT_MARGIN):
            print("  Warning: Row {} col {} height {} > cell, clamping".format(r, raw_col, fh, CELL_H))
            fh = CELL_H - FOOT_MARGIN

        dx = f * CELL_W + (CELL_W - fw) // 2
        dy = r * CELL_H + (CELL_H - FOOT_MARGIN - fh)

        region = img.crop((fx, fy, fx + fw, fy + fh))
        out.paste(region, (dx, dy), region)

# Backup raw if not yet done
if not os.path.exists(BAK):
    img.save(BAK)
    print("Backed up raw sheet -> " + BAK)

out.save(SRC)
print("\nSaved fixed MV sheet: {}  ({}x{}, cells {}x{})".format(SRC, out_w, out_h, CELL_W, CELL_H))
print("Column mapping (raw->MV): stand=col0->MV1, step1=col1->MV0, step2=col3->MV2")
