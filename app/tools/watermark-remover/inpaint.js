export class Inpainter {
  async inpaint(srcImageData, maskImageData, radius, algorithm, blurAmount, opts = {}) {
    const w = srcImageData.width;
    const h = srcImageData.height;
    const onProgress = opts.onProgress || (() => {});

    const mask = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < w * h; i++, p += 4) {
      mask[i] = maskImageData.data[p + 3] > 16 ? 1 : 0;
    }

    this._dilate(mask, w, h);

    if (blurAmount > 0) {
      this._softenMask(mask, w, h, Math.max(0.5, blurAmount));
    }

    const out = new Uint8ClampedArray(srcImageData.data);
    onProgress(0.05);
    if (algorithm === 'telea') {
      await this._teleaInpaint(out, mask, w, h, radius, onProgress);
    } else {
      await this._diffusionInpaint(out, mask, w, h, radius, onProgress);
    }
    onProgress(1);
    return new ImageData(out, w, h);
  }

  _dilate(mask, w, h) {
    const out = new Uint8Array(mask);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mask[i] === 1) {
          if (x > 0)     out[i - 1] = 1;
          if (x < w - 1) out[i + 1] = 1;
          if (y > 0)     out[i - w] = 1;
          if (y < h - 1) out[i + w] = 1;
        }
      }
    }
    mask.set(out);
  }

  _softenMask(mask, w, h, sigma) {
    const tmp = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) tmp[i] = mask[i];
    const r = Math.max(1, Math.ceil(sigma * 2));
    const k = this._gaussKernel(r, sigma);
    this._hGaussian(tmp, w, h, r, k);
    this._vGaussian(tmp, w, h, r, k);
    for (let i = 0; i < w * h; i++) mask[i] = tmp[i] > 0.2 ? 1 : 0;
  }

  _gaussKernel(r, sigma) {
    const k = new Float32Array(2 * r + 1);
    let sum = 0;
    for (let i = -r; i <= r; i++) {
      k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
      sum += k[i + r];
    }
    for (let i = 0; i < k.length; i++) k[i] /= sum;
    return k;
  }

  _hGaussian(buf, w, h, r, k) {
    const tmp = new Float32Array(w);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = 0;
        for (let d = -r; d <= r; d++) {
          const xx = Math.max(0, Math.min(w - 1, x + d));
          v += buf[y * w + xx] * k[d + r];
        }
        tmp[x] = v;
      }
      for (let x = 0; x < w; x++) buf[y * w + x] = tmp[x];
    }
  }

  _vGaussian(buf, w, h, r, k) {
    const tmp = new Float32Array(h);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let v = 0;
        for (let d = -r; d <= r; d++) {
          const yy = Math.max(0, Math.min(h - 1, y + d));
          v += buf[yy * w + x] * k[d + r];
        }
        tmp[y] = v;
      }
      for (let y = 0; y < h; y++) buf[y * w + x] = tmp[y];
    }
  }

  async _diffusionInpaint(out, mask, w, h, radius, onProgress) {
    const conf = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) conf[i] = mask[i] === 0 ? 1.0 : 0.0;
    let changed = true;
    let iter = 0;
    const maxIter = w * h;
    while (changed && iter++ < maxIter) {
      changed = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (mask[i] === 0) continue;
          let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const j = ny * w + nx;
              if (mask[j] !== 0 && conf[j] === 0) continue;
              if (conf[j] === 0 && mask[j] !== 0) continue;
              const d2 = dx * dx + dy * dy;
              const w_ = conf[j] / (1 + d2);
              rSum += out[j * 4]     * w_;
              gSum += out[j * 4 + 1] * w_;
              bSum += out[j * 4 + 2] * w_;
              wSum += w_;
            }
          }
          if (wSum > 0) {
            out[i * 4]     = rSum / wSum;
            out[i * 4 + 1] = gSum / wSum;
            out[i * 4 + 2] = bSum / wSum;
            out[i * 4 + 3] = 255;
            conf[i] = 0.6;
            mask[i] = 0;
            changed = true;
          }
        }
      }
      if (iter % 10 === 0) onProgress(Math.min(0.95, 0.05 + (iter / 300) * 0.9));
      await new Promise(r => setTimeout(r, 0));
    }
  }

  async _teleaInpaint(out, mask, w, h, radius, onProgress) {
    let changed = true;
    let iter = 0;
    while (changed && iter++ < w * h) {
      changed = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (mask[i] === 0) continue;
          let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const j = ny * w + nx;
              if (mask[j] !== 0) continue;
              const d2 = dx * dx + dy * dy;
              const w_ = 1 / d2;
              rSum += out[j * 4]     * w_;
              gSum += out[j * 4 + 1] * w_;
              bSum += out[j * 4 + 2] * w_;
              wSum += w_;
            }
          }
          if (wSum > 0) {
            out[i * 4]     = rSum / wSum;
            out[i * 4 + 1] = gSum / wSum;
            out[i * 4 + 2] = bSum / wSum;
            out[i * 4 + 3] = 255;
            mask[i] = 0;
            changed = true;
          }
        }
      }
      if (iter % 5 === 0) onProgress(Math.min(0.95, 0.05 + (iter / 150) * 0.9));
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
