import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CurateRequestBody {
  likedProducts: Array<{
    id: number;
    title: string;
    category: string;
    description: string;
    isLed: boolean;
  }>;
  collectorTier?: string;
  currency?: string;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini AI Client (Server-side only)
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const hasValidApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

  const ai = hasValidApiKey
    ? new GoogleGenAI({
        apiKey: apiKey!,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Curated fallback generator tailored to user's liked pieces
  function generateCuratorCollection(likedProducts: any[] = [], collectorTier: string = 'Collector') {
    const hasLed = likedProducts.some(p => p.isLed || p.category === 'LED & Smart Art');
    const hasFunctional = likedProducts.some(p => p.category === 'Functional Wall Decor');
    const hasLineArt = likedProducts.some(p => p.category === 'Minimalist Line Art');
    const hasShapeArt = likedProducts.some(p => p.category === 'Shape & Abstract');

    if (hasLed) {
      return {
        collectionTitle: "Cybernetic Luminescence & Midnight Eko",
        curatorCritique: "Tailored to your appreciation for atmospheric illumination. These pieces merge ambient sound-reactive neon glows with high-definition Lagos urban reflections, transforming evening living spaces and private lounges.",
        styleVibe: "Futuristic Luminous Accent & Night Mode Elegance",
        paletteHexCodes: ["#05050f", "#00f5d4", "#f72585", "#ffd166"],
        recommendedProductIds: [13, 14, 1],
        reasons: [
          {
            productId: 13,
            matchScore: 98,
            stylingAdvice: "Install in living room or modern lounge; pair with app sound-sync mode for evening events."
          },
          {
            productId: 14,
            matchScore: 95,
            stylingAdvice: "Accent piece for corridor or dining area with sleek modern black frame."
          },
          {
            productId: 1,
            matchScore: 92,
            stylingAdvice: "Vibrant Eko sunset horizon provides warm organic contrast to neon accents."
          }
        ]
      };
    }

    if (hasFunctional) {
      return {
        collectionTitle: "Curated Functional Wall Decor & Acoustic Harmony",
        curatorCritique: "Curated to complement your eye for multi-functional interior architecture. These pieces combine acoustic sound dampening, silent German quartz timekeeping, and warm ambient 2700K sconce lighting for high-ceiling Lagos spaces.",
        styleVibe: "Architectural Precision & Multi-Functional Luxury",
        paletteHexCodes: ["#14161a", "#d4af37", "#694e39", "#f5f0e6"],
        recommendedProductIds: [10, 11, 12],
        reasons: [
          {
            productId: 10,
            matchScore: 98,
            stylingAdvice: "Mount in living room or home office to eliminate room echo while adding walnut warmth."
          },
          {
            productId: 11,
            matchScore: 95,
            stylingAdvice: "Center in dining room or executive study with silent German quartz sweep."
          },
          {
            productId: 12,
            matchScore: 93,
            stylingAdvice: "Floating 2700K ambient halo casts cozy indirect lighting for evening relaxation."
          }
        ]
      };
    }

    if (hasLineArt) {
      return {
        collectionTitle: "Monochrome Japandi & Afro-Minimalist Lineage",
        curatorCritique: "Focusing on negative space, fluid continuous contours, and organic tranquility. Designed to cultivate a calming, museum-grade sanctuary in bedrooms, vanity nooks, and executive studies.",
        styleVibe: "Organic Japandi Serenity & Pure Contours",
        paletteHexCodes: ["#faf7f2", "#1c1917", "#c85a44", "#a3b18a"],
        recommendedProductIds: [4, 5, 6],
        reasons: [
          {
            productId: 4,
            matchScore: 98,
            stylingAdvice: "Style with Natural Oak or Brushed Gold frame against warm linen or beige textured walls."
          },
          {
            productId: 5,
            matchScore: 95,
            stylingAdvice: "Tropical palm fronds bring soothing organic nature into modern bedrooms."
          },
          {
            productId: 6,
            matchScore: 91,
            stylingAdvice: "Belgian natural linen creates bold focal contrast above a low credenza."
          }
        ]
      };
    }

    if (hasShapeArt) {
      return {
        collectionTitle: "Warm Terracotta Arches & Bohemian Balance",
        curatorCritique: "Designed around modern geometric harmony and earth pigments. These works interplay with changing natural sunlight through warm terracotta arches and balanced river stone compositions.",
        styleVibe: "Artisanal Tactile Depth & Earth-Toned Luxury",
        paletteHexCodes: ["#f7f4ed", "#c96d53", "#dfa86a", "#1e2126"],
        recommendedProductIds: [7, 8, 9],
        reasons: [
          {
            productId: 7,
            matchScore: 98,
            stylingAdvice: "Mount in a dining or entry foyer where side raking light highlights arch contours."
          },
          {
            productId: 8,
            matchScore: 94,
            stylingAdvice: "Bauhaus mid-century geometry creates structured visual order."
          },
          {
            productId: 9,
            matchScore: 91,
            stylingAdvice: "Afro-modernist terracotta and ochre grooves complement neutral sofas."
          }
        ]
      };
    }

    return {
      collectionTitle: "The Lagos Contemporary Atelier Ensemble",
      curatorCritique: `Formulated for ${collectorTier} level interiors. These signature Printscrafter artworks balance architectural structure with tactile luxury, rich fluid color harmony, and curated functional wall decor for modern Lagos living.`,
      styleVibe: "Contemporary African Luxury & Spatial Depth",
      paletteHexCodes: ["#fdfbf7", "#d4af37", "#cf5c36", "#0e172a"],
      recommendedProductIds: [1, 4, 10],
      reasons: [
        {
          productId: 1,
          matchScore: 97,
          stylingAdvice: "Pair with Brushed Gold frame on Studio White or Midnight Navy walls."
        },
        {
          productId: 4,
          matchScore: 95,
          stylingAdvice: "Single-line muse sketch delivers refined minimalist balance."
        },
        {
          productId: 10,
          matchScore: 93,
          stylingAdvice: "Architectural acoustic slats absorb sound in tiled spaces while looking magnificent."
        }
      ]
    };
  }

  // POST /api/curator/recommend
  app.post('/api/curator/recommend', async (req, res) => {
    const { likedProducts = [], collectorTier = 'Collector' } = req.body as CurateRequestBody;

    // If Gemini client is not initialized or API key is not active, return the tailored curated collection immediately
    if (!ai) {
      const curation = generateCuratorCollection(likedProducts, collectorTier);
      return res.json({
        success: true,
        isFallback: true,
        curation
      });
    }

    let timeoutTimer: NodeJS.Timeout | null = null;
    try {
      const likedDescriptions = likedProducts.map(p => 
        `- "${p.title}" (${p.category}, ${p.isLed ? 'Smart LED Illuminated' : 'Non-illuminated'}): ${p.description}`
      ).join('\n');

      const prompt = `
You are the Chief AI Art Curator at Printscrafter Gallery in Lekki Phase 1, Lagos, Nigeria.
Analyze the following wishlist artworks liked by a ${collectorTier}:

${likedDescriptions.length > 0 ? likedDescriptions : "The user hasn't liked specific items yet. Suggest our top trending signature collections for luxury residences in Lagos, London, and New York."}

Based on their aesthetic preferences, suggest a cohesive, trending art collection from our official catalogue:
1: Ethereal Twilight Horizon (Contemporary Paintings - Lagos Island sunset reflection)
2: Danfo Pulse & Urban Rhythm (Contemporary Paintings - iconic yellow transit pop cubism)
3: Ile-Ife Terra & Ancestral Bronze (Contemporary Paintings - royal Ife bronze & ochre)
4: Lagos Muse • Continuous Line (Minimalist Line Art - single continuous contour)
5: Elegushi Coastal Fronds (Minimalist Line Art - botanical palm breeze)
6: Monochrome Royal Profile (Minimalist Line Art - charcoal noble African profile)
7: Japandi Arch & Balanced Stones (Shape & Abstract - terracotta arches & river stones)
8: Bauhaus Geometry • Midnight & Clay (Shape & Abstract - mid-century architectural geometry)
9: Eko Geometric Groove (Shape & Abstract - Afro-modernist sun disks & ochre)
10: Acoustic Slatted Rhythm (Functional Wall Decor - sound-dampening walnut & brass arch)
11: Chronos Ikoyi Clock Art (Functional Wall Decor - silent German quartz movement)
12: Floating Halo Ambient Sconce (Functional Wall Decor - 2700K warm halo moon sconce)
13: Third Mainland Cyber-Pulse (LED & Smart Art - sound-reactive bridge light streams)
14: Neon Eko Skyline (LED & Smart Art - app-controlled Marina cityscape)
15: Fluted Oak Catchall (Functional Wall Decor - magnetic foyer key & coat hooks)
16: Liquid Zaria Bronze (Contemporary Paintings - molten gold & indigo impasto)

Return a structured JSON with:
- collectionTitle: An evocative, luxury title (e.g. "Afro-Futurism & Luminous Horizons", "Minimalist Japandi Sanctuary", "Sculptural Warm Metallics")
- curatorCritique: A 2-3 sentence sophisticated curatorial rationale explaining why these pieces harmonize and complement the user's taste.
- styleVibe: Short phrase describing the interior mood (e.g., "Contemporary High-Contrast Elegance", "Warm Architectural Harmony")
- paletteHexCodes: Array of 3 to 4 complementary hex color codes for wall and accent decor.
- recommendedProductIds: Array of 2 to 4 product IDs (numbers 1-16) from the catalogue.
- reasons: Array of objects with { productId: number, matchScore: number (80-99), stylingAdvice: string (specific framing or room placement recommendation) }
`;

      const timeoutPromise = new Promise((_, reject) => {
        timeoutTimer = setTimeout(() => reject(new Error('AI response timeout')), 20000);
      });

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
          systemInstruction: 'You are an elite contemporary art curator at Printscrafter Lagos. Provide articulate, sophisticated interior art curation.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              collectionTitle: { type: Type.STRING },
              curatorCritique: { type: Type.STRING },
              styleVibe: { type: Type.STRING },
              paletteHexCodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              },
              reasons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.INTEGER },
                    matchScore: { type: Type.INTEGER },
                    stylingAdvice: { type: Type.STRING }
                  },
                  required: ['productId', 'matchScore', 'stylingAdvice']
                }
              }
            },
            required: ['collectionTitle', 'curatorCritique', 'styleVibe', 'paletteHexCodes', 'recommendedProductIds', 'reasons']
          }
        }
      });

      const geminiResponse: any = await Promise.race([geminiPromise, timeoutPromise]);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      const responseText = geminiResponse.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        curation: parsedData
      });
    } catch (error) {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      console.warn('Gemini Curator notice (using tailored curation):', (error as any)?.message || error);
      const curation = generateCuratorCollection(likedProducts, collectorTier);
      return res.json({
        success: true,
        isFallback: true,
        curation
      });
    }
  });

  // ==========================================
  // PINTEREST MCP (Model Context Protocol) API
  // ==========================================

  // GET /api/mcp/pinterest/boards
  app.get('/api/mcp/pinterest/boards', async (_req, res) => {
    try {
      const { PINTEREST_BOARDS } = await import('./src/data/pinterestData.ts');
      res.json({
        success: true,
        boards: PINTEREST_BOARDS,
        totalBoards: PINTEREST_BOARDS.length,
        protocol: 'MCP/2024-11-05',
        serverName: 'printscrafter-pinterest-mcp'
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch boards' });
    }
  });

  // GET /api/mcp/pinterest/pins
  app.get('/api/mcp/pinterest/pins', async (req, res) => {
    try {
      const { PINTEREST_PINS, PINTEREST_BOARDS } = await import('./src/data/pinterestData.ts');
      const boardSlug = (req.query.board as string) || 'all';
      const query = ((req.query.query as string) || '').toLowerCase().trim();
      const orientation = (req.query.orientation as string) || 'all';
      const sort = (req.query.sort as string) || 'trending';

      let results = [...PINTEREST_PINS];

      // Board filter
      if (boardSlug && boardSlug !== 'all') {
        results = results.filter(p => p.boardSlug === boardSlug);
      }

      // Keyword query search
      if (query) {
        results = results.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.board.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      // Orientation filter
      if (orientation && orientation !== 'all') {
        results = results.filter(p => p.orientation === orientation);
      }

      // Sorting
      if (sort === 'saves') {
        results.sort((a, b) => b.savesCount - a.savesCount);
      } else if (sort === 'price-low') {
        results.sort((a, b) => a.basePriceNGN - b.basePriceNGN);
      } else if (sort === 'price-high') {
        results.sort((a, b) => b.basePriceNGN - a.basePriceNGN);
      } else {
        // 'trending' / default
        results.sort((a, b) => b.savesCount - a.savesCount);
      }

      res.json({
        success: true,
        pins: results,
        total: results.length,
        boards: PINTEREST_BOARDS,
        activeBoard: boardSlug,
        serverStatus: 'connected',
        query
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch pins' });
    }
  });

  // POST /api/mcp/pinterest/import
  app.post('/api/mcp/pinterest/import', async (req, res) => {
    try {
      const { pinterestUrl, title, customImageUrl, styleNotes } = req.body;
      if (!pinterestUrl && !customImageUrl) {
        return res.status(400).json({ success: false, error: 'Please provide a Pinterest URL or Image URL' });
      }

      // Generate a structured Pinterest MCP pin from user URL
      const cleanTitle = title?.trim() || 'Imported Pinterest Artwork';
      const img = customImageUrl?.trim() || '/art/wabi-sabi-neutral.svg';
      const newPinId = `pin-import-${Date.now()}`;

      const importedPin = {
        id: newPinId,
        title: cleanTitle,
        board: 'Imported from Pinterest',
        boardSlug: 'imported',
        pinnerUsername: '@CollectorVault',
        savesCount: 1240,
        imageUrl: img,
        aspectRatio: '4:5',
        orientation: 'portrait',
        palette: ['#c85a44', '#1e2126', '#d4af37', '#f5f0e6'],
        description: styleNotes?.trim() || `Imported directly via Pinterest MCP connector (${pinterestUrl || 'Custom Inspiration'}). Prepared for museum-grade giclée canvas printing.`,
        basePriceNGN: 35000,
        isLedCompatible: false,
        tags: ['imported pinterest', 'custom print', 'atelier giclée'],
        sourceUrl: pinterestUrl || 'https://pinterest.com',
        artistNote: 'Imported high-resolution source for bespoke print & framing',
        dimensionsDefault: '60 x 80 cm (24 x 32 in)'
      };

      res.json({
        success: true,
        pin: importedPin,
        message: 'Artwork successfully imported via Pinterest MCP.'
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to import pin' });
    }
  });

  // POST /api/mcp/pinterest/mcp-tool (Standard Model Context Protocol Tool Invocation)
  app.post('/api/mcp/pinterest/mcp-tool', async (req, res) => {
    try {
      const { tool, arguments: args = {} } = req.body;
      const { PINTEREST_PINS, PINTEREST_BOARDS } = await import('./src/data/pinterestData.ts');

      if (tool === 'pinterest_search_pins') {
        const query = (args.query || '').toLowerCase().trim();
        const board = (args.board || 'all');
        const matches = PINTEREST_PINS.filter(p => {
          const matchBoard = board === 'all' || p.boardSlug === board;
          const matchText = !query || 
            p.title.toLowerCase().includes(query) || 
            p.tags.some(t => t.toLowerCase().includes(query));
          return matchBoard && matchText;
        });

        return res.json({
          jsonrpc: '2.0',
          result: {
            pins: matches,
            count: matches.length,
            contextPrompt: `Found ${matches.length} curated pins on Pinterest MCP matching "${query}".`
          }
        });
      }

      if (tool === 'pinterest_get_trending_boards') {
        return res.json({
          jsonrpc: '2.0',
          result: {
            boards: PINTEREST_BOARDS
          }
        });
      }

      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Tool ${tool} not found on Pinterest MCP server.` }
      });
    } catch (e: any) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: e?.message || 'Internal MCP error' }
      });
    }
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Printscrafter server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
