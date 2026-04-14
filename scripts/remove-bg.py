from PIL import Image
import urllib.request
import io
import os

# Download the image
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_oo3vd3oo3vd3oo3v.png-LstgvCaBoO7raoIYqC5h1PPzE7br9s.jpeg"
with urllib.request.urlopen(url) as response:
    img_data = response.read()

# Open image and convert to RGBA
img = Image.open(io.BytesIO(img_data)).convert("RGBA")

# Get pixel data
pixels = img.getdata()

# Create new pixel data with transparent background
new_pixels = []
for pixel in pixels:
    r, g, b, a = pixel
    # If pixel is close to white (background), make it transparent
    if r > 240 and g > 240 and b > 240:
        new_pixels.append((r, g, b, 0))
    else:
        new_pixels.append(pixel)

# Apply new pixels
img.putdata(new_pixels)

# Crop to content (remove empty space)
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Save as PNG with transparency
output_path = "/vercel/share/v0-project/public/logo-mark.png"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
img.save(output_path, "PNG")

print(f"Saved transparent logo to {output_path}")
print(f"Image size: {img.size}")
