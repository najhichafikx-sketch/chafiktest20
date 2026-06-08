let fabric = null;

function getFabric() {
  if (typeof window !== 'undefined' && !fabric) {
    fabric = require('fabric').fabric;
  }
  return fabric;
}

export async function composeThumbnail({
  backgroundUrl,
  personUrl,
  title,
  dimension = '16:9',
}) {
  const f = getFabric();
  if (!f) throw new Error('Fabric.js not available (client-side only)');

  const isVertical = dimension === '9:16';
  const canvasWidth = isVertical ? 720 : 1280;
  const canvasHeight = isVertical ? 1280 : 720;

  const canvasEl = document.createElement('canvas');
  canvasEl.width = canvasWidth;
  canvasEl.height = canvasHeight;
  const canvas = new f.Canvas(canvasEl, { renderOnAddRemove: false });

  return new Promise((resolve, reject) => {
    let bgLoaded = false;
    let personLoaded = false;
    let checkDone = () => {
      if (bgLoaded && personLoaded) {
        composeLayers();
      }
    };

    function composeLayers() {
      try {
        const bgImg = canvas.item(0);
        if (bgImg) {
          const scaleX = canvasWidth / bgImg.width;
          const scaleY = canvasHeight / bgImg.height;
          const scale = Math.max(scaleX, scaleY);
          bgImg.set({ scaleX: scale, scaleY: scale, left: 0, top: 0, originX: 'center', originY: 'center' });
          bgImg.setCoords();
        }

        const personImg = canvas.item(1);
        if (personImg) {
          const personScale = canvasHeight / personImg.height;
          personImg.set({
            scaleX: personScale,
            scaleY: personScale,
            left: canvasWidth,
            top: canvasHeight,
            originX: 'right',
            originY: 'bottom',
          });
          personImg.setCoords();
        }

        const gradientOverlay = new f.Rect({
          left: 0,
          top: 0,
          width: canvasWidth * 0.6,
          height: canvasHeight,
          fill: new f.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
            colorStops: [
              { offset: 0, color: 'rgba(0,0,0,0.75)' },
              { offset: 0.7, color: 'rgba(0,0,0,0.3)' },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          }),
          selectable: false,
          evented: false,
        });
        canvas.add(gradientOverlay);

        const fontSize = Math.round(canvasHeight * 0.12);
        const line2FontSize = Math.round(fontSize * 0.78);

        const words = title.split(' ');
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        const addTextLine = (text, fontSize, topOffset) => {
          const textObj = new f.Text(text, {
            left: 60,
            top: topOffset,
            fontFamily: 'Impact, Arial Black, Arial',
            fontWeight: 900,
            fontSize,
            fill: '#FFB800',
            stroke: '#5a1e0a',
            strokeWidth: Math.round(fontSize * 0.08),
            strokeLineJoin: 'round',
            shadow: new f.Shadow({
              color: 'rgba(0,0,0,0.6)',
              blur: Math.round(fontSize * 0.4),
              offsetX: 4,
              offsetY: 4,
            }),
            selectable: false,
            evented: false,
          });
          canvas.add(textObj);
        };

        addTextLine(line1, fontSize, Math.round(canvasHeight * 0.08));
        if (line2) {
          addTextLine(line2, line2FontSize, Math.round(canvasHeight * 0.08 + fontSize * 1.1));
        }

        const brandText = new f.Text('ThumPure', {
          right: 20,
          bottom: 20,
          fontSize: Math.round(canvasHeight * 0.03),
          fill: 'rgba(255,255,255,0.3)',
          selectable: false,
          evented: false,
          originX: 'right',
          originY: 'bottom',
        });
        canvas.add(brandText);

        canvas.renderAll();
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
        canvas.dispose();
        resolve(dataUrl);
      } catch (err) {
        canvas.dispose();
        reject(err);
      }
    }

    fabric.util.loadImage(backgroundUrl, (img) => {
      const bgFabricImg = new f.Image(img, { selectable: false, evented: false });
      canvas.add(bgFabricImg);
      bgLoaded = true;
      checkDone();
    }, null, { crossOrigin: 'anonymous' });

    if (personUrl) {
      fabric.util.loadImage(personUrl, (img) => {
        const personFabricImg = new f.Image(img, { selectable: false, evented: false });
        canvas.add(personFabricImg);
        personLoaded = true;
        checkDone();
      }, null, { crossOrigin: 'anonymous' });
    } else {
      personLoaded = true;
      checkDone();
    }
  });
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
