'use strict';

/**
 * Feature Detector - analyses scanned source files to discover modules,
 * features, endpoints, forms, validation rules, roles, and business rules.
 *
 * Works pattern-based (deterministic). No LLM calls in Phase 2.
 *
 * Supports:
 *   - .NET Razor Pages / MVC / Web API
 *   - Node.js Express / Fastify
 *   - React / Angular / Vue components
 *
 * Returns an array of RawFeature objects. Confidence scoring is handled
 * by confidence-scorer.js separately.
 *
 * RawFeature {
 *   module, featureName, featureId,
 *   pageType, navigationPath,
 *   sourceFiles[],
 *   controllers[], views[], models[], services[],
 *   endpoints[], forms[], validationRules[],
 *   roles[], businessRules[], crudCapabilities[],
 *   searchSupported, exportSupported,
 *   signals  // raw signal counts for confidence scoring
 * }
 */

const path                               = require('path');
const { readFileSafe, filterFiles }      = require('./file-scanner');
const { generateFeatureId, toKebab }     = require('./id-generator');

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Run feature detection against scanned files.
 *
 * @param {string[]} allFiles     - All accepted file paths from file-scanner
 * @param {string}   repoPath     - Repo root (used to compute relative paths)
 * @param {object}   cfg          - Parsed analysis.config.json
 * @param {object}   logger       - Logger instance
 * @param {object}   [options]
 * @param {string}   [options.filterModule]   - Limit to one module (optional)
 * @param {string}   [options.filterFeature]  - Limit to one feature ID (optional)
 * @returns {Promise<RawFeature[]>}
 */
async function detectFeatures(allFiles, repoPath, cfg, logger, options = {}) {
  logger.section('Feature Detection');

  // 1. Detect project type(s)
  const projectType = _detectProjectType(allFiles, cfg);
  logger.info(`Detected project type: ${projectType}`);

  // 2. Group files into modules
  const moduleMap = _groupIntoModules(allFiles, repoPath, cfg);
  logger.info(`Modules found: ${Object.keys(moduleMap).join(', ') || '(none)'}`);

  // 3. Detect features per module
  const features = [];

  for (const [moduleName, moduleFiles] of Object.entries(moduleMap)) {
    if (options.filterModule && options.filterModule.toUpperCase() !== moduleName.toUpperCase()) {
      continue;
    }

    logger.info(`Analysing module: ${moduleName}  (${moduleFiles.length} files)`);

    const moduleFeatures = await _detectModuleFeatures(
      moduleName, moduleFiles, repoPath, cfg, projectType, logger
    );

    for (const f of moduleFeatures) {
      if (options.filterFeature && f.featureId !== options.filterFeature) {
        continue;
      }
      features.push(f);
    }
  }

  logger.info(`Features discovered: ${features.length}`);
  return features;
}

// ---------------------------------------------------------------------------
// Project type detection
// ---------------------------------------------------------------------------

function _detectProjectType(allFiles, cfg) {
  const scores = {};

  for (const [typeKey, typeCfg] of Object.entries(cfg.projectTypes)) {
    let score = 0;
    for (const indicator of typeCfg.indicators) {
      const rx = new RegExp(indicator, 'i');
      if (allFiles.some(f => rx.test(f))) {
        score += typeCfg.weight;
      }
    }
    scores[typeKey] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? sorted[0][0] : 'unknown';
}

// ---------------------------------------------------------------------------
// Module grouping
// ---------------------------------------------------------------------------

function _groupIntoModules(allFiles, repoPath, cfg) {
  const moduleCfg    = cfg.modules.detection;
  const rootFolders  = new Set(moduleCfg.rootFolders.map(f => f.toLowerCase()));
  const excludeSet   = new Set(moduleCfg.excludeFromModules.map(f => f.toLowerCase()));
  const moduleMap    = {};

  for (const filePath of allFiles) {
    const rel    = path.relative(repoPath, filePath).replace(/\\/g, '/');
    const parts  = rel.split('/');

    // Walk the path looking for a known root folder
    for (let i = 0; i < parts.length - 1; i++) {
      if (rootFolders.has(parts[i].toLowerCase())) {
        // The next segment (if it exists and is not excluded) is the module
        const candidate = parts[i + 1];
        if (!candidate) continue;
        if (excludeSet.has(candidate.toLowerCase())) continue;

        const moduleName = candidate;
        if (!moduleMap[moduleName]) moduleMap[moduleName] = [];
        moduleMap[moduleName].push(filePath);
        break;
      }
    }
  }

  // Fallback: if no modules found via root folders, treat top-level folders as modules
  if (Object.keys(moduleMap).length === 0) {
    for (const filePath of allFiles) {
      const rel   = path.relative(repoPath, filePath).replace(/\\/g, '/');
      const parts = rel.split('/');
      if (parts.length >= 2) {
        const top = parts[0];
        if (!excludeSet.has(top.toLowerCase())) {
          if (!moduleMap[top]) moduleMap[top] = [];
          moduleMap[top].push(filePath);
        }
      }
    }
  }

  return moduleMap;
}

// ---------------------------------------------------------------------------
// Feature detection per module
// ---------------------------------------------------------------------------

async function _detectModuleFeatures(moduleName, moduleFiles, repoPath, cfg, projectType, logger) {
  const features = [];
  const isDotnet = projectType.startsWith('dotnet');
  const isNode   = projectType.startsWith('node') || projectType === 'react' || projectType === 'angular';

  if (isDotnet) {
    const dotnetFeatures = await _detectDotnetFeatures(moduleName, moduleFiles, repoPath, cfg, logger);
    features.push(...dotnetFeatures);
  } else if (isNode) {
    const nodeFeatures = await _detectNodeFeatures(moduleName, moduleFiles, repoPath, cfg, logger);
    features.push(...nodeFeatures);
  } else {
    // Generic: group by subfolder
    const genericFeatures = await _detectGenericFeatures(moduleName, moduleFiles, repoPath, cfg, logger);
    features.push(...genericFeatures);
  }

  return features;
}

// ---------------------------------------------------------------------------
// .NET feature detection
// ---------------------------------------------------------------------------

async function _detectDotnetFeatures(moduleName, moduleFiles, repoPath, cfg, logger) {
  const dotnetCfg = cfg.featureDetection.dotnet;
  const features  = [];

  // Group files by subfolder (each subfolder = one candidate feature)
  const subfolderMap = _groupBySubfolder(moduleFiles, repoPath);

  for (const [subfolder, subFiles] of Object.entries(subfolderMap)) {
    const featureName  = subfolder || moduleName;
    const featureId    = generateFeatureId(moduleName, featureName);
    const featureKebab = toKebab(featureName);

    const controllers = filterFiles(subFiles, /Controller\.cs$/i);
    const views       = filterFiles(subFiles, /\.cshtml$/i);
    const codeBehind  = filterFiles(subFiles, /\.cshtml\.cs$/i);
    const models      = filterFiles(subFiles, /(Model|Dto|ViewModel|Request|Response)\.cs$/i);
    const services    = filterFiles(subFiles, /Service\.cs$/i);
    const validators  = filterFiles(subFiles, /Validator\.cs$/i);

    // Must have at least one meaningful source file to be a feature
    if (controllers.length + views.length + codeBehind.length === 0) {
      continue;
    }

    // Read content of primary files
    const allContent = await _readFilesContent([...controllers, ...views, ...codeBehind, ...services.slice(0, 2)]);

    const endpoints       = _extractDotnetEndpoints(allContent, dotnetCfg);
    const validationRules = _extractDotnetValidations(allContent, dotnetCfg);
    const roles           = _extractDotnetRoles(allContent, dotnetCfg);
    const forms           = _extractDotnetForms(allContent, dotnetCfg);
    const navPath         = _inferNavPath(allContent, moduleName, featureName);
    const crudCaps        = _inferCrud(endpoints, allContent);
    const businessRules   = _extractBusinessRules(allContent);

    const pageType = _detectPageType(allContent, cfg);

    const feature = {
      module:         moduleName,
      featureName:    featureName,
      featureId,
      featureKebab,
      pageType,
      navigationPath: navPath,
      sourceFiles:    subFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      controllers:    controllers.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      views:          views.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      models:         models.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      services:       services.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      endpoints,
      forms,
      validationRules,
      roles:          roles.length ? roles : ['authenticated'],
      businessRules,
      crudCapabilities: crudCaps,
      searchSupported:  _hasSearch(allContent),
      exportSupported:  _hasExport(allContent),
      warnings:         [],
      signals: {
        hasController:     controllers.length > 0,
        hasView:           views.length > 0,
        hasModel:          models.length > 0,
        hasService:        services.length > 0,
        hasEndpoints:      endpoints.length > 0,
        hasValidation:     validationRules.length > 0,
        hasRoles:          roles.length > 0,
        hasNavigationPath: !!navPath,
      },
    };

    features.push(feature);
  }

  return features;
}

// ---------------------------------------------------------------------------
// Node.js feature detection
// ---------------------------------------------------------------------------

async function _detectNodeFeatures(moduleName, moduleFiles, repoPath, cfg, logger) {
  const nodeCfg  = cfg.featureDetection.node;
  const features = [];

  // Group by subfolder
  const subfolderMap = _groupBySubfolder(moduleFiles, repoPath);

  for (const [subfolder, subFiles] of Object.entries(subfolderMap)) {
    const featureName  = subfolder || moduleName;
    const featureId    = generateFeatureId(moduleName, featureName);
    const featureKebab = toKebab(featureName);

    const routeFiles     = filterFiles(subFiles, /route|router|controller/i);
    const componentFiles = filterFiles(subFiles, /\.(tsx|jsx|component\.ts|component\.js)$/i);
    const serviceFiles   = filterFiles(subFiles, /service|api/i);

    if (routeFiles.length + componentFiles.length === 0) continue;

    const allContent = await _readFilesContent([...routeFiles, ...componentFiles.slice(0, 3)]);

    const endpoints   = _extractNodeEndpoints(allContent, nodeCfg);
    const roles       = _extractNodeRoles(allContent);
    const pageType    = _detectPageType(allContent, cfg);
    const crudCaps    = _inferCrud(endpoints, allContent);

    const feature = {
      module:         moduleName,
      featureName:    featureName,
      featureId,
      featureKebab,
      pageType,
      navigationPath: _inferNodeNavPath(endpoints, moduleName, featureName),
      sourceFiles:    subFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      controllers:    routeFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      views:          componentFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      models:         [],
      services:       serviceFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      endpoints,
      forms:          [],
      validationRules: _extractNodeValidations(allContent),
      roles:           roles.length ? roles : ['authenticated'],
      businessRules:   _extractBusinessRules(allContent),
      crudCapabilities: crudCaps,
      searchSupported:  _hasSearch(allContent),
      exportSupported:  _hasExport(allContent),
      warnings:         [],
      signals: {
        hasController:     routeFiles.length > 0,
        hasView:           componentFiles.length > 0,
        hasModel:          false,
        hasService:        serviceFiles.length > 0,
        hasEndpoints:      endpoints.length > 0,
        hasValidation:     false,
        hasRoles:          roles.length > 0,
        hasNavigationPath: true,
      },
    };

    features.push(feature);
  }

  return features;
}

// ---------------------------------------------------------------------------
// Generic fallback detection
// ---------------------------------------------------------------------------

async function _detectGenericFeatures(moduleName, moduleFiles, repoPath, cfg, logger) {
  const subfolderMap = _groupBySubfolder(moduleFiles, repoPath);
  const features     = [];

  for (const [subfolder, subFiles] of Object.entries(subfolderMap)) {
    if (subFiles.length === 0) continue;
    const featureName  = subfolder || moduleName;
    const featureId    = generateFeatureId(moduleName, featureName);
    const featureKebab = toKebab(featureName);

    features.push({
      module:           moduleName,
      featureName,
      featureId,
      featureKebab,
      pageType:         'Unknown',
      navigationPath:   '',
      sourceFiles:      subFiles.map(f => path.relative(repoPath, f).replace(/\\/g, '/')),
      controllers:      [],
      views:            [],
      models:           [],
      services:         [],
      endpoints:        [],
      forms:            [],
      validationRules:  [],
      roles:            ['authenticated'],
      businessRules:    [],
      crudCapabilities: [],
      searchSupported:  false,
      exportSupported:  false,
      warnings:         ['Generic detection used - consider adding project type patterns to analysis.config.json'],
      signals: {
        hasController: false, hasView: false, hasModel: false,
        hasService: false, hasEndpoints: false, hasValidation: false,
        hasRoles: false, hasNavigationPath: false,
      },
    });
  }

  return features;
}

// ---------------------------------------------------------------------------
// Grouping helpers
// ---------------------------------------------------------------------------

function _groupBySubfolder(files, repoPath) {
  const map = {};

  for (const f of files) {
    const rel   = path.relative(repoPath, f).replace(/\\/g, '/');
    const parts = rel.split('/');

    // Use the second-to-last meaningful directory as the feature name
    // e.g. Pages/Admin/Users/Index.cshtml -> subfolder = "Users"
    let subfolder = '';
    if (parts.length >= 3) {
      subfolder = parts[parts.length - 2];
    } else if (parts.length === 2) {
      subfolder = parts[0];
    }

    // Exclude generic subfolder names that are structural, not features
    const generic = new Set(['pages', 'views', 'controllers', 'components', 'shared', 'common', 'base']);
    if (generic.has(subfolder.toLowerCase())) {
      subfolder = parts.length >= 4 ? parts[parts.length - 3] : parts[0];
    }

    if (!map[subfolder]) map[subfolder] = [];
    map[subfolder].push(f);
  }

  return map;
}

// ---------------------------------------------------------------------------
// Extraction helpers - .NET
// ---------------------------------------------------------------------------

async function _readFilesContent(files) {
  const contents = await Promise.all(files.map(f => readFileSafe(f)));
  return contents.join('\n');
}

function _extractDotnetEndpoints(content, dotnetCfg) {
  const endpoints = [];
  const methodRx  = new RegExp(`\\[(${dotnetCfg.httpMethods.join('|')})(?:\\("([^"]*)"\\))?\\]`, 'g');
  let match;

  while ((match = methodRx.exec(content)) !== null) {
    const verb    = match[1].replace('Http', '').toUpperCase();
    const subPath = match[2] || '';
    endpoints.push({ method: verb, path: subPath || '(inferred)', description: '' });
  }

  // Also extract [Route] attributes
  const routeRx = /\[Route\("([^"]+)"\)\]/g;
  while ((match = routeRx.exec(content)) !== null) {
    // Only add if not already captured
    const routePath = match[1];
    if (!endpoints.some(e => e.path === routePath)) {
      endpoints.push({ method: '*', path: routePath, description: 'Route attribute' });
    }
  }

  return endpoints;
}

function _extractDotnetValidations(content, dotnetCfg) {
  const rules = [];
  for (const pattern of dotnetCfg.validationAttributes) {
    const rx = new RegExp(pattern, 'g');
    let match;
    while ((match = rx.exec(content)) !== null) {
      rules.push({ rule: match[0].trim(), param: match[1] || '' });
    }
  }
  // Deduplicate
  return [...new Map(rules.map(r => [r.rule, r])).values()];
}

function _extractDotnetRoles(content, dotnetCfg) {
  const roles = new Set();
  for (const pattern of dotnetCfg.roleAttributes) {
    const rx = new RegExp(pattern, 'g');
    let match;
    while ((match = rx.exec(content)) !== null) {
      if (match[1]) {
        match[1].split(',').forEach(r => roles.add(r.trim()));
      }
    }
  }
  return [...roles];
}

function _extractDotnetForms(content, dotnetCfg) {
  const forms = [];
  const aspActionRx = /asp-action="([^"]+)"/g;
  let match;
  while ((match = aspActionRx.exec(content)) !== null) {
    forms.push({ name: match[1], action: match[1] });
  }
  // Also look for <form> elements
  const formRx = /<form[^>]*>/g;
  const formCount = (content.match(formRx) || []).length;
  if (formCount > forms.length) {
    for (let i = forms.length; i < formCount; i++) {
      forms.push({ name: `Form${i + 1}`, action: '' });
    }
  }
  return forms;
}

function _inferNavPath(content, moduleName, featureName) {
  // Look for asp-page or asp-controller + asp-action combinations
  const pageRx  = /asp-page="([^"]+)"/;
  const ctrlRx  = /asp-controller="([^"]+)"/;
  const actRx   = /asp-action="([^"]+)"/;

  const pageMatch = pageRx.exec(content);
  if (pageMatch) return pageMatch[1];

  const ctrlMatch = ctrlRx.exec(content);
  const actMatch  = actRx.exec(content);
  if (ctrlMatch && actMatch) return `/${ctrlMatch[1]}/${actMatch[1]}`;
  if (ctrlMatch)             return `/${ctrlMatch[1]}`;

  return `/${moduleName}/${featureName}`;
}

// ---------------------------------------------------------------------------
// Extraction helpers - Node
// ---------------------------------------------------------------------------

function _extractNodeEndpoints(content, nodeCfg) {
  const endpoints = [];
  const rx = new RegExp(nodeCfg.routerPattern, 'g');
  let match;
  while ((match = rx.exec(content)) !== null) {
    endpoints.push({ method: match[1].toUpperCase(), path: match[2], description: '' });
  }
  return endpoints;
}

function _extractNodeValidations(content) {
  const signals = ['required', 'minLength', 'maxLength', 'pattern', 'email', 'min:', 'max:'];
  return signals
    .filter(s => content.toLowerCase().includes(s))
    .map(s => ({ rule: s, param: '' }));
}

function _extractNodeRoles(content) {
  const roles = new Set();
  const rx = /role[s]?\s*[:=]\s*['"]([^'"]+)['"]/gi;
  let match;
  while ((match = rx.exec(content)) !== null) {
    roles.add(match[1]);
  }
  return [...roles];
}

function _inferNodeNavPath(endpoints, moduleName, featureName) {
  const get = endpoints.find(e => e.method === 'GET');
  return get ? get.path : `/${moduleName}/${featureName}`;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function _detectPageType(content, cfg) {
  const lc = content.toLowerCase();
  let best = { type: 'Unknown', score: 0 };

  for (const [typeName, typeCfg] of Object.entries(cfg.pageTypes)) {
    const score = typeCfg.signals.filter(s => lc.includes(s.toLowerCase())).length;
    if (score > best.score) best = { type: typeName, score };
  }

  return best.type;
}

function _inferCrud(endpoints, content) {
  const caps = new Set();
  const lc   = content.toLowerCase();

  if (endpoints.some(e => e.method === 'GET') || lc.includes('select') || lc.includes('getall') || lc.includes('list')) {
    caps.add('Read');
  }
  if (endpoints.some(e => e.method === 'POST') || lc.includes('insert') || lc.includes('create') || lc.includes('add')) {
    caps.add('Create');
  }
  if (endpoints.some(e => ['PUT', 'PATCH'].includes(e.method)) || lc.includes('update') || lc.includes('edit') || lc.includes('modify')) {
    caps.add('Update');
  }
  if (endpoints.some(e => e.method === 'DELETE') || lc.includes('delete') || lc.includes('remove')) {
    caps.add('Delete');
  }

  return [...caps];
}

function _extractBusinessRules(content) {
  const rules = [];
  // Look for comments that look like business rules
  const commentRx = /\/\/\s*(TODO|RULE|NOTE|BUSINESS RULE|BR):?\s*(.+)/gi;
  let match;
  while ((match = commentRx.exec(content)) !== null) {
    const rule = match[2].trim();
    if (rule.length > 10) rules.push(rule);
  }
  return rules.slice(0, 20); // cap at 20 to avoid noise
}

function _hasSearch(content) {
  const lc = content.toLowerCase();
  return lc.includes('search') || lc.includes('filter') || lc.includes('query') || lc.includes('find');
}

function _hasExport(content) {
  const lc = content.toLowerCase();
  return lc.includes('export') || lc.includes('csv') || lc.includes('excel') || lc.includes('pdf') || lc.includes('download');
}

module.exports = { detectFeatures };
