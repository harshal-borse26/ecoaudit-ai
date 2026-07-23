const UTILITY_TYPE_MAPPINGS = [
  { keywords: ["elect", "power", "unit"], target: "electricity" },
  { keywords: ["water", "aqua"], target: "water" },
  { keywords: ["gas", "fuel", "therm"], target: "gas" }
];

const EMISSION_FACTORS = {
  electricity: {
    // Base unit factor: kWh
    factor: 0.716,
    units: {
      kwh: 1,
      unit: 1,
      units: 1
    }
  },
  water: {
    // Base unit factor: gallons
    factor: 0.0013,
    units: {
      gallon: 1,
      gallons: 1,
      l: 0.264172,
      liter: 0.264172,
      liters: 0.264172,
      litre: 0.264172,
      litres: 0.264172,
      kl: 264.172,
      kilolitre: 264.172,
      kilolitres: 264.172
    }
  },
  gas: {
    // Base unit factor: therms
    factor: 5.3,
    units: {
      therm: 1,
      therms: 1,
      m3: 0.353,
      "m³": 0.353,
      scm: 0.353,
      sm3: 0.353,
      "cubic meter": 0.353,
      "cubic meters": 0.353
    }
  }
};

export const calculateCarbonEmission = (
    utilityType,
    usage,
    unit
) => {

    if (!utilityType || usage == null || isNaN(Number(usage)) || !unit) {
        return 0;
    }

    // 1. Normalize utility type
    const typeLower = String(utilityType).toLowerCase().trim();
    let matchedType = null;
    for (const mapping of UTILITY_TYPE_MAPPINGS) {
        if (mapping.keywords.some(kw => typeLower.includes(kw))) {
            matchedType = mapping.target;
            break;
        }
    }

    if (!matchedType) {
        return 0;
    }

    // 2. Normalize unit (lowercase, trim extra spacing)
    const unitLower = String(unit).toLowerCase().trim().replace(/\s+/g, " ");

    const config = EMISSION_FACTORS[matchedType];
    if (!config) {
        return 0;
    }

    // 3. Retrieve unit conversion multiplier
    const multiplier = config.units[unitLower];
    if (multiplier === undefined) {
        return 0; // Return 0 for unknown unit format safely
    }

    // 4. Calculate standard usage & carbon emissions
    const standardUsage = Number(usage) * multiplier;
    const emission = standardUsage * config.factor;

    return Number(emission.toFixed(2));

};