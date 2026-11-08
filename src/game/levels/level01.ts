export const level01 = {
  width: 3600, height: 1100,
  spawn: { x: 110, y: 340 },
  finish: { x: 3410, y: 850 },
  // x/y — центр прямоугольной платформы; верхняя поверхность = y - height / 2.
  platforms: [
    { x: 290, y: 500, width: 580, height: 160 },
    { x: 735, y: 570, width: 190, height: 160 },
    { x: 1050, y: 640, width: 280, height: 180 },
    { x: 1430, y: 710, width: 260, height: 200 },
    { x: 1820, y: 780, width: 300, height: 220 },
    { x: 2220, y: 850, width: 260, height: 220 },
    { x: 2720, y: 920, width: 480, height: 240 },
    { x: 3300, y: 980, width: 600, height: 240 },
  ],
};
