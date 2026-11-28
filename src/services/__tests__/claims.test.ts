import { describe, it, expect, beforeEach } from "vitest";
import {
  dbCreateClaim,
  dbFetchPendingClaims,
  dbUpdateClaimStatus,
  DriverClaimItem,
} from "../../firebase";

if (typeof localStorage === "undefined") {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

describe("Driver Identity Claims Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates and stores a pending driver claim", async () => {
    const claim: DriverClaimItem = {
      id: "claim_user1_apexhunter",
      userId: "user_123",
      userEmail: "driver@example.com",
      driverId: "apexhunter",
      driverName: "ApexHunter",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await dbCreateClaim(claim);

    const pending = await dbFetchPendingClaims();
    expect(pending.length).toBe(1);
    expect(pending[0].driverId).toBe("apexhunter");
    expect(pending[0].status).toBe("pending");
  });

  it("updates claim status to approved and removes from pending queue", async () => {
    const claim: DriverClaimItem = {
      id: "claim_user2_turbotadpole",
      userId: "user_456",
      userEmail: "turbo@example.com",
      driverId: "turbotadpole",
      driverName: "TurboTadpole",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await dbCreateClaim(claim);
    expect((await dbFetchPendingClaims()).length).toBe(1);

    await dbUpdateClaimStatus(claim.id, claim.driverId, claim.userId, "approved");

    const pendingAfter = await dbFetchPendingClaims();
    expect(pendingAfter.length).toBe(0);

    // Verify status was persisted in claims storage
    const stored = JSON.parse(localStorage.getItem("acc_driver_claims_v1") || "[]");
    expect(stored.find((c: DriverClaimItem) => c.id === claim.id)?.status).toBe("approved");
  });

  it("updates claim status to rejected and removes from pending queue", async () => {
    const claim: DriverClaimItem = {
      id: "claim_user3_velocekev",
      userId: "user_789",
      userEmail: "kev@example.com",
      driverId: "velocekev",
      driverName: "VeloceKev",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await dbCreateClaim(claim);
    await dbUpdateClaimStatus(claim.id, claim.driverId, claim.userId, "rejected");

    const pendingAfter = await dbFetchPendingClaims();
    expect(pendingAfter.length).toBe(0);

    const stored = JSON.parse(localStorage.getItem("acc_driver_claims_v1") || "[]");
    expect(stored.find((c: DriverClaimItem) => c.id === claim.id)?.status).toBe("rejected");
  });

  it("handles duplicate claims for the same driver idempotently", async () => {
    const claimA: DriverClaimItem = {
      id: "claim_userA_shadowshift",
      userId: "user_A",
      userEmail: "a@example.com",
      driverId: "shadowshift",
      driverName: "ShadowShift",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await dbCreateClaim(claimA);
    // Overwrite with updated claim
    await dbCreateClaim({ ...claimA, userEmail: "a_new@example.com" });

    const pending = await dbFetchPendingClaims();
    expect(pending.length).toBe(1);
    expect(pending[0].userEmail).toBe("a_new@example.com");
  });
});
