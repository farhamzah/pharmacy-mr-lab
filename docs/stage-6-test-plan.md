# Stage 6 Test Plan

## Unit Tests

- RubricEvaluator scoring.
- Storage persistence and migration.
- CSV escaping and export builders.
- AssetRegistry and AssetLoader.
- Practical scenario metadata.

## Integration Logic Tests

- WeighingModuleStateMachine.
- MixingModuleStateMachine.
- Scenario-specific target and homogeneity.

## Desktop Smoke Tests

- Home UI.
- Desktop Module Demo.
- Scenario selection.
- Result panel.
- Export controls.
- Diagnostics panel.

## Meta Quest Manual QA

- Follow `docs/quest-qa-checklist.md`.
- Test placement 1/2/3 tables.
- Test resume/recalibrate/delete setup.
- Test all scenarios.

## Regression Areas

- WebXR start remains optional on desktop.
- Missing GLB fallback remains non-fatal.
- Result export remains backward compatible.
- Module switch cleanup does not crash.
