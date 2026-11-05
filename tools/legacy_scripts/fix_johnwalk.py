from PIL import Image
import os, sys

SRC = os.path.join("img", "characters", "$JohnWalk.png")
BAK = os.path.join("img", "characters", "$JohnWalk_raw_backup.png")

# Restore from backup first if script was run before
if os.path.exists(BAK):
    img = Image.open(BAK).convert("RGBA")
    print("Using raw backup:", BAK)
else:
    img = Image.open(SRC).convert("RGBA")
    print("Using source:", SRC)

W, H = img.size
data = img.load()
print("Raw sheet: {}x{}".format(W, H))

if W == 288 and H % 4 == 0:
    print("Already a correct MV sheet - nothing to do.")
    sys.exit(0)

def row_has_pixel(y):
    return any(data[x, y][3] > 8 for x in range(W))

def col_has_pixel(x, y0, y1):
    return any(data[x, y][3] > 8 for y in range(y0, y1 + 1))

# Detect row separator gaps
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

print("Row separator gaps:", bands)

if len(bands) < 3:
    print("Warning: fewer than 3 gaps - using even split.")
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
max_fig_w = 0

for r, (ry0, ry1) in enumerate(row_wins):
    # Detect column runs
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

    # Filter out tiny noise runs (width < 5px)
    runs = [(x0, x1) for (x0, x1) in runs if (x1 - x0 + 1) >= 5]
    print("  Row {}: {} significant runs: {}".format(r, len(runs), runs))

    # This sheet has 3 columns (already MV layout: step1 | stand | step2)
    # If 3 runs detected => already MV order, MAP is [0, 1, 2]
    # If 4 runs detected => raw 4-col, MAP is [1, 0, 3]
    num_cols = len(runs)

    if num_cols == 3:
        MAP = [0, 1, 2]  # Already MV order
        use_runs = runs
    elif num_cols == 4:
        MAP = [1, 0, 3]  # Raw artist order
        use_runs = runs
    elif num_cols == 2:
        # Fallback: treat as col 0 and col 1 only, pad col 2 empty
        MAP = [0, 1, 0]
        use_runs = runs + [runs[-1]]
    else:
        # Even split into 3 or 4
        cw = W // 3
        use_runs = [(c * cw, (c + 1) * cw - 1) for c in range(3)]
        MAP = [0, 1, 2]
        print("  Row {}: fallback even split 3 cols".format(r))

    row_figs = []
    for ci_idx, raw_col in enumerate(MAP):
        if raw_col < len(use_runs):
            (cx0, cx1) = use_runs[raw_col]
        else:
            (cx0, cx1) = (0, 0)
        bb = tight_bbox(cx0, cx1, ry0, ry1)
        if bb is None:
            bb = (cx0, ry0, max(1, cx1 - cx0 + 1), max(1, ry1 - ry0 + 1))
        row_figs.append(bb)
        max_fig_h = max(max_fig_h, bb[3])
        max_fig_w = max(max_fig_w, bb[2])
        print("    MV col {} (raw col {}): x={} y={} {}x{}".format(ci_idx, raw_col, bb[0], bb[1], bb[2], bb[3]))

    all_figs.append(row_figs)

# Target output: standard RPG Maker MV cell 96x128
CELL_W = 96
CELL_H = 128
FOOT_MARGIN = 8

if max_fig_w > CELL_W - 4:
    CELL_W = max_fig_w + 8
if max_fig_h > CELL_H - FOOT_MARGIN - 4:
    CELL_H = max_fig_h + FOOT_MARGIN + 8

# Round cell dims to even numbers
CELL_W = CELL_W + (CELL_W % 2)
CELL_H = CELL_H + (CELL_H % 2)

print("\nOutput cell: {}x{} | Sheet: {}x{}".format(CELL_W, CELL_H, CELL_W*3, CELL_H*4))

out_w = CELL_W * 3
out_h = CELL_H * 4
out = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))

for r in range(4):
    for f in range(3):
        bb = all_figs[r][f]
        fx, fy, fw, fh = bb

        fw = min(fw, CELL_W)
        fh = min(fh, CELL_H - FOOT_MARGIN)

        dx = f * CELL_W + (CELL_W - fw) // 2
        dy = r * CELL_H + (CELL_H - FOOT_MARGIN - fh)

        region = img.crop((fx, fy, fx + fw, fy + fh))
        out.paste(region, (dx, dy), region)

# Save backup if not yet done
if not os.path.exists(BAK):
    img.save(BAK)
    print("Backed up raw sheet -> " + BAK)

img.close()
out.save(SRC)
print("\nSaved fixed MV sheet: {}  ({}x{}, cells {}x{})".format(SRC, out_w, out_h, CELL_W, CELL_H))
print("This sheet had 3 columns (MV order) - centered & properly scaled into {}x{} cells.".format(CELL_W, CELL_H))
