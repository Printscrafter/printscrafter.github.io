import { Product, Currency } from '../types';

export interface AICurationResult {
  collectionTitle: string;
  curatorCritique: string;
  styleVibe: string;
  paletteHexCodes: string[];
  recommendedProductIds: number[];
  reasons: Array<{
    productId: number;
    matchScore: number;
    stylingAdvice: string;
  }>;
}

export async function fetchAICuration(
  likedProducts: Product[],
  collectorTier?: string,
  currency?: Currency
): Promise<AICurationResult> {
  try {
    const res = await fetch('/api/curator/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        likedProducts: likedProducts.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          isLed: p.isLed
        })),
        collectorTier: collectorTier || 'Collector',
        currency: currency || 'NGN'
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.curation) {
      return data.curation as AICurationResult;
    }
    throw new Error('Invalid response structure');
  } catch (error) {
    console.warn('Using client-side fallback curation:', error);
    // Intelligent client-side fallback matching contemporary SVG catalogue
    const hasLed = likedProducts.some(p => p.isLed || p.category === 'LED & Smart Art');
    const hasFunctional = likedProducts.some(p => p.category === 'Functional Wall Decor');
    const hasLineArt = likedProducts.some(p => p.category === 'Minimalist Line Art');
    const hasShapeArt = likedProducts.some(p => p.category === 'Shape & Abstract');
    
    let recommended = [1, 4, 10];
    let title = "The Lagos Contemporary Atelier Ensemble";
    let vibe = "Modern African Impressionism & Functional Elegance";
    
    if (hasLed) {
      recommended = [13, 14, 1];
      title = "Cybernetic Luminescence & Midnight Eko";
      vibe = "Ambient Sound-Reactive Glow with High-Contrast Cityscapes";
    } else if (hasFunctional) {
      recommended = [10, 11, 12];
      title = "Curated Functional Wall Decor & Acoustic Harmony";
      vibe = "Acoustic Slatted Fluting, Silent Quartz Clock Art & Ambient Halo Glow";
    } else if (hasLineArt) {
      recommended = [4, 5, 6];
      title = "Monochrome Japandi & Afro-Minimalist Lineage";
      vibe = "Pure Continuous Charcoal Contours & Calming Botanical Fronds";
    } else if (hasShapeArt) {
      recommended = [7, 8, 9];
      title = "Warm Terracotta Arches & Bohemian Balance";
      vibe = "Earthy Sun Disks, River Stones & Bauhaus Geometric Intersections";
    }

    return {
      collectionTitle: title,
      curatorCritique: likedProducts.length > 0
        ? `Formulated around your ${likedProducts.length} liked piece${likedProducts.length === 1 ? '' : 's'}. This curated ensemble balances focal point contrast with functional gallery flow for modern Lagos living.`
        : "Curated by our Lekki Phase 1 studio team as the foremost trending contemporary wall art pieces for luxury residences and modern apartments in Lagos.",
      styleVibe: vibe,
      paletteHexCodes: ["#f8fafc", "#d4af37", "#cf5c36", "#1c2541"],
      recommendedProductIds: recommended,
      reasons: recommended.map((id, index) => ({
        productId: id,
        matchScore: 97 - (index * 2),
        stylingAdvice: "Pair with Brushed Gold or Modern Black frame in Dining, Foyer, or Living spaces."
      }))
    };
  }
}
