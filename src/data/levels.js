// Level descriptors — drives all 5 levels and wave progression

export const LEVELS = [
  // ── Level 1: Warehouse ──────────────────────────────────────────
  {
    name: 'WAREHOUSE',
    worldWidth: 1280,
    worldHeight: 960,
    backgroundColor: '#1a1a2e',
    floorColor: '#16213e',
    playerSpawn: { x: 640, y: 480 },
    scoreMultiplier: 1,
    waves: [
      {
        triggerCondition: 'start',
        enemies: [
          { type: 'grunt', count: 4, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 6, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 8, spawnEdge: true },
        ],
      },
    ],
    completionCondition: 'allWavesCleared',
  },

  // ── Level 2: Factory ────────────────────────────────────────────
  {
    name: 'FACTORY',
    worldWidth: 1280,
    worldHeight: 960,
    backgroundColor: '#1c1207',
    floorColor: '#241a0a',
    playerSpawn: { x: 640, y: 480 },
    scoreMultiplier: 1.5,
    waves: [
      {
        triggerCondition: 'start',
        enemies: [
          { type: 'grunt', count: 5, spawnEdge: true },
          { type: 'shooter', count: 2, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 6, spawnEdge: true },
          { type: 'shooter', count: 4, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 4, spawnEdge: true },
          { type: 'shooter', count: 6, spawnEdge: true },
        ],
      },
    ],
    completionCondition: 'allWavesCleared',
  },

  // ── Level 3: Rooftop ────────────────────────────────────────────
  {
    name: 'ROOFTOP',
    worldWidth: 1600,
    worldHeight: 1200,
    backgroundColor: '#070a1c',
    floorColor: '#0d1020',
    playerSpawn: { x: 800, y: 600 },
    scoreMultiplier: 2,
    speedMult: 1.2,   // enemies 20% faster
    waves: [
      {
        triggerCondition: 'start',
        enemies: [
          { type: 'grunt', count: 6, spawnEdge: true },
          { type: 'shooter', count: 4, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 8, spawnEdge: true },
          { type: 'shooter', count: 6, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 6, spawnEdge: true },
          { type: 'shooter', count: 8, spawnEdge: true },
        ],
      },
    ],
    completionCondition: 'allWavesCleared',
  },

  // ── Level 4: Underground ────────────────────────────────────────
  {
    name: 'UNDERGROUND',
    worldWidth: 1600,
    worldHeight: 1200,
    backgroundColor: '#100810',
    floorColor: '#180d18',
    playerSpawn: { x: 800, y: 600 },
    scoreMultiplier: 2.5,
    waves: [
      {
        triggerCondition: 'start',
        enemies: [
          { type: 'grunt', count: 4, spawnEdge: true },
          { type: 'shooter', count: 4, spawnEdge: true },
          { type: 'elite', count: 2, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'grunt', count: 6, spawnEdge: true },
          { type: 'shooter', count: 5, spawnEdge: true },
          { type: 'elite', count: 4, spawnEdge: true },
        ],
      },
      {
        triggerCondition: 'enemiesCleared',
        enemies: [
          { type: 'elite', count: 8, spawnEdge: true },
          { type: 'shooter', count: 6, spawnEdge: true },
        ],
      },
    ],
    completionCondition: 'allWavesCleared',
  },

  // ── Level 5: Command Core ───────────────────────────────────────
  {
    name: 'COMMAND CORE',
    worldWidth: 960,
    worldHeight: 720,
    backgroundColor: '#06000a',
    floorColor: '#0a000f',
    playerSpawn: { x: 480, y: 600 },
    scoreMultiplier: 3,
    waves: [
      {
        triggerCondition: 'start',
        enemies: [
          { type: 'boss', count: 1, x: 480, y: 120 },
        ],
      },
    ],
    completionCondition: 'allWavesCleared',
  },
];
