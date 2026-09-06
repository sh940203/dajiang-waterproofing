from PIL import Image, ImageOps, ImageEnhance
import os

SRC = "/Users/sh/Desktop/Dajiang-WaterProofing/public/brand/great-wave-source.jpg"
OUT = "/Users/sh/Desktop/Dajiang-WaterProofing/public/brand/"

stops = [
    (0.00, (0x0c, 0x18, 0x28)),
    (0.20, (0x14, 0x26, 0x3c)),
    (0.38, (0x22, 0x42, 0x66)),
    (0.55, (0x3c, 0x63, 0x8c)),
    (0.70, (0x7c, 0xa4, 0xc2)),
    (0.83, (0xc6, 0xd8, 0xe0)),
    (0.92, (0xe8, 0xe9, 0xe4)),
    (1.00, (0xfb, 0xf7, 0xf1)),
]
def lut():
    o = [[], [], []]
    for i in range(256):
        t = i / 255
        for j in range(len(stops) - 1):
            t0, c0 = stops[j]; t1, c1 = stops[j + 1]
            if t <= t1 or j == len(stops) - 2:
                f = 0 if t1 == t0 else max(0, min(1, (t - t0) / (t1 - t0)))
                for k in range(3): o[k].append(round(c0[k] + (c1[k] - c0[k]) * f))
                break
    return o[0] + o[1] + o[2]

im = Image.open(SRC).convert("RGB")
im = ImageOps.autocontrast(im, cutoff=1)
gimg = ImageEnhance.Contrast(im.convert("L")).enhance(1.12)
graded = Image.merge("RGB", (gimg, gimg, gimg)).point(lut())
graded = graded.transpose(Image.FLIP_LEFT_RIGHT)

w, h = graded.size
# after flip the title cartouche + signature sit top-right -> crop them out
graded = graded.crop((0, int(h * 0.12), int(w * 0.865), int(h * 0.985)))

def save(img, name, width, **kw):
    w0, h0 = img.size
    r = img.resize((width, round(h0 * width / w0)), Image.LANCZOS)
    p = OUT + name
    r.save(p, **kw)
    print(f"{name}: {r.size}  {os.path.getsize(p)//1024} KB")

save(graded, "great-wave.webp", 2200, format="WEBP", quality=68, method=6)
save(graded, "great-wave.jpg", 1800, format="JPEG", quality=74, optimize=True, progressive=True)
save(graded, "_preview.jpg", 1300, format="JPEG", quality=82)
