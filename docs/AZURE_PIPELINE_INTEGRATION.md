# Azure Pipeline Integration Guide

## Overview

This guide explains how to integrate the Playwright test automation scripts with Azure DevOps pipelines, leveraging the explicit client-role-environment targeting for maximum reliability and data isolation.

---

## 🎯 **Key Benefits for Azure Pipelines**

### **✅ Data Safety**
- **No cross-client contamination** - Each script targets specific client data
- **Role-based isolation** - Tests run with appropriate user permissions
- **Environment separation** - Dev/Test/UAT data completely isolated

### **✅ Pipeline Reliability**  
- **Explicit targeting** - No accidental wrong environment execution
- **Consistent authentication** - Each script uses specific auth context
- **Predictable results** - No random failures due to wrong data/permissions

### **✅ Scalability**
- **Matrix strategies** - Easy parallel execution across clients/environments
- **Modular execution** - Run specific modules or test types
- **Resource optimization** - Target only what needs testing

---

## 🚀 **Basic Pipeline Configuration**

### **Single Client-Environment Pipeline**

```yaml
trigger:
  branches:
    include:
    - main
    - develop
    - feature/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: playwright-variables

jobs:
- job: Demo_Admin_UAT_Tests
  displayName: 'Demo Admin UAT Tests'
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps
    displayName: 'Install browsers'
    
  - script: npm run ci:demo:admin:uat
    displayName: 'Run Demo Admin UAT Tests'
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: 'Demo Admin UAT Tests'
      
  - task: PublishHtmlReport@1
    condition: always()
    inputs:
      reportDir: 'playwright-report'
      tabName: 'Playwright Report'
```

---

## 🎪 **Multi-Client Matrix Strategy**

### **Client-Environment Matrix**

```yaml
trigger:
  branches:
    include:
    - main

strategy:
  matrix:
    demo_admin_dev:
      client: 'demo'
      role: 'admin'
      environment: 'dev'
      script: 'ci:demo:admin:dev'
      displayName: 'Demo Admin Dev'
      
    demo_admin_uat:
      client: 'demo'
      role: 'admin'
      environment: 'uat'
      script: 'ci:demo:admin:uat'
      displayName: 'Demo Admin UAT'
      
    demo_dealer_uat:
      client: 'demo'
      role: 'dealer'
      environment: 'uat'
      script: 'ci:demo:dealer:uat'
      displayName: 'Demo Dealer UAT'
      
    hankook_admin_dev:
      client: 'hankook'
      role: 'admin'
      environment: 'dev'
      script: 'ci:hankook:admin:dev'
      displayName: 'Hankook Admin Dev'
      
    hankook_admin_uat:
      client: 'hankook'
      role: 'admin'
      environment: 'uat'
      script: 'ci:hankook:admin:uat'
      displayName: 'Hankook Admin UAT'

pool:
  vmImage: 'ubuntu-latest'

jobs:
- job: MultiClient_Tests
  displayName: '$(displayName)'
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps
    displayName: 'Install browsers'
    
  - script: npm run $(script)
    displayName: 'Run $(displayName) Tests'
    env:
      CLIENT: $(client)
      ROLE: $(role)
      ENV: $(environment)
      CI: true
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: '$(displayName) Tests'
      
  - task: PublishHtmlReport@1
    condition: always()
    inputs:
      reportDir: 'playwright-report'
      tabName: '$(displayName) Report'
```

---

## 🧪 **Test Type Based Pipelines**

### **Smoke Tests Pipeline**

```yaml
trigger:
  branches:
    include:
    - main
    - develop

strategy:
  matrix:
    demo_smoke_dev:
      script: 'ci:smoke:demo:admin:dev'
      displayName: 'Demo Smoke Dev'
      
    demo_smoke_uat:
      script: 'ci:smoke:demo:admin:uat'
      displayName: 'Demo Smoke UAT'

pool:
  vmImage: 'ubuntu-latest'

jobs:
- job: Smoke_Tests
  displayName: '$(displayName)'
  timeoutInMinutes: 30
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps chromium
    displayName: 'Install Chromium only (faster)'
    
  - script: npm run $(script)
    displayName: 'Run $(displayName)'
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: '$(displayName)'
```

### **Regression Tests Pipeline**

```yaml
trigger:
  branches:
    include:
    - release/*
    - main

jobs:
- job: Regression_Tests
  displayName: 'Demo Admin UAT Regression'
  timeoutInMinutes: 120
  pool:
    vmImage: 'ubuntu-latest'
    
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps
    displayName: 'Install all browsers'
    
  - script: npm run ci:regression:demo:admin:uat
    displayName: 'Run Regression Tests'
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: 'Regression Tests'
      
  - task: PublishBuildArtifacts@1
    condition: failure()
    inputs:
      pathToPublish: 'test-results'
      artifactName: 'test-failures'
```

---

## 🔧 **Module-Specific Pipelines**

### **Fund Management Module Pipeline**

```yaml
trigger:
  paths:
    include:
    - tests/e2e/fund-management/*
    - pages/modules/fund-management/*
    - fixtures/test-data/fund-management/*

strategy:
  matrix:
    fund_mgmt_dev:
      script: 'fund-mgmt:demo:admin:dev'
      environment: 'dev'
      
    fund_mgmt_uat:
      script: 'fund-mgmt:demo:admin:uat'
      environment: 'uat'

pool:
  vmImage: 'ubuntu-latest'

jobs:
- job: Fund_Management_Tests
  displayName: 'Fund Management $(environment)'
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps
    displayName: 'Install browsers'
    
  - script: npm run $(script)
    displayName: 'Run Fund Management Tests'
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: 'Fund Management $(environment)'
```

---

## 🏗️ **Multi-Stage Pipeline**

### **Complete CI/CD Pipeline with Stages**

```yaml
trigger:
  branches:
    include:
    - main
    - develop

variables:
  - group: playwright-variables

stages:
- stage: Smoke_Tests
  displayName: 'Smoke Tests'
  jobs:
  - job: Quick_Validation
    displayName: 'Quick Smoke Validation'
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
      
    - script: npm ci
      displayName: 'Install dependencies'
      
    - script: npx playwright install --with-deps chromium
      displayName: 'Install Chromium'
      
    - script: npm run ci:smoke:demo:admin:dev
      displayName: 'Run Dev Smoke Tests'
      
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'junit-results.xml'
        testRunTitle: 'Smoke Tests'

- stage: E2E_Tests
  displayName: 'E2E Tests'
  dependsOn: Smoke_Tests
  condition: succeeded()
  jobs:
  - job: Demo_E2E
    displayName: 'Demo Client E2E Tests'
    strategy:
      matrix:
        dev_environment:
          script: 'e2e:demo:admin:dev'
          environment: 'dev'
        uat_environment:
          script: 'e2e:demo:admin:uat'
          environment: 'uat'
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
      
    - script: npm ci
      displayName: 'Install dependencies'
      
    - script: npx playwright install --with-deps
      displayName: 'Install browsers'
      
    - script: npm run $(script)
      displayName: 'Run E2E Tests - $(environment)'
      
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'junit-results.xml'
        testRunTitle: 'E2E Tests - $(environment)'

- stage: Regression_Tests
  displayName: 'Regression Tests'
  dependsOn: E2E_Tests
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - job: Full_Regression
    displayName: 'Full Regression Suite'
    pool:
      vmImage: 'ubuntu-latest'
    timeoutInMinutes: 180
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
      
    - script: npm ci
      displayName: 'Install dependencies'
      
    - script: npx playwright install --with-deps
      displayName: 'Install browsers'
      
    - script: npm run ci:regression:demo:admin:uat
      displayName: 'Run Full Regression Tests'
      
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'junit-results.xml'
        testRunTitle: 'Regression Tests'
        
    - task: PublishBuildArtifacts@1
      condition: failure()
      inputs:
        pathToPublish: 'playwright-report'
        artifactName: 'regression-failure-report'
```

---

## 🎛️ **Pipeline Templates**

### **Reusable Template: `playwright-test-template.yml`**

```yaml
parameters:
  - name: client
    type: string
  - name: role
    type: string
    default: 'admin'
  - name: environment
    type: string
  - name: testType
    type: string
    default: 'full'
  - name: timeoutMinutes
    type: number
    default: 90

jobs:
- job: Test_${{ parameters.client }}_${{ parameters.role }}_${{ parameters.environment }}
  displayName: '${{ parameters.client }} ${{ parameters.role }} ${{ parameters.environment }} Tests'
  timeoutInMinutes: ${{ parameters.timeoutMinutes }}
  pool:
    vmImage: 'ubuntu-latest'
    
  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
    
  - script: npm ci
    displayName: 'Install dependencies'
    
  - script: npx playwright install --with-deps
    displayName: 'Install browsers'
    
  - script: |
      ${{ if eq(parameters.testType, 'smoke') }}:
        npm run ci:smoke:${{ parameters.client }}:${{ parameters.role }}:${{ parameters.environment }}
      ${{ elseif eq(parameters.testType, 'regression') }}:
        npm run ci:regression:${{ parameters.client }}:${{ parameters.role }}:${{ parameters.environment }}
      ${{ else }}:
        npm run ci:${{ parameters.client }}:${{ parameters.role }}:${{ parameters.environment }}
    displayName: 'Run ${{ parameters.testType }} tests'
    
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      testRunTitle: '${{ parameters.client }} ${{ parameters.role }} ${{ parameters.environment }} Tests'
      
  - task: PublishHtmlReport@1
    condition: always()
    inputs:
      reportDir: 'playwright-report'
      tabName: '${{ parameters.client }}-${{ parameters.role }}-${{ parameters.environment }}'
```

### **Using the Template**

```yaml
# Main pipeline using template
trigger:
  branches:
    include:
    - main

stages:
- stage: Multi_Client_Testing
  displayName: 'Multi-Client Testing'
  jobs:
  - template: templates/playwright-test-template.yml
    parameters:
      client: 'demo'
      role: 'admin'
      environment: 'dev'
      testType: 'smoke'
      timeoutMinutes: 30
      
  - template: templates/playwright-test-template.yml
    parameters:
      client: 'demo'
      role: 'admin'
      environment: 'uat'
      testType: 'full'
      timeoutMinutes: 120
      
  - template: templates/playwright-test-template.yml
    parameters:
      client: 'hankook'
      role: 'admin'
      environment: 'uat'
      testType: 'regression'
      timeoutMinutes: 180
```

---

## 📊 **Pipeline Variables and Secrets**

### **Variable Groups**

Create variable group `playwright-variables` in Azure DevOps:

```yaml
variables:
  - group: playwright-variables
  
# Variables should include:
# - DEMO_ADMIN_USERNAME
# - DEMO_ADMIN_PASSWORD
# - DEMO_DEALER_USERNAME
# - DEMO_DEALER_PASSWORD
# - HANKOOK_ADMIN_USERNAME
# - HANKOOK_ADMIN_PASSWORD
# - BASE_URL_DEV
# - BASE_URL_TEST
# - BASE_URL_UAT
```

### **Environment-Specific Variables**

```yaml
variables:
  ${{ if eq(variables['Build.SourceBranchName'], 'main') }}:
    targetEnvironment: 'uat'
  ${{ elseif eq(variables['Build.SourceBranchName'], 'develop') }}:
    targetEnvironment: 'dev'
  ${{ else }}:
    targetEnvironment: 'dev'
```

---

## 🎯 **Best Practices for Azure Pipelines**

### **✅ DO:**
- Use explicit client-role-environment scripts
- Implement matrix strategies for parallel execution
- Use templates for reusability
- Set appropriate timeouts for different test types
- Publish test results and artifacts
- Use variable groups for sensitive data

### **✅ Optimization Tips:**
- Install only required browsers for smoke tests
- Use `chromium` only for quick validations
- Implement proper stage dependencies
- Cache node_modules when possible
- Use parallel execution for independent tests

### **❌ DON'T:**
- Never use base scripts (`test`, `test:dev`) in pipelines
- Don't mix different client data in same job
- Avoid hardcoding credentials in pipeline YAML
- Don't run all browsers for every test type

---

## 🔍 **Monitoring and Reporting**

### **Test Results Integration**

```yaml
- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'junit-results.xml'
    testRunTitle: 'Playwright Tests'
    mergeTestResults: true
    failTaskOnFailedTests: true
```

### **HTML Report Publishing**

```yaml
- task: PublishHtmlReport@1
  condition: always()
  inputs:
    reportDir: 'playwright-report'
    tabName: 'Playwright Report'
```

### **Failure Artifacts**

```yaml
- task: PublishBuildArtifacts@1
  condition: failure()
  inputs:
    pathToPublish: 'test-results'
    artifactName: 'test-failure-artifacts'
```

---

This Azure integration guide ensures your Playwright tests run reliably with proper client-role-environment isolation in Azure DevOps pipelines.