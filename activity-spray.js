// Positions use the same 3:2 reference frame as the beaker photograph.
const width = 900;
const height = 600;
const surface = 348;
const rim = 158;
const center = 447;
const impact = .56;
const gravity = 650;

const sheets = Array.from({length: 7}, (_, i) => ({
  start: .13 + (i % 3) * .039,
  x: center + (i - 3) * 9,
  vx: (i - 3) * 73,
  vy: 255 + i * 61 % 127,
  thickness: 10 + i * 17 % 11
}));
const drops = Array.from({length: 132}, (_, i) => ({
  start: .145 + (i * 31 % 100) * .0033,
  x: center + (i * 17 % 67) - 33,
  vx: (i * 73 % 563) - 281,
  vy: 145 + i * 139 % 246,
  radius: .68 + (i * 11 % 29) * .097
}));

const tint = (rgb, alpha) => `rgba(${rgb},${alpha})`;

function drawJet(ctx, time, color, strength) {
  if (time >= .58) return;
  const rise = Math.min(1, time / .15);
  const crest = surface - (surface - rim + 23) * rise;
  const opacity = Math.min(rise * 1.65, (.58 - time) * 2.7);
  const bend = Math.sin(time * 19) * 8;
  const head = center + bend;
  const spread = (10 + 18 * rise) * strength;
  const water = ctx.createLinearGradient(0, crest, 0, surface);
  water.addColorStop(0, tint('250,253,248', opacity * .78));
  water.addColorStop(.25, tint(color, opacity * .66));
  water.addColorStop(.74, tint('118,168,179', opacity * .38));
  water.addColorStop(1, tint(color, opacity * .22));
  ctx.beginPath();
  ctx.moveTo(center - spread, surface);
  ctx.bezierCurveTo(center - 19, surface - 42 * rise, head - 7, crest + 49 * rise, head - spread * .58, crest + 9);
  ctx.quadraticCurveTo(head - 2, crest - 14, head + spread * .66, crest + 3);
  ctx.bezierCurveTo(head + 6, crest + 58 * rise, center + 24, surface - 23 * rise, center + spread * 1.32, surface);
  ctx.quadraticCurveTo(center, surface + 15 * rise, center - spread, surface);
  ctx.closePath();
  ctx.fillStyle = water;
  ctx.fill();
  ctx.strokeStyle = water;
  ctx.lineWidth = 1.7;
  ctx.stroke();
}

function drawSheet(ctx, sheet, time, color, strength) {
  const age = time - sheet.start;
  if (age <= 0 || age >= .82) return;
  const start = Math.max(0, age - .33);
  const end = Math.min(age, .68);
  const opacity = Math.min(1, age * 14, (.82 - age) * 3.8);
  const vx = sheet.vx * strength;
  const vy = sheet.vy * strength;
  const left = [];
  const right = [];

  for (let i = 0; i <= 16; i++) {
    const progress = i / 16;
    const t = start + (end - start) * progress;
    const x = sheet.x + vx * t + Math.sin(t * 21 + sheet.x) * t * 12;
    const y = rim - vy * t + gravity * t ** 2 / 2;
    const dy = gravity * t - vy;
    const speed = Math.hypot(vx, dy) || 1;
    const taper = Math.sin(progress * Math.PI * .9);
    const halfWidth = (1 + sheet.thickness * taper * (1 + .17 * Math.sin(t * 48))) / 2;
    left.push([x - dy / speed * halfWidth, y + vx / speed * halfWidth]);
    right.push([x + dy / speed * halfWidth, y - vx / speed * halfWidth]);
  }

  const [tipX, tipY] = left.at(-1);
  const glass = ctx.createLinearGradient(sheet.x, rim, tipX, tipY);
  glass.addColorStop(0, tint(color, opacity * .46));
  glass.addColorStop(.62, tint('139,189,205', opacity * .52));
  glass.addColorStop(1, tint('248,253,252', opacity * .92));
  ctx.beginPath();
  ctx.moveTo(...left[0]);
  left.slice(1).forEach(point => ctx.lineTo(...point));
  right.reverse().forEach(point => ctx.lineTo(...point));
  ctx.closePath();
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.strokeStyle = tint('243,252,255', opacity * .66);
  ctx.lineWidth = 1.15;
  ctx.stroke();
}

function drawDrop(ctx, drop, time, color, strength) {
  const age = time - drop.start;
  if (age <= 0 || age >= 1.62) return;
  const vx = drop.vx * strength;
  const vy = drop.vy * strength;
  const x = drop.x + vx * age;
  const y = rim - vy * age + gravity * age ** 2 / 2;
  if (y > 516) return;
  const dy = gravity * age - vy;
  // The front lip hides falling droplets once they are back inside the beaker.
  const inside = x > 326 && x < 567 && dy > 0;
  const visibility = inside ? Math.max(0, 1 - Math.max(0, y - 161) / 24) : 1;
  const alpha = Math.min(1, age * 21, (1.62 - age) * 5) * visibility;
  if (alpha === 0) return;

  const r = drop.radius;
  const tail = r * (1.25 + Math.min(2.6, Math.hypot(vx, dy) / 160));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(-vx, dy));
  const shine = ctx.createLinearGradient(-r, 0, r, r);
  shine.addColorStop(0, tint('252,255,255', alpha * .96));
  shine.addColorStop(.28, tint(color, alpha * .77));
  shine.addColorStop(.66, tint('92,145,168', alpha * .44));
  shine.addColorStop(1, tint('238,251,255', alpha * .86));
  ctx.beginPath();
  ctx.moveTo(0, -tail);
  ctx.bezierCurveTo(r * .48, -tail * .53, r, -r * .2, r, 0);
  ctx.bezierCurveTo(r, r * 1.38, -r, r * 1.38, -r, 0);
  ctx.bezierCurveTo(-r, -r * .18, -r * .46, -tail * .55, 0, -tail);
  ctx.fillStyle = shine;
  ctx.fill();
  ctx.restore();
}

export function playActivitySpray(canvas, {aqua = false, rupture = false} = {}) {
  const ctx = canvas?.getContext('2d');
  if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const start = performance.now();
  const strength = rupture ? 1.22 : 1;
  const color = aqua ? '238,219,154' : '181,222,239';
  let frame;

  function paint(now) {
    const time = (now - start) / 1000 - impact;
    if (time <= 0) {
      frame = requestAnimationFrame(paint);
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(1.5, devicePixelRatio || 1);
    const w = Math.max(1, Math.round(bounds.width * ratio));
    const h = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
    ctx.clearRect(0, 0, width, height);

    drawJet(ctx, time, color, strength);
    for (const sheet of sheets) drawSheet(ctx, sheet, time, color, strength);
    for (const drop of drops) drawDrop(ctx, drop, time, color, strength);
    if (time < 2) frame = requestAnimationFrame(paint);
  }

  frame = requestAnimationFrame(paint);
  return () => cancelAnimationFrame(frame);
}
