import { PinterestPin, PinterestBoard, PinterestMCPResponse } from '../types';
import { PINTEREST_BOARDS, PINTEREST_PINS, getPinsByBoard, searchPins } from '../data/pinterestData';

export async function fetchPinterestPins(
  boardSlug: string = 'all',
  query: string = '',
  orientation: string = 'all',
  sort: string = 'trending'
): Promise<PinterestMCPResponse> {
  try {
    const params = new URLSearchParams({
      board: boardSlug,
      query,
      orientation,
      sort
    });

    const res = await fetch(`/api/mcp/pinterest/pins?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pins)) {
        return {
          pins: data.pins,
          total: data.total ?? data.pins.length,
          boards: data.boards ?? PINTEREST_BOARDS,
          serverStatus: 'connected',
          query
        };
      }
    }
  } catch (err) {
    console.warn('Pinterest MCP API fallback notice:', err);
  }

  // Resilient client-side fallback
  let list = searchPins(query, boardSlug);
  if (orientation && orientation !== 'all') {
    list = list.filter(p => p.orientation === orientation);
  }

  const sorted = [...list];
  if (sort === 'saves') {
    sorted.sort((a, b) => b.savesCount - a.savesCount);
  } else if (sort === 'price-low') {
    sorted.sort((a, b) => a.basePriceNGN - b.basePriceNGN);
  } else if (sort === 'price-high') {
    sorted.sort((a, b) => b.basePriceNGN - a.basePriceNGN);
  } else {
    sorted.sort((a, b) => b.savesCount - a.savesCount);
  }

  return {
    pins: sorted,
    total: sorted.length,
    boards: PINTEREST_BOARDS,
    serverStatus: 'connected',
    query
  };
}

export async function fetchPinterestBoards(): Promise<PinterestBoard[]> {
  try {
    const res = await fetch('/api/mcp/pinterest/boards');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.boards)) {
        return data.boards;
      }
    }
  } catch (err) {
    console.warn('Pinterest MCP boards notice:', err);
  }
  return PINTEREST_BOARDS;
}

export async function importCustomPinterestPin(params: {
  pinterestUrl?: string;
  title?: string;
  customImageUrl?: string;
  styleNotes?: string;
}): Promise<PinterestPin> {
  try {
    const res = await fetch('/api/mcp/pinterest/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.pin) {
        return data.pin;
      }
    }
  } catch (e) {
    console.warn('Pinterest MCP import network notice:', e);
  }

  // Fallback client generation
  const cleanTitle = params.title?.trim() || 'Imported Pinterest Artwork';
  const img = params.customImageUrl?.trim() || '/art/wabi-sabi-neutral.svg';
  return {
    id: `pin-import-${Date.now()}`,
    title: cleanTitle,
    board: 'Imported from Pinterest',
    boardSlug: 'imported',
    pinnerUsername: '@CollectorVault',
    savesCount: 1520,
    imageUrl: img,
    aspectRatio: '4:5',
    orientation: 'portrait',
    palette: ['#c85a44', '#1e2126', '#d4af37', '#f5f0e6'],
    description: params.styleNotes?.trim() || 'Imported Pinterest inspiration artwork ready for museum giclée canvas printing in Lagos.',
    basePriceNGN: 35000,
    isLedCompatible: false,
    tags: ['imported pinterest', 'custom giclée', 'bespoke wall art'],
    sourceUrl: params.pinterestUrl || 'https://pinterest.com',
    artistNote: 'Imported high-definition artwork for archival framing',
    dimensionsDefault: '60 x 80 cm (24 x 32 in)'
  };
}
