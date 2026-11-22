"""
Visual Regression & Pixel Similarity Comparator
U&I Logistics Customer Portal
Compares rendered page screenshots against reference mockups in Mockuo/
Calculates:
- Pixel Similarity Percentage (based on Mean Absolute Error)
- Peak Signal-to-Noise Ratio (PSNR)
- Structural Similarity (SSIM approximation with luminance, contrast, and structure metrics)
- Produces difference highlight images
"""

import os
import sys
import json
import numpy as np
from PIL import Image

def calculate_similarity(ref_img_path, actual_img_path, diff_output_path=None):
    if not os.path.exists(ref_img_path):
        raise FileNotFoundError(f"Reference image not found: {ref_img_path}")
    if not os.path.exists(actual_img_path):
        raise FileNotFoundError(f"Actual screenshot not found: {actual_img_path}")

    img_ref = Image.open(ref_img_path).convert('RGB')
    img_act = Image.open(actual_img_path).convert('RGB')

    ref_w, ref_h = img_ref.size
    act_w, act_h = img_act.size

    # Resize actual to reference dimensions using Lanczos filter for high fidelity comparison
    if (act_w, act_h) != (ref_w, ref_h):
        img_act_resized = img_act.resize((ref_w, ref_h), Image.Resampling.LANCZOS)
    else:
        img_act_resized = img_act

    arr_ref = np.asarray(img_ref, dtype=np.float64)
    arr_act = np.asarray(img_act_resized, dtype=np.float64)

    # Calculate Mean Absolute Error (MAE)
    abs_diff = np.abs(arr_ref - arr_act)
    mae = np.mean(abs_diff)
    similarity_pct = max(0.0, min(100.0, (1.0 - (mae / 255.0)) * 100.0))

    # Calculate Mean Squared Error (MSE) & PSNR
    mse = np.mean((arr_ref - arr_act) ** 2)
    if mse == 0:
        psnr = 100.0
    else:
        psnr = 10.0 * np.log10((255.0 ** 2) / mse)

    # SSIM approximation (Luminance, Contrast, Structure)
    mu_x = np.mean(arr_ref)
    mu_y = np.mean(arr_act)
    var_x = np.var(arr_ref)
    var_y = np.var(arr_act)
    cov_xy = np.mean((arr_ref - mu_x) * (arr_act - mu_y))

    c1 = (0.01 * 255) ** 2
    c2 = (0.03 * 255) ** 2

    ssim = ((2 * mu_x * mu_y + c1) * (2 * cov_xy + c2)) / ((mu_x**2 + mu_y**2 + c1) * (var_x + var_y + c2))
    ssim_val = float(max(0.0, min(1.0, ssim)))

    # Generate difference map image
    if diff_output_path:
        os.makedirs(os.path.dirname(os.path.abspath(diff_output_path)), exist_ok=True)
        # Highlight differences: amplification factor 3x
        diff_amplified = np.clip(abs_diff * 3.0, 0, 255).astype(np.uint8)
        diff_img = Image.fromarray(diff_amplified)
        diff_img.save(diff_output_path)

    return {
        "reference": os.path.basename(ref_img_path),
        "actual": os.path.basename(actual_img_path),
        "ref_dimensions": f"{ref_w}x{ref_h}",
        "actual_dimensions": f"{act_w}x{act_h}",
        "similarity_score": round(similarity_pct, 2),
        "ssim": round(ssim_val, 4),
        "mse": round(float(mse), 2),
        "psnr_db": round(float(psnr), 2),
        "diff_image": os.path.basename(diff_output_path) if diff_output_path else None
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python visual-diff.py <ref_path> <actual_path> [diff_output_path]")
        sys.exit(1)
    
    ref = sys.argv[1]
    act = sys.argv[2]
    diff = sys.argv[3] if len(sys.argv) > 3 else None
    
    result = calculate_similarity(ref, act, diff)
    print(json.dumps(result, indent=2))
