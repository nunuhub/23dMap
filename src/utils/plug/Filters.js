class Filter {
  getCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  getPixels(img) {
    var c = this.getCanvas(img.width, img.height);
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, c.width, c.height);
  }

  static dark(pixels) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      d[i] = d[i + 1] = d[i + 2] = v;
    }

    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 - d[i] + 20;
      d[i + 1] = 255 - d[i + 1] + 20;
      d[i + 2] = 255 - d[i + 2] + 20;
    }

    return pixels;
  }

  static blue(pixels) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i] = 55 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 305 - d[i + 2];
    }

    return pixels;
  }

  filterImage(filter, image) {
    var args = [this.getPixels(image)];
    for (var i = 2; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    const idata = filter.apply(this, args);
    const c = this.getCanvas(image.width, image.height);
    var ctx = c.getContext('2d');
    ctx.putImageData(idata, 0, 0);
    return c;
  }
}

export default Filter;
