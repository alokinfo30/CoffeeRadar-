/**
 * RAG Knowledge Base & Cosine Similarity Search
 * Contains verified domain documents on:
 * 1. Coffee chemistry & cyclist hydration/caffeine bioavailability
 * 2. Strict decaf extraction standards (< 3.0 mg caffeine per serving threshold)
 * 3. Dietary allergen matrices & cross-contact exclusions (nuts, dairy, gluten)
 * 4. Urban bike corridor shop siting criteria & BigQuery spatial metrics
 */

export interface KnowledgeDocument {
  id: string;
  category: 'coffee_chemistry' | 'decaf_standards' | 'dietary_allergens' | 'siting_criteria' | 'cyclist_nutrition';
  title: string;
  content: string;
  keywords: string[];
  metadata: Record<string, any>;
}

export const KNOWLEDGE_CORPUS: KnowledgeDocument[] = [
  {
    id: 'RAG-DECAF-01',
    category: 'decaf_standards',
    title: 'Swiss Water & Mountain Water Decaffeination Purity Thresholds',
    content: 'Standard commercial decaf often contains 8mg-15mg of residual caffeine. For sensitive endurance athletes and late-afternoon recovery, VeloBrew enforces a strict certified ceiling of less than 3.0 mg caffeine per 12oz serving. The Swiss Mountain Water process achieves 99.9% caffeine removal without chemical solvents like methylene chloride, preserving chlorogenic acid antioxidants essential for cellular recovery.',
    keywords: ['decaf', 'threshold', 'caffeine', 'swiss water', 'purity', 'antioxidant', 'sleep', 'recovery', '3mg'],
    metadata: { maxCaffeineMg: 3.0, solventFree: true, certifiedStandard: 'ISO-17025' }
  },
  {
    id: 'RAG-ALLERGEN-01',
    category: 'dietary_allergens',
    title: 'Comprehensive Dietary Allergen & Cross-Contact Protocols',
    content: 'To prevent adverse athletic reactions, VeloBrew implements isolated allergen preparation stations. Almond Flapjacks and Roasted Pecan Banana Bread contain tree nuts (almonds, pecans). Whole milk and Flat Whites contain dairy lactose. Our Gluten-Free Banana Bread utilizes dedicated gluten-free oat flour and is stored in sealed display cloches. Velocita Nitro Cold Brew and Peloton Matcha Tonic are 100% free of dairy, nuts, gluten, and soy allergens.',
    keywords: ['allergen', 'nuts', 'dairy', 'gluten', 'soy', 'cross-contamination', 'vegan', 'lactose', 'celiac'],
    metadata: { allergenIsolation: true, treeNutsPresent: true, dairyFreeOptions: true }
  },
  {
    id: 'RAG-SITING-01',
    category: 'siting_criteria',
    title: 'BigQuery Bike Corridor Siting Matrix & Spatial ROI Criteria',
    content: 'Optimal coffee shop placement along urban cycling networks requires 5 key spatial signals: 1) Proximity to a protected class-IV cycle track (< 50 meters), 2) Morning rush commuter surge exceeding 40% of total daily trips between 7:00 AM and 9:30 AM, 3) Competitor buffer radius > 300 meters, 4) Cyclist Station Density index > 85, and 5) Ample frontage for roll-through bidon refill and secure lockup corrals.',
    keywords: ['siting', 'bigquery', 'corridor', 'bike lane', 'commuter', 'roi', 'density', 'location', 'placement'],
    metadata: { minMorningRushPct: 40, minCompetitorBufferMeters: 300, targetCycleTrackClass: 'IV' }
  },
  {
    id: 'RAG-CHEM-01',
    category: 'coffee_chemistry',
    title: 'Nitro Cold Brew Bioavailability & Aerobic Performance',
    content: 'Micro-nitrogenated cold brew enhances lipid emulsion and accelerates caffeine absorption through gastric mucosa compared to hot filter coffee. Delivering 220mg of bioavailable caffeine with low chlorogenic acid astringency prevents gastrointestinal distress during sustained threshold cycling efforts (Zone 4/5).',
    keywords: ['nitro', 'cold brew', 'bioavailability', 'wattage', 'endurance', 'gastric', 'caffeine', 'performance'],
    metadata: { phLevel: 5.4, caffeinePerOz: 18.3 }
  },
  {
    id: 'RAG-ELECTRO-01',
    category: 'cyclist_nutrition',
    title: 'Electrolyte Balance in Espresso Ristretto Formulations',
    content: 'Sweat rate during 2-hour summer cycling rides averages 1.2 to 1.8 liters/hr with significant loss of sodium (800-1500mg) and potassium. The Aero Flat White balances 150mg caffeine with 120mg Himalayan pink salt and 45mg bio-chelated magnesium, supporting neuromuscular signaling and preventing calf cramping.',
    keywords: ['electrolyte', 'sodium', 'magnesium', 'cramp', 'espresso', 'hydration', 'flat white'],
    metadata: { sodiumMg: 120, magnesiumMg: 45 }
  }
];

export class RAGKnowledgeEngine {
  /**
   * Tokenizes text into normalized word frequency vectors.
   */
  private static tokenize(text: string): Map<string, number> {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const freq = new Map<string, number>();
    for (const token of tokens) {
      freq.set(token, (freq.get(token) || 0) + 1);
    }
    return freq;
  }

  /**
   * Calculates cosine similarity between two term frequency maps.
   */
  public static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, countA] of vecA.entries()) {
      normA += countA * countA;
      const countB = vecB.get(term) || 0;
      dotProduct += countA * countB;
    }

    for (const countB of vecB.values()) {
      normB += countB * countB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Performs semantic vector search over the knowledge corpus using cosine similarity.
   */
  public static search(query: string, topK: number = 3, minScore: number = 0.05): {
    document: KnowledgeDocument;
    score: number;
  }[] {
    const queryVec = this.tokenize(query);

    const scored = KNOWLEDGE_CORPUS.map((doc) => {
      // Build document text incorporating keywords with higher weight
      const docText = `${doc.title} ${doc.content} ${doc.keywords.join(' ')} ${doc.keywords.join(' ')}`;
      const docVec = this.tokenize(docText);
      const score = this.cosineSimilarity(queryVec, docVec);
      return { document: doc, score };
    });

    return scored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Evaluates dietary allergen exclusion for a given list of excluded allergens.
   */
  public static filterAllergenSafeItems(
    items: { id: string; name: string; allergens: string[] }[],
    excludedAllergens: string[]
  ): { safeItems: typeof items; excludedItems: typeof items } {
    const safeItems: typeof items = [];
    const excludedItems: typeof items = [];

    for (const item of items) {
      const hasExcluded = item.allergens.some((allergen) =>
        excludedAllergens.includes(allergen.toLowerCase())
      );
      if (hasExcluded) {
        excludedItems.push(item);
      } else {
        safeItems.push(item);
      }
    }

    return { safeItems, excludedItems };
  }

  /**
   * Validates if a coffee item meets strict Decaf thresholds (< 3.0 mg caffeine).
   */
  public static validateDecafThreshold(item: { name: string; caffeineMg: number; isDecaf: boolean }): {
    compliant: boolean;
    caffeineMg: number;
    thresholdMg: number;
    reason: string;
  } {
    const THRESHOLD = 3.0;
    if (!item.isDecaf) {
      return {
        compliant: false,
        caffeineMg: item.caffeineMg,
        thresholdMg: THRESHOLD,
        reason: `${item.name} is a standard caffeinated product (${item.caffeineMg}mg caffeine).`
      };
    }

    const compliant = item.caffeineMg < THRESHOLD;
    return {
      compliant,
      caffeineMg: item.caffeineMg,
      thresholdMg: THRESHOLD,
      reason: compliant
        ? `Compliant: ${item.caffeineMg}mg caffeine is below the <${THRESHOLD}mg certified decaf limit.`
        : `Non-compliant: ${item.caffeineMg}mg caffeine exceeds the <${THRESHOLD}mg decaf ceiling.`
    };
  }
}
