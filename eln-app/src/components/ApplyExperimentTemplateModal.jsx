import { useState } from 'react'

const STORAGE_KEY = 'eln_experiment_templates'

// ── Default seed templates ────────────────────────────────────────
const DEFAULT_TEMPLATES = [
  {
    id: 'default-tpl-001',
    name: 'Standard O/W Emulsion Base',
    category: 'Emulsions',
    version: '1.0.0',
    description: 'Classic oil-in-water emulsion base for moisturizers and lotions. Stable across a wide temperature range with a soft, non-greasy skin feel.',
    createdAt: '15-01-2025 09:00',
    summary: { stages: 3, formulas: 1, materials: 10, procedures: 9 },
    data: {
      collaboratorData: {
        manager: 'Ahmad Rasyid',
        contributors: ['Siti Rahayu', 'Marcus Lee'],
        fields: [
          { label: 'Project Name',    value: 'Emulsion Base Development', icon: 'folder_open' },
          { label: 'Product Name',    value: 'Standard O/W Emulsion',     icon: 'inventory_2' },
          { label: 'Experiment Name', value: 'Base Formula v1.0',          icon: 'science'     },
          { label: 'Retained Sample', value: '50 g',                       icon: 'colorize'    },
          { label: 'Location',        value: 'Lab A – Formulation Room',   icon: 'location_on' },
        ],
      },
      studyBgHtml: '<h3>Background</h3><p>Oil-in-water (O/W) emulsions are among the most widely used formulations in topical skincare. This standard base provides a stable, cosmetically elegant platform for the incorporation of active ingredients.</p><h3>Study Design</h3><p>This formulation uses cetearyl alcohol and polysorbate 60 as emulsifying agents. Carbomer 940 provides rheological control. All three phases are prepared separately and combined at equivalent temperatures to ensure complete emulsification.</p><h3>Objective</h3><p>To develop a reproducible, stable O/W emulsion base with a pH of 5.5–6.5 and viscosity of 15,000–35,000 cP, suitable as a carrier vehicle for active ingredients.</p>',
      specRows: [
        { id: 1, parameter: 'Appearance',          specification: 'White to off-white, homogeneous cream', unit: ''      },
        { id: 2, parameter: 'pH',                  specification: '5.5 – 6.5',                             unit: 'pH'    },
        { id: 3, parameter: 'Viscosity',            specification: '15,000 – 35,000',                       unit: 'cP'    },
        { id: 4, parameter: 'Density',             specification: '0.95 – 1.02',                            unit: 'g/mL'  },
        { id: 5, parameter: 'Microbial Count',     specification: '≤ 100 CFU/g',                            unit: 'CFU/g' },
        { id: 6, parameter: 'Preservative Efficacy', specification: 'Pass (Category 2)',                  unit: ''      },
      ],
      stages: [
        { id: 1, name: 'Water Phase', materials: [
          { id: 'm1', code: 'MAT-001', name: 'Purified Water, USP Grade',       type: 'MATERIAL', qty: '72.5', uom: 'g' },
          { id: 'm2', code: 'MAT-042', name: 'Glycerin USP, Vegetable Source',  type: 'MATERIAL', qty: '3.0',  uom: 'g' },
          { id: 'm3', code: 'MAT-089', name: 'Carbomer 940',                    type: 'MATERIAL', qty: '0.5',  uom: 'g' },
          { id: 'm4', code: 'MAT-091', name: 'Disodium EDTA',                   type: 'REAGENT',  qty: '0.1',  uom: 'g' },
        ]},
        { id: 2, name: 'Oil Phase', materials: [
          { id: 'm5', code: 'MAT-102', name: 'Cetearyl Alcohol',                type: 'MATERIAL', qty: '4.0',  uom: 'g' },
          { id: 'm6', code: 'MAT-105', name: 'Mineral Oil, Light',              type: 'MATERIAL', qty: '8.0',  uom: 'g' },
          { id: 'm7', code: 'MAT-110', name: 'Polysorbate 60',                  type: 'MATERIAL', qty: '2.0',  uom: 'g' },
          { id: 'm8', code: 'MAT-115', name: 'Beeswax, White',                  type: 'MATERIAL', qty: '1.5',  uom: 'g' },
        ]},
        { id: 3, name: 'Emulsification & Finishing', materials: [
          { id: 'm9',  code: 'MAT-200', name: 'Phenoxyethanol',                 type: 'REAGENT',  qty: '0.9',  uom: 'g' },
          { id: 'm10', code: 'MAT-201', name: 'Sodium Hydroxide 10% Solution',  type: 'REAGENT',  qty: 'q.s.', uom: 'g' },
        ]},
      ],
      formulas: [{ id: 1, name: 'Formula 1', scale: 100, includedStageIds: [] }],
      stepContent: {
        '1-1': [
          { id: 'p1', title: 'Prepare & Heat Water Phase',
            description: '<p>Weigh <span contenteditable="false" data-m="mat">Purified Water, USP Grade</span> into a stainless steel beaker. Add <span contenteditable="false" data-m="mat">Glycerin USP, Vegetable Source</span> and stir until homogeneous. Slowly sprinkle <span contenteditable="false" data-m="mat">Carbomer 940</span> while mixing to avoid clumping. Add <span contenteditable="false" data-m="mat">Disodium EDTA</span>. Heat to 75–80 °C.</p>',
            criteria: [{ id: 'c1', name: 'Temperature', inputType: 'number', unit: '°C', min: '75', max: '80' }, { id: 'c2', name: 'Mixing Speed', inputType: 'number', unit: 'rpm', min: '200', max: '400' }] },
          { id: 'p2', title: 'Inspect Water Phase',
            description: '<p>Confirm complete dissolution. Solution should be clear to slightly hazy and uniform before proceeding.</p>',
            criteria: [{ id: 'c3', name: 'Appearance', inputType: 'text', unit: '' }] },
          { id: 'p3', title: 'Hold at Temperature',
            description: '<p>Maintain water phase at 75–80 °C until oil phase is ready. Do not allow to cool below 72 °C.</p>',
            criteria: [{ id: 'c4', name: 'Temperature', inputType: 'number', unit: '°C', min: '72', max: '80' }] },
        ],
        '1-2': [
          { id: 'p4', title: 'Melt Oil Phase',
            description: '<p>Combine <span contenteditable="false" data-m="mat">Cetearyl Alcohol</span>, <span contenteditable="false" data-m="mat">Beeswax, White</span>, <span contenteditable="false" data-m="mat">Mineral Oil, Light</span>, and <span contenteditable="false" data-m="mat">Polysorbate 60</span> in a separate beaker. Heat to 75–80 °C until all waxes have melted completely.</p>',
            criteria: [{ id: 'c5', name: 'Temperature', inputType: 'number', unit: '°C', min: '75', max: '80' }, { id: 'c6', name: 'Appearance', inputType: 'text', unit: '' }] },
          { id: 'p5', title: 'Inspect Oil Phase',
            description: '<p>All solids must be fully melted. The phase should appear clear, uniform, and mobile.</p>',
            criteria: [{ id: 'c7', name: 'Clarity', inputType: 'yes_no', unit: '' }] },
        ],
        '1-3': [
          { id: 'p6', title: 'Emulsification',
            description: '<p>With both phases at 75–80 °C, slowly pour oil phase into water phase under high-shear mixing at 3,000 rpm for 10 minutes. Reduce to 1,500 rpm and cool to 40 °C.</p>',
            criteria: [{ id: 'c8', name: 'Mixing Speed', inputType: 'number', unit: 'rpm', min: '2500', max: '3500' }, { id: 'c9', name: 'Duration', inputType: 'number', unit: 'min', min: '10', max: '15' }] },
          { id: 'p7', title: 'pH Adjustment',
            description: '<p>At 40 °C, add <span contenteditable="false" data-m="mat">Sodium Hydroxide 10% Solution</span> dropwise to neutralize Carbomer and reach target pH.</p>',
            criteria: [{ id: 'c10', name: 'pH Level', inputType: 'number', unit: 'pH', min: '5.5', max: '6.5' }] },
          { id: 'p8', title: 'Add Preservative',
            description: '<p>Cool below 40 °C. Add <span contenteditable="false" data-m="mat">Phenoxyethanol</span> and mix for 5 minutes to ensure homogeneous distribution.</p>',
            criteria: [{ id: 'c11', name: 'Temperature', inputType: 'number', unit: '°C', min: '35', max: '40' }] },
          { id: 'p9', title: 'Final QC Check',
            description: '<p>Sample the batch and measure pH, viscosity, and appearance. Record all values. Batch passes if all specifications are met.</p>',
            criteria: [{ id: 'c12', name: 'pH Level', inputType: 'number', unit: 'pH', min: '5.5', max: '6.5' }, { id: 'c13', name: 'Viscosity', inputType: 'number', unit: 'cP', min: '15000', max: '35000' }, { id: 'c14', name: 'Appearance', inputType: 'text', unit: '' }] },
        ],
      },
    },
  },

  {
    id: 'default-tpl-002',
    name: 'Vitamin C Brightening Serum',
    category: 'Serums',
    version: '2.1.0',
    description: 'Antioxidant-rich brightening serum featuring stabilised L-ascorbic acid combined with niacinamide and hyaluronic acid for a synergistic glow effect.',
    createdAt: '03-03-2025 11:30',
    summary: { stages: 3, formulas: 1, materials: 9, procedures: 7 },
    data: {
      collaboratorData: {
        manager: 'Elena Smith',
        contributors: ['Priya Nair', 'Nurul Hidayah'],
        fields: [
          { label: 'Project Name',    value: 'Brightening Actives Series',  icon: 'folder_open' },
          { label: 'Product Name',    value: 'Vit-C Brightening Serum',     icon: 'inventory_2' },
          { label: 'Experiment Name', value: 'VCS-2.1 Stability Trial',     icon: 'science'     },
          { label: 'Retained Sample', value: '20 mL',                       icon: 'colorize'    },
          { label: 'Location',        value: 'Lab B – Actives Suite',       icon: 'location_on' },
        ],
      },
      studyBgHtml: '<h3>Background</h3><p>L-Ascorbic acid (Vitamin C) is the gold-standard antioxidant for topical brightening and anti-ageing. Its instability at neutral pH and in the presence of transition metals requires careful formulation at pH 2.5–3.5 and use of chelating agents.</p><h3>Study Design</h3><p>This formulation combines 15% L-ascorbic acid with 0.5% ferulic acid as a potentiating antioxidant and 2% niacinamide for skin-barrier reinforcement. Hyaluronic acid is used as a humectant vehicle. The pH is adjusted to 3.0 with sodium hydroxide.</p><h3>Objective</h3><p>To develop a light, fast-absorbing brightening serum with a 12-month stability window, delivering measurable improvement in skin luminosity and reduction of hyperpigmentation within 8 weeks of use.</p>',
      specRows: [
        { id: 1, parameter: 'Appearance',         specification: 'Clear to pale yellow, water-thin liquid', unit: ''     },
        { id: 2, parameter: 'pH',                 specification: '2.8 – 3.2',                               unit: 'pH'   },
        { id: 3, parameter: 'Viscosity',           specification: '50 – 200',                               unit: 'cP'   },
        { id: 4, parameter: 'Ascorbic Acid Assay', specification: '≥ 14.0%',                               unit: '% w/w' },
        { id: 5, parameter: 'Colour (Yellowness)', specification: 'YI ≤ 15 (fresh batch)',                 unit: 'YI'   },
        { id: 6, parameter: 'Microbial Count',    specification: '≤ 100 CFU/mL',                           unit: 'CFU/mL'},
      ],
      stages: [
        { id: 1, name: 'Aqueous Phase', materials: [
          { id: 'm1', code: 'MAT-001', name: 'Purified Water, USP Grade',    type: 'MATERIAL', qty: '78.5', uom: 'mL' },
          { id: 'm2', code: 'MAT-042', name: 'Glycerin USP, Vegetable Source', type: 'MATERIAL', qty: '5.0', uom: 'mL' },
          { id: 'm3', code: 'MAT-310', name: 'Hyaluronic Acid 1% Solution',  type: 'MATERIAL', qty: '5.0',  uom: 'mL' },
        ]},
        { id: 2, name: 'Active Complex', materials: [
          { id: 'm4', code: 'MAT-321', name: 'L-Ascorbic Acid, USP',         type: 'SAMPLE',   qty: '15.0', uom: 'g'  },
          { id: 'm5', code: 'MAT-322', name: 'Niacinamide, BP',              type: 'MATERIAL', qty: '2.0',  uom: 'g'  },
          { id: 'm6', code: 'MAT-323', name: 'Ferulic Acid',                 type: 'REAGENT',  qty: '0.5',  uom: 'g'  },
          { id: 'm7', code: 'MAT-091', name: 'Disodium EDTA',                type: 'REAGENT',  qty: '0.05', uom: 'g'  },
        ]},
        { id: 3, name: 'Preservation & pH', materials: [
          { id: 'm8', code: 'MAT-200', name: 'Phenoxyethanol',               type: 'REAGENT',  qty: '0.8',  uom: 'g'  },
          { id: 'm9', code: 'MAT-201', name: 'Sodium Hydroxide 10% Solution', type: 'REAGENT', qty: 'q.s.', uom: 'mL' },
        ]},
      ],
      formulas: [{ id: 1, name: 'Formula 1', scale: 100, includedStageIds: [] }],
      stepContent: {
        '1-1': [
          { id: 'p1', title: 'Prepare Aqueous Phase',
            description: '<p>Weigh <span contenteditable="false" data-m="mat">Purified Water, USP Grade</span> (previously degassed by nitrogen sparging) into an amber glass vessel. Add <span contenteditable="false" data-m="mat">Glycerin USP, Vegetable Source</span> and stir gently. Incorporate <span contenteditable="false" data-m="mat">Hyaluronic Acid 1% Solution</span> and mix until uniform.</p>',
            criteria: [{ id: 'c1', name: 'Temperature', inputType: 'number', unit: '°C', min: '15', max: '25' }, { id: 'c2', name: 'Nitrogen Blanket', inputType: 'yes_no', unit: '' }] },
          { id: 'p2', title: 'Disperse EDTA',
            description: '<p>Add <span contenteditable="false" data-m="mat">Disodium EDTA</span> to the aqueous phase and stir until completely dissolved (≈ 5 min). EDTA chelates trace metals that would otherwise degrade ascorbic acid.</p>',
            criteria: [{ id: 'c3', name: 'Dissolution', inputType: 'yes_no', unit: '' }] },
        ],
        '1-2': [
          { id: 'p3', title: 'Dissolve Active Complex',
            description: '<p>In a separate amber container, dissolve <span contenteditable="false" data-m="mat">L-Ascorbic Acid, USP</span> in a small aliquot of the prepared aqueous phase. Add <span contenteditable="false" data-m="mat">Ferulic Acid</span> and stir until dissolved. Finally incorporate <span contenteditable="false" data-m="mat">Niacinamide, BP</span>.</p><p><strong>Work under red or amber light to minimise photo-oxidation.</strong></p>',
            criteria: [{ id: 'c4', name: 'Dissolution Complete', inputType: 'yes_no', unit: '' }, { id: 'c5', name: 'Colour (YI)', inputType: 'number', unit: 'YI', min: '0', max: '10' }] },
          { id: 'p4', title: 'Combine Phases',
            description: '<p>Slowly add active complex to the aqueous phase under gentle stirring. Avoid incorporating air. Mix for 10 minutes at ≤ 500 rpm.</p>',
            criteria: [{ id: 'c6', name: 'Mixing Speed', inputType: 'number', unit: 'rpm', min: '200', max: '500' }, { id: 'c7', name: 'Duration', inputType: 'number', unit: 'min', min: '10', max: '15' }] },
        ],
        '1-3': [
          { id: 'p5', title: 'Add Preservative',
            description: '<p>Add <span contenteditable="false" data-m="mat">Phenoxyethanol</span> and mix until homogeneous.</p>',
            criteria: [{ id: 'c8', name: 'Mix Duration', inputType: 'number', unit: 'min', min: '3', max: '5' }] },
          { id: 'p6', title: 'pH Adjustment',
            description: '<p>Add <span contenteditable="false" data-m="mat">Sodium Hydroxide 10% Solution</span> dropwise under constant stirring to reach target pH 2.8–3.2. Re-check after 5 min equilibration.</p>',
            criteria: [{ id: 'c9', name: 'pH Level', inputType: 'number', unit: 'pH', min: '2.8', max: '3.2' }] },
          { id: 'p7', title: 'Final QC & Filling',
            description: '<p>Measure pH, viscosity, and appearance. Pass to filling only after all specifications are confirmed. Fill into amber or opaque bottles. Store at 4 °C pending release testing.</p>',
            criteria: [{ id: 'c10', name: 'pH Level', inputType: 'number', unit: 'pH', min: '2.8', max: '3.2' }, { id: 'c11', name: 'Viscosity', inputType: 'number', unit: 'cP', min: '50', max: '200' }, { id: 'c12', name: 'Appearance', inputType: 'text', unit: '' }] },
        ],
      },
    },
  },

  {
    id: 'default-tpl-003',
    name: 'Ibuprofen 400 mg IR Tablet',
    category: 'Tablets',
    version: '1.3.0',
    description: 'Immediate-release ibuprofen 400 mg tablet manufactured via wet granulation. Designed for analgesic and anti-inflammatory applications.',
    createdAt: '20-02-2025 14:15',
    summary: { stages: 3, formulas: 1, materials: 8, procedures: 8 },
    data: {
      collaboratorData: {
        manager: 'Hendra Wijaya',
        contributors: ['Marcus Lee', 'Siti Rahayu'],
        fields: [
          { label: 'Project Name',    value: 'Solid Dosage OTC Line',       icon: 'folder_open' },
          { label: 'Product Name',    value: 'Ibuprofen 400 mg Tablet',     icon: 'inventory_2' },
          { label: 'Experiment Name', value: 'Wet Gran. Optimisation Batch', icon: 'science'    },
          { label: 'Retained Sample', value: '100 tablets',                  icon: 'colorize'   },
          { label: 'Location',        value: 'Solid Dosage Suite – Room 3',  icon: 'location_on' },
        ],
      },
      studyBgHtml: '<h3>Background</h3><p>Ibuprofen (2-(4-isobutylphenyl)propionic acid) is a non-selective COX inhibitor indicated for mild-to-moderate pain and fever. Due to its high dose and hydrophobic nature, wet granulation is the preferred manufacturing route to improve compressibility, flowability, and tablet uniformity.</p><h3>Study Design</h3><p>A high-shear wet granulation process is employed. Ibuprofen and microcrystalline cellulose are granulated with an HPMC E5 binder solution. Dried granules are blended with intragranular disintegrant and lubricated prior to compression on a rotary tablet press.</p><h3>Objective</h3><p>To manufacture a robust, immediate-release Ibuprofen 400 mg tablet meeting BP/USP specifications for dissolution (NLT 80% in 60 min, pH 7.2 phosphate buffer), hardness (80–150 N), and content uniformity (85–115%).</p>',
      specRows: [
        { id: 1, parameter: 'Description',          specification: 'White to off-white, biconvex film-coated tablet', unit: ''    },
        { id: 2, parameter: 'Average Weight',        specification: '620 ± 5%',                                        unit: 'mg'  },
        { id: 3, parameter: 'Hardness',             specification: '80 – 150',                                         unit: 'N'   },
        { id: 4, parameter: 'Friability',           specification: '≤ 1.0%',                                           unit: '%'   },
        { id: 5, parameter: 'Disintegration Time',  specification: '≤ 15',                                             unit: 'min' },
        { id: 6, parameter: 'Dissolution (60 min)', specification: 'NLT 80%',                                          unit: '%'   },
        { id: 7, parameter: 'Content Uniformity',   specification: '85 – 115%',                                        unit: '%'   },
        { id: 8, parameter: 'Assay',                specification: '95.0 – 105.0%',                                    unit: '%'   },
      ],
      stages: [
        { id: 1, name: 'Wet Granulation', materials: [
          { id: 'm1', code: 'API-001', name: 'Ibuprofen, USP',                        type: 'SAMPLE',   qty: '400.0', uom: 'mg' },
          { id: 'm2', code: 'MAT-501', name: 'Microcrystalline Cellulose (MCC PH101)', type: 'MATERIAL', qty: '150.0', uom: 'mg' },
          { id: 'm3', code: 'MAT-502', name: 'HPMC E5 (Binder Solution 5% w/v)',      type: 'MATERIAL', qty: '40.0',  uom: 'mL' },
        ]},
        { id: 2, name: 'Drying & Milling', materials: [
          { id: 'm4', code: 'MAT-503', name: 'Croscarmellose Sodium (Intragranular)',  type: 'MATERIAL', qty: '20.0',  uom: 'mg' },
          { id: 'm5', code: 'MAT-055', name: 'Sodium Chloride, USP',                  type: 'MATERIAL', qty: '5.0',   uom: 'mg' },
        ]},
        { id: 3, name: 'Lubrication & Compression', materials: [
          { id: 'm6', code: 'MAT-510', name: 'Croscarmellose Sodium (Extragranular)', type: 'MATERIAL', qty: '10.0',  uom: 'mg' },
          { id: 'm7', code: 'MAT-511', name: 'Magnesium Stearate',                    type: 'REAGENT',  qty: '4.0',   uom: 'mg' },
          { id: 'm8', code: 'MAT-512', name: 'Colloidal Silicon Dioxide',             type: 'MATERIAL', qty: '2.0',   uom: 'mg' },
        ]},
      ],
      formulas: [{ id: 1, name: 'Formula 1', scale: 100, includedStageIds: [] }],
      stepContent: {
        '1-1': [
          { id: 'p1', title: 'Sifting & Blending',
            description: '<p>Pass <span contenteditable="false" data-m="mat">Ibuprofen, USP</span> and <span contenteditable="false" data-m="mat">Microcrystalline Cellulose (MCC PH101)</span> through a 500 µm sieve. Blend in a high-shear granulator at 150 rpm for 5 minutes.</p>',
            criteria: [{ id: 'c1', name: 'Blend Uniformity', inputType: 'yes_no', unit: '' }, { id: 'c2', name: 'Sieve Aperture', inputType: 'number', unit: 'µm', min: '490', max: '510' }] },
          { id: 'p2', title: 'Wet Granulation',
            description: '<p>Prepare <span contenteditable="false" data-m="mat">HPMC E5 (Binder Solution 5% w/v)</span>. Add binder solution to the powder blend at a rate of 10 mL/min while chopper is running at 1,500 rpm. Granulate until end-point is reached (kneading power plateau).</p>',
            criteria: [{ id: 'c3', name: 'Impeller Speed', inputType: 'number', unit: 'rpm', min: '100', max: '200' }, { id: 'c4', name: 'Chopper Speed', inputType: 'number', unit: 'rpm', min: '1200', max: '1800' }] },
          { id: 'p3', title: 'Granule End-Point Check',
            description: '<p>Sample wet granules: they should hold shape when squeezed but crumble when pressure is released. Record power consumption curve end-point time.</p>',
            criteria: [{ id: 'c5', name: 'Appearance', inputType: 'text', unit: '' }] },
        ],
        '1-2': [
          { id: 'p4', title: 'Drying',
            description: '<p>Transfer wet granules to a fluid-bed dryer. Dry at 60 °C inlet air temperature until Loss on Drying (LOD) ≤ 2.0%. Monitor LOD every 15 minutes.</p>',
            criteria: [{ id: 'c6', name: 'LOD', inputType: 'number', unit: '%', min: '0', max: '2.0' }, { id: 'c7', name: 'Inlet Temperature', inputType: 'number', unit: '°C', min: '55', max: '65' }] },
          { id: 'p5', title: 'Milling',
            description: '<p>Mill dried granules through a 1 mm screen. Add <span contenteditable="false" data-m="mat">Croscarmellose Sodium (Intragranular)</span> to the milled granules and blend for 5 minutes.</p>',
            criteria: [{ id: 'c8', name: 'Screen Size', inputType: 'number', unit: 'mm', min: '0.9', max: '1.1' }, { id: 'c9', name: 'LOD Post-Mill', inputType: 'number', unit: '%', min: '0', max: '2.0' }] },
          { id: 'p6', title: 'Particle Size Distribution',
            description: '<p>Perform sieve analysis on milled granules. Target d90 ≤ 800 µm. Record and retain PSD data with batch record.</p>',
            criteria: [{ id: 'c10', name: 'D90', inputType: 'number', unit: 'µm', min: '0', max: '800' }] },
        ],
        '1-3': [
          { id: 'p7', title: 'Lubrication',
            description: '<p>Add extragranular <span contenteditable="false" data-m="mat">Croscarmellose Sodium (Extragranular)</span>, <span contenteditable="false" data-m="mat">Colloidal Silicon Dioxide</span>, and pre-sieved <span contenteditable="false" data-m="mat">Magnesium Stearate</span> to the granule blend. Mix in a bin blender at 10 rpm for exactly 3 minutes. Do not over-blend.</p>',
            criteria: [{ id: 'c11', name: 'Blending Time', inputType: 'number', unit: 'min', min: '3', max: '3' }, { id: 'c12', name: 'Blender Speed', inputType: 'number', unit: 'rpm', min: '8', max: '12' }] },
          { id: 'p8', title: 'Tablet Compression & QC',
            description: '<p>Compress on a rotary tablet press using 13 mm biconvex tooling. In-process checks every 20 minutes: weight, hardness, thickness, and friability. Record all data.</p>',
            criteria: [{ id: 'c13', name: 'Average Weight', inputType: 'number', unit: 'mg', min: '589', max: '651' }, { id: 'c14', name: 'Hardness', inputType: 'number', unit: 'N', min: '80', max: '150' }, { id: 'c15', name: 'Friability', inputType: 'number', unit: '%', min: '0', max: '1.0' }, { id: 'c16', name: 'Disintegration', inputType: 'number', unit: 'min', min: '0', max: '15' }] },
        ],
      },
    },
  },
]

function seedDefaultTemplates() {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (existing.length > 0) return   // already has user templates — don't overwrite
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES))
  } catch { /* ignore */ }
}

function loadTemplates() {
  seedDefaultTemplates()
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return DEFAULT_TEMPLATES }
}
function deleteTemplate(id) {
  const next = loadTemplates().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

const CATEGORY_COLORS = {
  Emulsions:   'bg-sky-100 text-sky-700',
  Serums:      'bg-violet-100 text-violet-700',
  Ointments:   'bg-amber-100 text-amber-700',
  Suspensions: 'bg-teal-100 text-teal-700',
  Tablets:     'bg-rose-100 text-rose-700',
  Capsules:    'bg-orange-100 text-orange-700',
  Others:      'bg-slate-100 text-slate-600',
}

const TYPE_STYLES = {
  MATERIAL: 'bg-emerald-100 text-emerald-700',
  SAMPLE:   'bg-sky-100 text-sky-700',
  REAGENT:  'bg-orange-100 text-orange-700',
}

const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const PREVIEW_TABS = [
  { key: 'info',       label: 'Info',         icon: 'group'                  },
  { key: 'study',      label: 'Study',         icon: 'description'            },
  { key: 'spec',       label: 'Specification', icon: 'assignment_turned_in'   },
  { key: 'materials',  label: 'Materials',     icon: 'science'                },
  { key: 'procedures', label: 'Procedures',    icon: 'list_alt'               },
]

/* ── Preview: Experiment Info ────────────────────────────────────── */
function PreviewInfo({ preview }) {
  const data = preview.data.collaboratorData
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>group</span>
        <p className="text-xs text-slate-400">Experiment info was not saved with this template.</p>
      </div>
    )
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* Fields */}
      {data.fields?.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Experiment Details</p>
          <div className="grid grid-cols-2 gap-2">
            {data.fields.map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{f.label}</p>
                <p className="text-xs font-medium text-slate-700">{f.value || <span className="text-slate-300 italic">—</span>}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborators */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Manager</p>
          {data.manager ? (
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${AVATAR_COLORS[0]}`}>
                {initials(data.manager)}
              </div>
              <span className="text-xs text-slate-700">{data.manager}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-300 italic">Unassigned</span>
          )}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contributors</p>
          {data.contributors?.length > 0 ? (
            <div className="space-y-1.5">
              {data.contributors.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(name)}
                  </div>
                  <span className="text-xs text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-300 italic">None</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Preview: Study Background ───────────────────────────────────── */
function PreviewStudy({ preview }) {
  const html = preview.data.studyBgHtml
  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>description</span>
        <p className="text-xs text-slate-400">Study background was not saved with this template.</p>
      </div>
    )
  }
  return (
    <div
      className="prose prose-sm max-w-none text-slate-700 leading-relaxed
        [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-4 [&_h1]:mb-1
        [&_h2]:text-sm  [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mt-3 [&_h2]:mb-1
        [&_h3]:text-xs  [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mt-2 [&_h3]:mb-1
        [&_p]:text-[11px] [&_p]:my-1
        [&_ul]:list-disc [&_ul]:pl-4 [&_li]:text-[11px]
        [&_[data-m='mat']]:inline-flex [&_[data-m='mat']]:items-center
        [&_[data-m='mat']]:bg-violet-100 [&_[data-m='mat']]:text-violet-700
        [&_[data-m='mat']]:px-1.5 [&_[data-m='mat']]:py-0.5 [&_[data-m='mat']]:rounded
        [&_[data-m='mat']]:text-[10px] [&_[data-m='mat']]:font-semibold
        [&_[data-m='ins']]:inline-flex [&_[data-m='ins']]:items-center
        [&_[data-m='ins']]:bg-sky-100 [&_[data-m='ins']]:text-sky-700
        [&_[data-m='ins']]:px-1.5 [&_[data-m='ins']]:py-0.5 [&_[data-m='ins']]:rounded
        [&_[data-m='ins']]:text-[10px] [&_[data-m='ins']]:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* ── Preview: Product Specification ─────────────────────────────── */
function PreviewSpec({ preview }) {
  const rows = preview.data.specRows ?? []
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>assignment_turned_in</span>
        <p className="text-xs text-slate-400">Product specification was not saved with this template.</p>
      </div>
    )
  }
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Parameter</th>
            <th className="text-left px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Specification</th>
            <th className="text-left px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20">Unit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
              <td className="px-3 py-2 font-medium text-slate-700">{r.parameter || <span className="text-slate-300 italic">—</span>}</td>
              <td className="px-3 py-2 text-slate-600">{r.specification || <span className="text-slate-300 italic">—</span>}</td>
              <td className="px-3 py-2 text-slate-500 font-mono">{r.unit || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Preview: Materials & Formulation ───────────────────────────── */
function PreviewMaterials({ preview }) {
  const stages   = preview.data.stages   ?? []
  const formulas = preview.data.formulas ?? []

  if (stages.length === 0 && formulas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>science</span>
        <p className="text-xs text-slate-400">No materials were saved with this template.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {stages.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Stages &amp; Materials</p>
          <div className="space-y-3">
            {stages.map((stage, si) => (
              <div key={stage.id ?? si} className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">{si + 1}</span>
                  <span className="text-xs font-semibold text-slate-700">{stage.name || 'Unnamed Stage'}</span>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {stage.materials?.length ?? 0} material{stage.materials?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {stage.materials?.length > 0 ? (
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-24">Code</th>
                        <th className="text-left px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Material</th>
                        <th className="text-right px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20">Qty</th>
                        <th className="text-left px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-12">UoM</th>
                        <th className="text-center px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage.materials.map((mat, mi) => {
                        const typeCls = TYPE_STYLES[mat.type] ?? 'bg-slate-100 text-slate-600'
                        return (
                          <tr key={mat.id ?? mi} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                            <td className="px-3 py-1.5 font-mono text-slate-500">{mat.code || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-700 font-medium">{mat.name || '—'}</td>
                            <td className="px-3 py-1.5 text-right text-slate-600 tabular-nums">{mat.qty || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-500">{mat.uom || '—'}</td>
                            <td className="px-3 py-1.5 text-center">
                              {mat.type && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${typeCls}`}>{mat.type}</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-3 py-2 text-[10px] text-slate-300 italic">No materials in this stage.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {formulas.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Formulas</p>
          <div className="space-y-1.5">
            {formulas.map((f, fi) => {
              const stageCount = Array.isArray(f.includedStageIds) ? f.includedStageIds.length : 0
              return (
                <div key={f.id ?? fi} className="flex items-center justify-between px-3 py-2 bg-violet-50 border border-violet-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-400 text-[14px]">science</span>
                    <span className="text-xs font-semibold text-violet-800">{f.name || `Formula ${fi + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-violet-500">
                    <span>Scale: <strong>{f.scale ?? 100}%</strong></span>
                    <span>{stageCount} stage{stageCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Preview: Procedures ─────────────────────────────────────────── */
function PreviewProcedures({ preview }) {
  const stepContent = preview.data.stepContent ?? {}
  const stages      = preview.data.stages      ?? []
  const formulas    = preview.data.formulas    ?? []
  const allEntries  = Object.entries(stepContent)

  if (allEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>list_alt</span>
        <p className="text-xs text-slate-400">No procedures were saved with this template.</p>
      </div>
    )
  }

  // Keys are `${formulaId}-${stageId}`
  function resolveKey(key) {
    const parts      = key.split('-')
    const stageId    = parts[parts.length - 1]
    const formulaId  = parts.slice(0, parts.length - 1).join('-')
    const stage      = stages.find(s => String(s.id) === stageId)
    const formula    = formulas.find(f => String(f.id) === formulaId)
    return {
      stageName:   stage?.name   ?? `Stage ${stageId}`,
      formulaName: formula?.name ?? `Formula ${formulaId}`,
    }
  }

  return (
    <div className="space-y-6">
      {allEntries.map(([key, procedures]) => {
        const { stageName, formulaName } = resolveKey(key)
        return (
          <div key={key}>
            {/* Group label */}
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-300 text-[14px]">science</span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {formulaName} / {stageName}
              </p>
            </div>

            <div className="space-y-2">
              {procedures.map((proc, pi) => (
                <div key={proc.id ?? pi} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 text-[8px] font-bold flex items-center justify-center shrink-0">{pi + 1}</span>
                    <span className="text-xs font-semibold text-slate-700">{proc.title || `Step ${pi + 1}`}</span>
                  </div>
                  {proc.description ? (
                    <div
                      className="px-3 py-2 text-[11px] text-slate-600 leading-relaxed
                        [&_[data-m='mat']]:inline-flex [&_[data-m='mat']]:items-center
                        [&_[data-m='mat']]:bg-violet-100 [&_[data-m='mat']]:text-violet-700
                        [&_[data-m='mat']]:px-1.5 [&_[data-m='mat']]:py-0.5 [&_[data-m='mat']]:rounded
                        [&_[data-m='mat']]:text-[10px] [&_[data-m='mat']]:font-semibold
                        [&_[data-m='ins']]:inline-flex [&_[data-m='ins']]:items-center
                        [&_[data-m='ins']]:bg-sky-100 [&_[data-m='ins']]:text-sky-700
                        [&_[data-m='ins']]:px-1.5 [&_[data-m='ins']]:py-0.5 [&_[data-m='ins']]:rounded
                        [&_[data-m='ins']]:text-[10px] [&_[data-m='ins']]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: proc.description }}
                    />
                  ) : (
                    <p className="px-3 py-2 text-[10px] text-slate-300 italic">No description.</p>
                  )}
                  {proc.criteria?.length > 0 && (
                    <div className="px-3 pb-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Acceptance Criteria</p>
                      <div className="space-y-1">
                        {proc.criteria.map((c, ci) => (
                          <div key={ci} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                            <span className="material-symbols-outlined text-emerald-400 text-[11px] mt-0.5 shrink-0">check_circle</span>
                            <span>
                              {c.name || c.text || (typeof c === 'string' ? c : '')}
                              {c.unit ? <span className="text-slate-400 ml-1">({c.unit})</span> : null}
                              {(c.min || c.max) ? <span className="text-slate-400 ml-1">{c.min}–{c.max}</span> : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main modal ──────────────────────────────────────────────────── */
export default function ApplyExperimentTemplateModal({ onApply, onClose }) {
  const [templates,       setTemplates]       = useState(loadTemplates)
  const [selected,        setSelected]        = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [previewTab,      setPreviewTab]      = useState('info')

  const preview = selected !== null ? templates[selected] : null

  function handleDelete(id, e) {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }
  function confirmDelete() {
    deleteTemplate(confirmDeleteId)
    const next = loadTemplates()
    setTemplates(next)
    if (selected !== null && selected >= next.length) setSelected(next.length > 0 ? next.length - 1 : null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full flex flex-col overflow-hidden"
        style={{ maxWidth: '900px', maxHeight: '90vh' }}
      >

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>auto_awesome_motion</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply Experiment Template</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Load a saved template to pre-fill stages, materials, and procedures.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left — list */}
          <div className="w-56 shrink-0 border-r border-slate-100 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 px-5 text-center">
                <span className="material-symbols-outlined text-slate-200 dark:text-slate-700" style={{ fontSize: '40px' }}>auto_awesome_motion</span>
                <div>
                  <p className="text-xs font-semibold text-slate-400">No templates yet</p>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">Use Save → Save as Template to create one.</p>
                </div>
              </div>
            ) : (
              <div className="py-2">
                {templates.map((t, i) => {
                  const isActive = selected === i
                  const catCls = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.Others
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelected(i)}
                      className={`group mx-2 mb-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all flex items-start gap-2 ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{t.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : catCls}`}>{t.category}</span>
                          <span className={`text-[9px] font-mono ${isActive ? 'text-white/70' : 'text-slate-400'}`}>v{t.version}</span>
                        </div>
                        <p className={`text-[9px] mt-1 ${isActive ? 'text-white/60' : 'text-slate-300'}`}>{t.createdAt}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(t.id, e)}
                        className={`opacity-0 group-hover:opacity-100 shrink-0 transition-all rounded p-0.5 mt-0.5 ${isActive ? 'hover:bg-white/20 text-white/60 hover:text-white' : 'hover:bg-red-50 text-slate-300 hover:text-red-400'}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right — preview */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0">
            {preview ? (
              <>
                {/* Template info bar */}
                <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>auto_awesome_motion</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{preview.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[preview.category] ?? CATEGORY_COLORS.Others}`}>{preview.category}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">v{preview.version}</span>
                        <span className="text-[10px] text-slate-400">{preview.createdAt}</span>
                      </div>
                      {preview.description && (
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{preview.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Summary stats */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { label: 'Stages',     value: preview.summary?.stages     ?? 0, icon: 'layers',   color: 'text-sky-500',    bg: 'bg-sky-50'    },
                      { label: 'Formulas',   value: preview.summary?.formulas   ?? 0, icon: 'science',  color: 'text-violet-500', bg: 'bg-violet-50' },
                      { label: 'Materials',  value: preview.summary?.materials  ?? 0, icon: 'colorize', color: 'text-amber-500',  bg: 'bg-amber-50'  },
                      { label: 'Procedures', value: preview.summary?.procedures ?? 0, icon: 'list_alt', color: 'text-emerald-500',bg: 'bg-emerald-50'},
                    ].map(({ label, value, icon, color, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
                        <span className={`material-symbols-outlined ${color} text-[16px]`}>{icon}</span>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview tabs */}
                <div className="flex border-b border-slate-100 shrink-0 px-4 pt-2 gap-0.5 overflow-x-auto">
                  {PREVIEW_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setPreviewTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-t-md transition-colors border-b-2 -mb-px shrink-0 ${
                        previewTab === tab.key
                          ? 'border-primary text-primary'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-5">
                  {previewTab === 'info'       && <PreviewInfo      preview={preview} />}
                  {previewTab === 'study'      && <PreviewStudy     preview={preview} />}
                  {previewTab === 'spec'       && <PreviewSpec      preview={preview} />}
                  {previewTab === 'materials'  && <PreviewMaterials preview={preview} />}
                  {previewTab === 'procedures' && <PreviewProcedures preview={preview} />}

                  {/* Warning */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-5">
                    <span className="material-symbols-outlined text-amber-500 shrink-0 text-[16px] mt-0.5">warning</span>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      Applying this template will <strong>replace</strong> the current content. This cannot be undone.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 h-full py-16 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600" style={{ fontSize: '28px' }}>auto_awesome_motion</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400">Select a template to preview</p>
                  <p className="text-[11px] text-slate-300 mt-1">Choose from the list on the left.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400">{templates.length} template{templates.length !== 1 ? 's' : ''} saved</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors">
              Cancel
            </button>
            <button
              onClick={() => preview && onApply(preview)}
              disabled={!preview}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
              Apply Template
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-80">
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">Delete template?</p>
            <p className="text-xs text-slate-500 mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDelete} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
