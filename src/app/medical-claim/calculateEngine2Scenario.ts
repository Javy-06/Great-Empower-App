import {
  calculateEngine2Claim,
  type Engine2Failure,
  type Engine2PublicRequest,
  type Engine2Success,
} from "../../calculation-engine/engine-2.ts";
import {
  buildEngine2Request,
  mapEngine2FailureErrors,
  type Engine2RequestIssue,
  type Engine2RequestMetadata,
  type MedicalClaimSimulatorDraft,
} from "./buildEngine2Request.ts";

export type Engine2ScenarioCalculation =
  | { kind: "invalid"; issues: Engine2RequestIssue[] }
  | { kind: "failure"; issues: Engine2RequestIssue[] }
  | { kind: "success"; result: Engine2Success; request: Engine2PublicRequest };

export function presentEngine2Failure(
  failure: Engine2Failure,
  draft: MedicalClaimSimulatorDraft,
): Extract<Engine2ScenarioCalculation, { kind: "failure" }> {
  return {
    kind: "failure",
    issues: mapEngine2FailureErrors(failure.validation_errors, draft),
  };
}

export function calculateEngine2Scenario(
  draft: MedicalClaimSimulatorDraft,
  metadata: Engine2RequestMetadata,
): Engine2ScenarioCalculation {
  const built = buildEngine2Request(draft, metadata);
  if (built.kind === "invalid") return built;

  const result = calculateEngine2Claim(built.request);
  if (result.kind === "failure") return presentEngine2Failure(result, draft);
  return { kind: "success", result, request: built.request };
}
