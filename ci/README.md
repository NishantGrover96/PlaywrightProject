# Pipeline Usage Documentation

## 🎯 **Single Pipeline Approach**

Instead of managing multiple YAML files, we now have **ONE** unified pipeline that handles all scenarios through parameters and auto-detection.

## 📁 **Simple Structure**

```
ci/
├── azure-pipelines.yml                # MAIN PIPELINE (handles everything)
└── templates/
    └── custom-test-template.yml       # Optional for advanced scenarios
```

## 🚀 **How It Works**

### **1. Auto-Detection (Default)**
The pipeline automatically detects what to run based on:

- **Branch Type**:
  - `main` → Regression tests
  - `develop` → Full tests  
  - `feature/*` → Smoke tests
  - `release/*` → Regression tests
  - `PR` → Smoke tests

- **Target Selection**:
  - `Feature/PR` → Demo client, Dev environment
  - `Main/Release` → All clients, UAT environment
  - `Develop` → Demo + Hankook, Dev + UAT

### **2. Manual Control (Parameters)**
Override auto-detection with parameters:

```yaml
# When running manually, you can specify:
- executionMode: 'smoke', 'full', 'regression', 'module'
- targetClients: 'demo', 'hankook', 'all', 'demo,hankook'
- targetEnvironments: 'dev', 'test', 'uat', 'all', 'dev,uat'
- targetRoles: 'admin', 'dealer', 'all', 'admin,dealer'
- targetModules: 'fund-mgmt', 'lms', 'all', 'fund-mgmt,lms'
- targetBrowsers: 'chromium', 'all', 'chromium,firefox'
```

## 📋 **Usage Examples**

### **Automatic Usage (Most Common)**
```yaml
# Just trigger the pipeline - it auto-detects everything
trigger: push to any branch
# Pipeline automatically:
# - Detects execution mode based on branch
# - Selects appropriate clients and environments  
# - Runs the right tests with proper scripts
```

### **Manual Usage (Advanced)**
```yaml
# Queue manually with parameters:
executionMode: 'module'
targetClients: 'demo'
targetEnvironments: 'uat'
targetRoles: 'admin'
targetModules: 'fund-mgmt,lms'
targetBrowsers: 'chromium'
```

## 🎯 **Execution Modes**

| Mode | Description | When Auto-Selected |
|------|-------------|---------------------|
| **smoke** | Quick validation tests | Feature branches, PRs |
| **full** | Complete test suite | Develop branch |
| **regression** | Comprehensive testing | Main branch, Release branches |
| **module** | Specific module testing | Manual only |
| **custom** | Advanced scenarios | Manual only |

## 🔧 **Auto-Detection Logic**

```powershell
# The pipeline automatically determines:

if (PR) {
    mode = "smoke"
    clients = "demo" 
    environments = "dev"
}
elseif (main branch) {
    mode = "regression"
    clients = "all"
    environments = "uat"
}
elseif (develop branch) {
    mode = "full"
    clients = "demo,hankook"
    environments = "dev,uat"
}
elseif (feature branch) {
    mode = "smoke"
    clients = "demo"
    environments = "dev"
}
```

## 🎪 **Dynamic Script Execution**

The pipeline intelligently maps to your existing scripts:

```bash
# For smoke mode:
ci:smoke:demo:admin:dev           # If exists
quick-test                        # Fallback

# For full mode:
ci:demo:admin:dev                 # If exists  
test:demo:admin:dev              # Fallback

# For regression mode:
ci:regression:demo:admin:uat      # If exists
regression:demo:admin:uat         # Fallback
test:demo:admin:uat              # Final fallback

# For module mode:
fund-mgmt:demo:admin:dev         # Direct module script
lms:demo:admin:dev               # Direct module script
```

## ✅ **Benefits of Single Pipeline**

### **🎯 Simplicity**
- **1 file to maintain** instead of 10+
- **No more file proliferation** as modules grow
- **Single source of truth** for all execution logic

### **🔧 Flexibility**  
- **Auto-detects** appropriate tests for each branch
- **Manual override** for any scenario
- **Scales automatically** with new clients/modules

### **🚀 Performance**
- **Smart execution** - only runs what's needed
- **Parallel execution** across client-role-environment combinations
- **Caching** and optimizations built-in

### **🛡️ Maintenance**
- **Add new modules** → Just add scripts to package.json (no new YAML files)
- **Add new clients** → Just add to parameters list
- **Add new environments** → Just add to parameters list

## 🆕 **Adding New Modules (Future)**

When you add a new module (e.g., "inventory"):

1. **Add scripts to package.json**:
   ```json
   "inventory:demo:admin:dev": "cross-env CLIENT=demo ROLE=admin ENV=dev npx playwright test tests/e2e/inventory --config=configs/environments/playwright.config.dev.ts"
   ```

2. **That's it!** The pipeline automatically:
   - Detects the new module in parameters
   - Executes it when selected
   - No YAML file changes needed

## 🎛️ **Pipeline Parameters UI**

When running manually in Azure DevOps, you'll see:

```
Execution Mode: [dropdown] smoke | full | regression | module | custom
Target Clients: [text] auto (or demo, hankook, all, demo,hankook)
Target Environments: [text] auto (or dev, test, uat, all, dev,uat)
Target Roles: [text] admin (or dealer, all, admin,dealer)
Target Modules: [text] all (or fund-mgmt, lms, fund-mgmt,lms)
Target Browsers: [dropdown] chromium | all | chromium,firefox
Parallel Workers: [number] 2
Timeout Minutes: [number] 90
```

## 🏆 **Result**

- **✅ Zero file management overhead**
- **✅ Scales infinitely with new modules**
- **✅ Smart auto-detection for CI/CD**
- **✅ Full manual control when needed**
- **✅ Uses your existing explicit scripts**
- **✅ One pipeline to rule them all**