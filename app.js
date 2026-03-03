/**
 * BioDigestat — Biodigester Sizing Calculator
 * Enhanced version with applications, fertilizer, specs, and flow diagram
 */

(function () {
  'use strict';

  // ===== CONSTANTS =====
  const WASTE_PER_COW = 10;
  const WASTE_PER_PIG = 2.5;
  const WASTE_PER_CHICKEN = 0.1;

  const BIOGAS_COW = 0.04;
  const BIOGAS_PIG = 0.06;
  const BIOGAS_CHICKEN = 0.03;
  const BIOGAS_FOOD = 0.08;

  const WATER_RATIO = 1;
  const HEADSPACE = 1.20;
  const FAMILY_NEED = 2.0;

  // Biogas application equivalences
  const COOKING_PER_M3 = 1;        // 1 m³ = 1h cooking
  const ELEC_PER_M3 = 1.5;         // 1 m³ = 1.5 kWh
  const LAMP_PER_M3 = 5;           // 1 m³ = 5h biogas lamp
  const HEATING_PER_M3 = 0.6;      // 1 m³ = 0.6h room heater

  // Fertilizer
  const DIGESTAT_RATIO = 0.95;     // 95% of substrate becomes digestat
  const FERT_AREA_PER_L = 0.0333;  // ~30L digestat per m² per year → 1L/day covers ~12 m²/year
  const FERT_SAVINGS_PER_M2 = 0.15;// €0.15/m² saved vs chemical fertilizer

  // ===== DOM REFERENCES =====
  const inputCows = document.getElementById('input-cows');
  const inputPigs = document.getElementById('input-pigs');
  const inputChickens = document.getElementById('input-chickens');
  const inputFood = document.getElementById('input-food');
  const climateOptions = document.querySelectorAll('.climate-option');

  // Results
  const elVolume = document.getElementById('result-volume');
  const elBiogas = document.getElementById('result-biogas');
  const elCooking = document.getElementById('result-cooking');
  const elSubstrate = document.getElementById('result-substrate');
  const elProgressValue = document.getElementById('progress-value');
  const elProgressBar = document.getElementById('progress-bar');

  // Detail table
  const elDetailWaste = document.getElementById('detail-waste');
  const elDetailWater = document.getElementById('detail-water');
  const elDetailSubstrate = document.getElementById('detail-substrate');
  const elDetailTrh = document.getElementById('detail-trh');
  const elDetailVolUseful = document.getElementById('detail-vol-useful');
  const elDetailVolTotal = document.getElementById('detail-vol-total');
  const elDetailBiogas = document.getElementById('detail-biogas');
  const elDetailCooking = document.getElementById('detail-cooking');
  const elDetailElec = document.getElementById('detail-elec');

  // Flow diagram
  const elFlowWaste = document.getElementById('flow-waste');
  const elFlowWater = document.getElementById('flow-water');
  const elFlowVolume = document.getElementById('flow-volume');
  const elFlowBiogas = document.getElementById('flow-biogas');
  const elFlowDigestat = document.getElementById('flow-digestat');

  // Applications
  const elAppCooking = document.getElementById('app-cooking');
  const elAppElectricity = document.getElementById('app-electricity');
  const elAppLighting = document.getElementById('app-lighting');
  const elAppHeating = document.getElementById('app-heating');

  // Fertilizer
  const elFertDaily = document.getElementById('fert-daily');
  const elFertYearly = document.getElementById('fert-yearly');
  const elFertArea = document.getElementById('fert-area');
  const elFertSavings = document.getElementById('fert-savings');

  // Specs
  const elSpecVolume = document.getElementById('spec-volume');
  const elSpecTrh = document.getElementById('spec-trh');
  const elSpecBiogas = document.getElementById('spec-biogas');
  const elSpecCooking = document.getElementById('spec-cooking');
  const elSpecInstall = document.getElementById('spec-install');
  const elSpecLifetime = document.getElementById('spec-lifetime');
  const elSpecDigestat = document.getElementById('spec-digestat');
  const elSpecGarden = document.getElementById('spec-garden');

  // SVG
  const elSvgVolume = document.getElementById('svg-volume');
  const elSvgGarden = document.getElementById('svg-garden');

  // Recommendation
  const elRecoIcon = document.getElementById('reco-icon');
  const elRecoTitle = document.getElementById('reco-title');
  const elRecoDesc = document.getElementById('reco-desc');
  const elRecoTag = document.getElementById('reco-tag');

  // ===== STATE =====
  let selectedTRH = 30;

  // ===== CLIMATE SELECTION =====
  climateOptions.forEach(option => {
    option.addEventListener('click', () => {
      climateOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      selectedTRH = parseInt(option.dataset.trh, 10);
      calculate();
    });
  });

  // ===== INPUT LISTENERS =====
  [inputCows, inputPigs, inputChickens, inputFood].forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  // ===== MAIN CALCULATION =====
  function calculate() {
    const cows = Math.max(0, parseFloat(inputCows.value) || 0);
    const pigs = Math.max(0, parseFloat(inputPigs.value) || 0);
    const chickens = Math.max(0, parseFloat(inputChickens.value) || 0);
    const food = Math.max(0, parseFloat(inputFood.value) || 0);

    // Waste
    const wasteCows = cows * WASTE_PER_COW;
    const wastePigs = pigs * WASTE_PER_PIG;
    const wasteChickens = chickens * WASTE_PER_CHICKEN;
    const totalWaste = wasteCows + wastePigs + wasteChickens + food;

    // Substrate
    const water = totalWaste * WATER_RATIO;
    const substrate = totalWaste + water;
    const trh = selectedTRH;

    // Volume
    const volumeUseful = substrate * trh / 1000;
    const volumeTotal = volumeUseful * HEADSPACE;

    // Biogas
    const biogasDaily =
      wasteCows * BIOGAS_COW +
      wastePigs * BIOGAS_PIG +
      wasteChickens * BIOGAS_CHICKEN +
      food * BIOGAS_FOOD;

    // Applications
    const cookingHours = biogasDaily * COOKING_PER_M3;
    const electricityKwh = biogasDaily * ELEC_PER_M3;
    const lampHours = biogasDaily * LAMP_PER_M3;
    const heatingHours = biogasDaily * HEATING_PER_M3;

    // Fertilizer
    const digestatDaily = substrate * DIGESTAT_RATIO;
    const digestatYearly = digestatDaily * 365 / 1000;
    const fertArea = digestatDaily * FERT_AREA_PER_L * 365;
    const fertSavings = fertArea * FERT_SAVINGS_PER_M2;

    // Family coverage
    const coveragePercent = Math.min(100, (biogasDaily / FAMILY_NEED) * 100);

    // ===== UPDATE ALL UI =====

    // Main results
    animateValue(elVolume, volumeTotal, 1);
    animateValue(elBiogas, biogasDaily, 2);
    animateValue(elCooking, cookingHours, 1);
    animateValue(elSubstrate, substrate, 0);

    // Progress
    elProgressValue.textContent = Math.round(coveragePercent) + '%';
    elProgressBar.style.width = coveragePercent + '%';
    if (coveragePercent >= 100) {
      elProgressBar.style.background = 'linear-gradient(90deg, #22c55e, #10b981)';
    } else if (coveragePercent >= 50) {
      elProgressBar.style.background = 'linear-gradient(90deg, #22c55e, #f59e0b)';
    } else {
      elProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }

    // Detail table
    elDetailWaste.textContent = totalWaste.toFixed(1) + ' kg';
    elDetailWater.textContent = water.toFixed(1) + ' L';
    elDetailSubstrate.textContent = substrate.toFixed(1) + ' L';
    elDetailTrh.textContent = trh + ' jours';
    elDetailVolUseful.textContent = volumeUseful.toFixed(2) + ' m³';
    elDetailVolTotal.textContent = volumeTotal.toFixed(2) + ' m³';
    elDetailBiogas.textContent = biogasDaily.toFixed(2) + ' m³';
    elDetailCooking.textContent = '≈ ' + cookingHours.toFixed(1) + ' h';
    elDetailElec.textContent = '≈ ' + electricityKwh.toFixed(1) + ' kWh';

    // Flow diagram
    elFlowWaste.textContent = totalWaste.toFixed(0) + ' kg/jour';
    elFlowWater.textContent = water.toFixed(0) + ' L/jour';
    elFlowVolume.textContent = volumeTotal.toFixed(1) + ' m³';
    elFlowBiogas.textContent = biogasDaily.toFixed(1) + ' m³/j';
    elFlowDigestat.textContent = digestatDaily.toFixed(0) + ' L/j';

    // Applications
    animateValue(elAppCooking, cookingHours, 1);
    animateValue(elAppElectricity, electricityKwh, 1);
    animateValue(elAppLighting, lampHours, 0);
    animateValue(elAppHeating, heatingHours, 1);

    // Fertilizer
    animateValue(elFertDaily, digestatDaily, 0);
    animateValue(elFertYearly, digestatYearly, 1);
    animateValue(elFertArea, fertArea, 0);
    animateValue(elFertSavings, fertSavings, 0);

    // SVG integration diagram
    if (elSvgVolume) elSvgVolume.textContent = volumeTotal.toFixed(1) + ' m³';
    if (elSvgGarden) elSvgGarden.textContent = fertArea.toFixed(0) + ' m²';

    // Specs
    elSpecVolume.textContent = volumeTotal.toFixed(1) + ' m³';
    elSpecTrh.textContent = trh + ' jours';
    elSpecBiogas.textContent = biogasDaily.toFixed(1) + ' m³/jour';
    elSpecCooking.textContent = '≈ ' + cookingHours.toFixed(1) + ' h/jour';
    elSpecDigestat.textContent = digestatDaily.toFixed(0) + ' L/jour';
    elSpecGarden.textContent = fertArea.toFixed(0) + ' m²/an';

    // Recommendation
    updateRecommendation(volumeTotal);
  }

  // ===== RECOMMENDATION =====
  function updateRecommendation(volume) {
    let icon, title, desc, tag, install, lifetime;

    if (volume <= 0) {
      icon = '⚠️'; title = 'Aucun déchet renseigné';
      desc = 'Veuillez entrer vos sources de déchets organiques pour obtenir une recommandation.';
      tag = 'En attente'; install = '—'; lifetime = '—';
    } else if (volume <= 0.5) {
      icon = '🛢️'; title = 'Recommandé : Biodigesteur à fût / baril';
      desc = `Pour un petit volume de ${volume.toFixed(1)} m³, un fût métallique ou plastique de 200L modifié est la solution la plus économique. Facile à fabriquer à partir de matériaux locaux.`;
      tag = 'Budget : 50 – 150 €'; install = '2 – 3 heures'; lifetime = '3 – 5 ans';
    } else if (volume <= 1.5) {
      icon = '🏠'; title = 'Recommandé : Kit domestique prêt à l\'emploi';
      desc = `Pour ${volume.toFixed(1)} m³, un kit domestique complet en plastique est parfait. Système hors-sol, installation en 1 heure sans aucun outil spécial. Idéal pour débuter.`;
      tag = 'Budget : 500 – 1 200 €'; install = '1 heure'; lifetime = '10 – 15 ans';
    } else if (volume <= 5) {
      icon = '🏭'; title = 'Recommandé : Dôme préfabriqué en composite';
      desc = `Pour ${volume.toFixed(1)} m³, un dôme préfabriqué en fibre de verre ou composite est idéal. Installation rapide (½ journée) sans maçon, étanchéité garantie dès la pose.`;
      tag = 'Budget : 400 – 1 500 €'; install = '½ journée'; lifetime = '10 – 30 ans';
    } else if (volume <= 15) {
      icon = '🧱'; title = 'Recommandé : Dôme fixe ou préfabriqué grande capacité';
      desc = `Pour ${volume.toFixed(1)} m³, optez pour un dôme fixe en maçonnerie (très durable, 20+ ans) ou un système préfabriqué en composite grande capacité.`;
      tag = 'Budget : 1 000 – 3 000 €'; install = '2 – 5 jours'; lifetime = '20 – 30 ans';
    } else {
      icon = '🏗️'; title = 'Recommandé : Installation professionnelle';
      desc = `Pour ${volume.toFixed(1)} m³, il s'agit d'une installation semi-industrielle. Faites appel à un bureau d'études spécialisé en biogaz pour un dimensionnement précis.`;
      tag = 'Budget : 3 000+ € — Étude requise'; install = '1 – 4 semaines'; lifetime = '25+ ans';
    }

    elRecoIcon.textContent = icon;
    elRecoTitle.textContent = title;
    elRecoDesc.textContent = desc;
    elRecoTag.textContent = tag;

    // Update specs install and lifetime
    elSpecInstall.textContent = install;
    elSpecLifetime.textContent = lifetime;
  }

  // ===== ANIMATE VALUE =====
  function animateValue(element, target, decimals) {
    const current = parseFloat(element.textContent) || 0;
    const diff = target - current;
    if (Math.abs(diff) < 0.01) {
      element.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 400;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = current + diff * ease;
      element.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ===== INIT =====
  calculate();

})();
