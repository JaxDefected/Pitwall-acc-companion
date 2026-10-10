# Workshop ACC import report

Source: Workshop ACC export, data version 2026-10-08. Original author unverified.

Generated from `workshop_acc_data.json` by `scripts/import-workshop-acc.ts`. Source tag: `workshop-acc`.

## Row counts

- Imported setups: **8325** (expected 8325) – unique car/track/slot keys: 8325 – ✅ OK
- Cars: 54, tracks: 25

| Slot | Rows | Expected | Cars with slot | Tracks per car |
|---|---|---|---|---|
| Q-ATTACK | 1350 | 1350 ✅ | 54 | all 25 |
| Q-STEADY | 1350 | 1350 ✅ | 54 | all 25 |
| R-ATTACK | 1350 | 1350 ✅ | 54 | all 25 |
| R-STEADY | 1350 | 1350 ✅ | 54 | all 25 |
| WET | 1350 | 1350 ✅ | 54 | all 25 |
| HYBRID | 925 | 925 ✅ | 37 | all 25 |
| LFM | 650 | 650 ✅ | 42 | partial (see below) |

Partial track coverage (data property, not an import loss):
- porsche_935 LFM: 1/25 tracks
- porsche_991_gt2_rs_mr LFM: 1/25 tracks
- audi_r8_lms LFM: 21/25 tracks
- audi_r8_lms_evo LFM: 21/25 tracks
- audi_r8_lms_evo_ii LFM: 21/25 tracks
- bentley_continental_gt3_2016 LFM: 22/25 tracks
- bentley_continental_gt3_2018 LFM: 22/25 tracks
- ferrari_488_gt3 LFM: 1/25 tracks
- ferrari_488_gt3_evo LFM: 1/25 tracks
- honda_nsx_gt3 LFM: 4/25 tracks
- honda_nsx_gt3_evo LFM: 4/25 tracks
- lamborghini_gallardo_rex LFM: 24/25 tracks
- lamborghini_huracan_gt3 LFM: 24/25 tracks
- lamborghini_huracan_gt3_evo LFM: 24/25 tracks
- lamborghini_huracan_gt3_evo2 LFM: 24/25 tracks
- lexus_rc_f_gt3 LFM: 4/25 tracks
- mercedes_amg_gt3 LFM: 23/25 tracks
- mercedes_amg_gt3_evo LFM: 23/25 tracks
- nissan_gt_r_gt3_2017 LFM: 9/25 tracks
- nissan_gt_r_gt3_2018 LFM: 9/25 tracks
- alpine_a110_gt4 LFM: 1/25 tracks
- amr_v8_vantage_gt4 LFM: 7/25 tracks
- audi_r8_lms_gt4 LFM: 6/25 tracks
- bmw_m4_gt4 LFM: 2/25 tracks
- chevrolet_camaro_gt4r LFM: 6/25 tracks
- ginetta_g55_gt4 LFM: 2/25 tracks
- mclaren_570s_gt4 LFM: 8/25 tracks
- mercedes_amg_gt4 LFM: 8/25 tracks
- porsche_718_cayman_gt4_mr LFM: 2/25 tracks

## Car matching

- Matched to existing app ids: 53/54
- Aliased: `audi_r8_gt4` → existing `audi_r8_lms_gt4` (Audi R8 LMS GT4 2016)
- **Unmatched**: `lamborghini_huracan_st` (Lamborghini Huracán ST 2015) – imported under its source id; not added to the app car list
- App cars with no imported setups: `aston_martin_v12_vantage_gt3`, `porsche_718_cayman_gt4_cs`, `aston_martin_vantage_gt4` (aliases of imported ids where noted in cars.ts)

## Track matching

- Matched: 25/25
- App tracks with no imported setups: `jeddah`

## Decoding edge cases

- Wheel rate lists that hold indexes only (flagged `index-only`): `porsche_935`, `porsche_991_gt2_rs_mr`, `porsche_991ii_gt3_cup`, `porsche_992_gt3_cup`
- Single-entry physical wheel rate lists (flagged `single-option`): `mercedes_amg_gt4`
- Ride height: only array slots 0 (front) and 2 (rear) are shown; slots 1 and 3 are stored but flagged `unused`.
- Undecoded values (100):
  - ferrari_488_challenge_evo: basicSetup.alignment.casterLF – Click 98 is outside the caster list (98 entries) (100 setups)

## Slider range mismatches (app `src/data/cars.ts` vs imported a/b tables)

Report only – `cars.ts` was not modified. "Min" = value at click 0 (a). Max cannot be derived from a/b; "observed max" is the highest value used by any imported setup (a lower bound for the true max).

Total: **264** across 53 cars.

### By parameter

| Parameter | Cars |
|---|---|
| antirollBarFrontRange – Min differs | 51 |
| antirollBarRearRange – Min differs | 51 |
| antirollBarFrontRange – Imported setups exceed app max | 33 |
| antirollBarRearRange – Imported setups exceed app max | 29 |
| rearWingRange – Imported setups exceed app max | 14 |
| wheelRatesRear – List differs | 14 |
| wheelRatesFront – List differs | 11 |
| rideHeightFrontRange – Min differs | 8 |
| rearWingRange – Min differs | 6 |
| rideHeightRearRange – Min differs | 5 |
| rideHeightRearRange – Imported setups exceed app max | 4 |
| bumpStopWindowFrontRange – Imported setups exceed app max | 4 |
| camberRearRange – Min differs | 4 |
| bumpStopWindowRearRange – Imported setups exceed app max | 3 |
| splitterRange – Imported setups exceed app max | 3 |
| preloadRange – Min differs | 3 |
| bumpStopRateStep (front) – Step differs | 2 |
| bumpStopRateStep (rear) – Step differs | 2 |
| preloadRange – Imported setups exceed app max | 2 |
| camberFrontRange – Min differs | 2 |
| bumpStopRate (rear) – Imported setups exceed app max | 2 |
| preloadStep – Step differs | 2 |
| reboundFastRange (front) – Imported setups exceed app max | 1 |
| reboundFastRange (rear) – Imported setups exceed app max | 1 |
| bumpStopRate (front) – Min differs | 1 |
| bumpStopRate (rear) – Min differs | 1 |
| toeStep – Step differs | 1 |
| brakeBiasStep – Step differs | 1 |
| bumpStopRate (front) – Imported setups exceed app max | 1 |
| steerRatioRange – Imported setups exceed app max | 1 |
| bumpStopWindowStep – Step differs | 1 |

### Detail

| Car | Parameter | App | Imported | Issue |
|---|---|---|---|---|
| bmw_m2_cs_racing | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 2 | Min differs |
| bmw_m2_cs_racing | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 2 | Min differs |
| audi_r8_lms_gt2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 1 | Min differs |
| audi_r8_lms_gt2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 0 | Min differs |
| audi_r8_lms_gt2 | rearWingRange | [0, 4] | min 0, step 1, observed max 5 | Imported setups exceed app max |
| ktm_xbow_gt2 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| ktm_xbow_gt2 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 0 | Min differs |
| ktm_xbow_gt2 | rearWingRange | [1, 9] | min 1, step 1, observed max 10 | Imported setups exceed app max |
| maserati_mc20_gt2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 3 | Min differs |
| maserati_mc20_gt2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 0 | Min differs |
| maserati_mc20_gt2 | reboundFastRange (front) | [0, 11] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| maserati_mc20_gt2 | reboundFastRange (rear) | [0, 11] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| mercedes_amg_gt2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 2 | Min differs |
| mercedes_amg_gt2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 2 | Min differs |
| mercedes_amg_gt2 | rearWingRange | [1, 8] | min 1, step 1, observed max 9 | Imported setups exceed app max |
| porsche_935 | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 6 | Min differs |
| porsche_935 | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_935 | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 6 | Min differs |
| porsche_935 | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_991_gt2_rs_mr | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 6 | Min differs |
| porsche_991_gt2_rs_mr | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_991_gt2_rs_mr | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 6 | Min differs |
| porsche_991_gt2_rs_mr | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| amr_v12_vantage_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| amr_v12_vantage_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| amr_v12_vantage_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| amr_v12_vantage_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| amr_v8_vantage_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| amr_v8_vantage_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| amr_v8_vantage_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| amr_v8_vantage_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| amr_v8_vantage_gt3 | rideHeightFrontRange | [53, 80] | min 55, step 1, observed max 63 | Min differs |
| amr_v8_vantage_gt3 | rideHeightRearRange | [53, 90] | min 55, step 1, observed max 92 | Min differs |
| amr_v8_vantage_gt3 | rideHeightRearRange | [53, 90] | min 55, step 1, observed max 92 | Imported setups exceed app max |
| audi_r8_lms | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 4 | Min differs |
| audi_r8_lms | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 2 | Min differs |
| audi_r8_lms_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 4 | Min differs |
| audi_r8_lms_evo | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 2 | Min differs |
| audi_r8_lms_evo_ii | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 4 | Min differs |
| audi_r8_lms_evo_ii | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 2 | Min differs |
| bentley_continental_gt3_2016 | wheelRatesRear | 20 entries 95000…195000 | 21 entries 95000…195000 | List differs |
| bentley_continental_gt3_2016 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| bentley_continental_gt3_2016 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| bentley_continental_gt3_2016 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| bentley_continental_gt3_2016 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| bentley_continental_gt3_2018 | wheelRatesFront | 14 entries 115000…185000 | 15 entries 115000…185000 | List differs |
| bentley_continental_gt3_2018 | wheelRatesRear | 20 entries 95000…195000 | 21 entries 95000…195000 | List differs |
| bentley_continental_gt3_2018 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| bentley_continental_gt3_2018 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| bentley_continental_gt3_2018 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| bentley_continental_gt3_2018 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| bmw_m4_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| bmw_m4_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| bmw_m4_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| bmw_m4_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| bmw_m6_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| bmw_m6_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| bmw_m6_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| bmw_m6_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| bmw_m6_gt3 | bumpStopWindowFrontRange | [0, 28] | min 0, step 1, observed max 32 | Imported setups exceed app max |
| bmw_m6_gt3 | bumpStopWindowRearRange | [0, 56] | min 0, step 1, observed max 60 | Imported setups exceed app max |
| bmw_m6_gt3 | rearWingRange | [0, 7] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| ferrari_296_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| ferrari_296_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| ferrari_296_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| ferrari_296_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| ferrari_488_gt3 | antirollBarFrontRange | [1, 10] | min 0, step 1, observed max 45 | Min differs |
| ferrari_488_gt3 | antirollBarFrontRange | [1, 10] | min 0, step 1, observed max 45 | Imported setups exceed app max |
| ferrari_488_gt3 | antirollBarRearRange | [1, 10] | min 0, step 1, observed max 20 | Min differs |
| ferrari_488_gt3 | antirollBarRearRange | [1, 10] | min 0, step 1, observed max 20 | Imported setups exceed app max |
| ferrari_488_gt3_evo | antirollBarFrontRange | [1, 10] | min 0, step 1, observed max 45 | Min differs |
| ferrari_488_gt3_evo | antirollBarFrontRange | [1, 10] | min 0, step 1, observed max 45 | Imported setups exceed app max |
| ferrari_488_gt3_evo | antirollBarRearRange | [1, 10] | min 0, step 1, observed max 20 | Min differs |
| ferrari_488_gt3_evo | antirollBarRearRange | [1, 10] | min 0, step 1, observed max 20 | Imported setups exceed app max |
| ford_mustang_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| ford_mustang_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| ford_mustang_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| ford_mustang_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| honda_nsx_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Min differs |
| honda_nsx_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| honda_nsx_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| honda_nsx_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| honda_nsx_gt3 | bumpStopRate (front) | [200, 600] | min 300, step 100, observed max 600 | Min differs |
| honda_nsx_gt3 | bumpStopRate (rear) | [200, 600] | min 300, step 100, observed max 600 | Min differs |
| honda_nsx_gt3 | bumpStopRateStep (front) | 50 | 100 | Step differs |
| honda_nsx_gt3 | bumpStopRateStep (rear) | 50 | 100 | Step differs |
| honda_nsx_gt3 | rearWingRange | [1, 12] | min 0, step 1, observed max 12 | Min differs |
| honda_nsx_gt3_evo | antirollBarFrontRange | [1, 5] | min 1, step 1, observed max 8 | Imported setups exceed app max |
| honda_nsx_gt3_evo | antirollBarRearRange | [1, 5] | min 1, step 1, observed max 6 | Imported setups exceed app max |
| jaguar_g3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| jaguar_g3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| jaguar_g3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Min differs |
| jaguar_g3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 9 | Imported setups exceed app max |
| lamborghini_gallardo_rex | wheelRatesRear | 13 entries 117000…187000 | 15 entries 117000…187000 | List differs |
| lamborghini_gallardo_rex | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_gallardo_rex | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_gallardo_rex | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_gallardo_rex | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_gallardo_rex | rearWingRange | [0, 10] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| lamborghini_huracan_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_huracan_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_huracan_gt3 | rearWingRange | [0, 10] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| lamborghini_huracan_gt3_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_huracan_gt3_evo | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3_evo | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_huracan_gt3_evo2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3_evo2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lamborghini_huracan_gt3_evo2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| lamborghini_huracan_gt3_evo2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| lexus_rc_f_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Min differs |
| lexus_rc_f_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Imported setups exceed app max |
| lexus_rc_f_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 7 | Min differs |
| lexus_rc_f_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 7 | Imported setups exceed app max |
| mclaren_650s_gt3 | toeStep | 0.01 | 0.1 | Step differs |
| mclaren_650s_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Min differs |
| mclaren_650s_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Imported setups exceed app max |
| mclaren_650s_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| mclaren_650s_gt3 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| mclaren_650s_gt3 | bumpStopWindowFrontRange | [0, 30] | min 0, step 1, observed max 40 | Imported setups exceed app max |
| mclaren_650s_gt3 | splitterRange | [0, 0] | min 0, step 1, observed max 3 | Imported setups exceed app max |
| mclaren_650s_gt3 | rearWingRange | [0, 10] | min 1, step 1, observed max 12 | Min differs |
| mclaren_650s_gt3 | rearWingRange | [0, 10] | min 1, step 1, observed max 12 | Imported setups exceed app max |
| mclaren_720s_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Min differs |
| mclaren_720s_gt3 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Imported setups exceed app max |
| mclaren_720s_gt3 | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 10 | Min differs |
| mclaren_720s_gt3 | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| mclaren_720s_gt3 | splitterRange | [0, 0] | min 0, step 1, observed max 3 | Imported setups exceed app max |
| mclaren_720s_gt3 | rearWingRange | [1, 8] | min 1, step 1, observed max 12 | Imported setups exceed app max |
| mclaren_720s_gt3_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Min differs |
| mclaren_720s_gt3_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 11 | Imported setups exceed app max |
| mclaren_720s_gt3_evo | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 10 | Min differs |
| mclaren_720s_gt3_evo | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| mclaren_720s_gt3_evo | splitterRange | [0, 0] | min 0, step 1, observed max 3 | Imported setups exceed app max |
| mercedes_amg_gt3 | wheelRatesRear | 11 entries 71000…212000 | 6 entries 71000…131000 | List differs |
| mercedes_amg_gt3 | antirollBarFrontRange | [1, 9] | min 0, step 1, observed max 10 | Min differs |
| mercedes_amg_gt3 | antirollBarFrontRange | [1, 9] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| mercedes_amg_gt3 | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 13 | Min differs |
| mercedes_amg_gt3 | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 13 | Imported setups exceed app max |
| mercedes_amg_gt3 | bumpStopWindowFrontRange | [0, 31] | min 0, step 1, observed max 46 | Imported setups exceed app max |
| mercedes_amg_gt3 | bumpStopWindowRearRange | [0, 72] | min 0, step 1, observed max 76 | Imported setups exceed app max |
| mercedes_amg_gt3_evo | wheelRatesRear | 11 entries 71000…212000 | 6 entries 71000…131000 | List differs |
| mercedes_amg_gt3_evo | antirollBarFrontRange | [1, 9] | min 0, step 1, observed max 10 | Min differs |
| mercedes_amg_gt3_evo | antirollBarFrontRange | [1, 9] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| mercedes_amg_gt3_evo | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 13 | Min differs |
| mercedes_amg_gt3_evo | antirollBarRearRange | [1, 7] | min 0, step 1, observed max 13 | Imported setups exceed app max |
| mercedes_amg_gt3_evo | bumpStopWindowFrontRange | [0, 31] | min 0, step 1, observed max 46 | Imported setups exceed app max |
| mercedes_amg_gt3_evo | bumpStopWindowRearRange | [0, 72] | min 0, step 1, observed max 76 | Imported setups exceed app max |
| mercedes_amg_gt3_evo | rideHeightFrontRange | [50, 88] | min 42, step 1, observed max 47 | Min differs |
| nissan_gt_r_gt3_2017 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| nissan_gt_r_gt3_2017 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| nissan_gt_r_gt3_2017 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| nissan_gt_r_gt3_2017 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| nissan_gt_r_gt3_2017 | preloadRange | [20, 160] | min 20, step 10, observed max 300 | Imported setups exceed app max |
| nissan_gt_r_gt3_2018 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| nissan_gt_r_gt3_2018 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| nissan_gt_r_gt3_2018 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Min differs |
| nissan_gt_r_gt3_2018 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 10 | Imported setups exceed app max |
| nissan_gt_r_gt3_2018 | preloadRange | [20, 160] | min 20, step 10, observed max 290 | Imported setups exceed app max |
| porsche_991_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| porsche_991_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_991_gt3_r | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 5 | Min differs |
| porsche_991ii_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| porsche_991ii_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_991ii_gt3_r | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 5 | Min differs |
| porsche_992_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Min differs |
| porsche_992_gt3_r | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 6 | Imported setups exceed app max |
| porsche_992_gt3_r | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 5 | Min differs |
| alpine_a110_gt4 | wheelRatesFront | 2 entries 62500…92500 | 4 entries 62500…92500 | List differs |
| alpine_a110_gt4 | wheelRatesRear | 2 entries 73000…103300 | 4 entries 73300…103300 | List differs |
| alpine_a110_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 3 | Min differs |
| alpine_a110_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| amr_v8_vantage_gt4 | wheelRatesFront | 2 entries 80000…110000 | 4 entries 80000…110000 | List differs |
| amr_v8_vantage_gt4 | wheelRatesRear | 2 entries 70000…80000 | 3 entries 70000…80000 | List differs |
| amr_v8_vantage_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 3 | Min differs |
| amr_v8_vantage_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 3 | Min differs |
| amr_v8_vantage_gt4 | rideHeightFrontRange | [98, 120] | min 93, step 1, observed max 97 | Min differs |
| amr_v8_vantage_gt4 | rideHeightRearRange | [102, 130] | min 97, step 1, observed max 127 | Min differs |
| amr_v8_vantage_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Min differs |
| amr_v8_vantage_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Imported setups exceed app max |
| audi_r8_lms_gt4 | camberRearRange | [-4.5, 0] | min -3.5, step 0.1, observed max -3.2 | Min differs |
| audi_r8_lms_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| audi_r8_lms_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 0 | Min differs |
| audi_r8_lms_gt4 | rideHeightRearRange | [112, 125] | min 112, step 1, observed max 130 | Imported setups exceed app max |
| bmw_m4_gt4 | wheelRatesFront | 2 entries 165888…202752 | 3 entries 165888…202752 | List differs |
| bmw_m4_gt4 | wheelRatesRear | 2 entries 103335…130891 | 3 entries 103335…130891 | List differs |
| bmw_m4_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| bmw_m4_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| bmw_m4_gt4 | brakeBiasStep | 0.3 | 0.2 | Step differs |
| bmw_m4_gt4 | rideHeightFrontRange | [80, 100] | min 70, step 1, observed max 82 | Min differs |
| bmw_m4_gt4 | rideHeightRearRange | [75, 100] | min 65, step 1, observed max 90 | Min differs |
| bmw_m4_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Min differs |
| bmw_m4_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Imported setups exceed app max |
| chevrolet_camaro_gt4r | wheelRatesFront | 2 entries 165888…202752 | 3 entries 165888…202752 | List differs |
| chevrolet_camaro_gt4r | wheelRatesRear | 2 entries 90000…114000 | 3 entries 90000…114000 | List differs |
| chevrolet_camaro_gt4r | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| chevrolet_camaro_gt4r | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| chevrolet_camaro_gt4r | preloadRange | [10, 80] | min 20, step 10, observed max 80 | Min differs |
| chevrolet_camaro_gt4r | rideHeightFrontRange | [120, 130] | min 115, step 1, observed max 120 | Min differs |
| chevrolet_camaro_gt4r | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Min differs |
| chevrolet_camaro_gt4r | rearWingRange | [0, 4] | min 1, step 1, observed max 5 | Imported setups exceed app max |
| ginetta_g55_gt4 | wheelRatesFront | 2 entries 80000…120000 | 5 entries 80000…120000 | List differs |
| ginetta_g55_gt4 | wheelRatesRear | 2 entries 60000…100000 | 5 entries 60000…100000 | List differs |
| ginetta_g55_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| ginetta_g55_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| ginetta_g55_gt4 | bumpStopRate (front) | [300, 1000] | min 300, step 100, observed max 1400 | Imported setups exceed app max |
| ginetta_g55_gt4 | preloadRange | [10, 80] | min 20, step 10, observed max 40 | Min differs |
| ginetta_g55_gt4 | rideHeightFrontRange | [80, 110] | min 75, step 1, observed max 105 | Min differs |
| ginetta_g55_gt4 | rearWingRange | [0, 4] | min 0, step 1, observed max 5 | Imported setups exceed app max |
| ktm_xbow_gt4 | camberFrontRange | [-2.2, -0.5] | min -2.5, step 0.1, observed max -2.5 | Min differs |
| ktm_xbow_gt4 | camberRearRange | [-2.2, -0.5] | min -2.5, step 0.1, observed max -2.5 | Min differs |
| ktm_xbow_gt4 | wheelRatesFront | 2 entries 87000…127000 | 5 entries 87000…127000 | List differs |
| ktm_xbow_gt4 | wheelRatesRear | 2 entries 81000…131000 | 6 entries 81000…131000 | List differs |
| ktm_xbow_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 3 | Min differs |
| ktm_xbow_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| ktm_xbow_gt4 | bumpStopRate (rear) | [300, 1000] | min 300, step 100, observed max 1100 | Imported setups exceed app max |
| ktm_xbow_gt4 | steerRatioRange | [11, 17] | min 11, step 1, observed max 18 | Imported setups exceed app max |
| ktm_xbow_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 9 | Min differs |
| ktm_xbow_gt4 | rearWingRange | [0, 4] | min 1, step 1, observed max 9 | Imported setups exceed app max |
| maserati_mc_gt4 | camberRearRange | [-3.8, -2.2] | min -2.8, step 0.1, observed max -2.8 | Min differs |
| maserati_mc_gt4 | wheelRatesFront | 2 entries 116000…186000 | 3 entries 116000…186000 | List differs |
| maserati_mc_gt4 | wheelRatesRear | 2 entries 113000…163000 | 3 entries 113000…163000 | List differs |
| mclaren_570s_gt4 | wheelRatesFront | 2 entries 140000…175520 | 2 entries 140000…175000 | List differs |
| mclaren_570s_gt4 | wheelRatesRear | 2 entries 80000…162850 | 2 entries 162850…175520 | List differs |
| mclaren_570s_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| mclaren_570s_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| mclaren_570s_gt4 | preloadStep | 0 | 10 | Step differs |
| mclaren_570s_gt4 | rideHeightFrontRange | [90, 110] | min 100, step 1, observed max 105 | Min differs |
| mclaren_570s_gt4 | rideHeightRearRange | [95, 120] | min 100, step 1, observed max 125 | Min differs |
| mclaren_570s_gt4 | rideHeightRearRange | [95, 120] | min 100, step 1, observed max 125 | Imported setups exceed app max |
| mercedes_amg_gt4 | wheelRatesFront | 2 entries 78000…104000 | 3 entries 78000…104000 | List differs |
| mercedes_amg_gt4 | wheelRatesRear | 2 entries 66000…66000 | 1 entries 66000…66000 | List differs |
| mercedes_amg_gt4 | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 1 | Min differs |
| mercedes_amg_gt4 | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 2 | Min differs |
| porsche_718_cayman_gt4_mr | wheelRatesFront | 6 entries 99000…173500 | 4 entries 99000…124000 | List differs |
| porsche_718_cayman_gt4_mr | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 5 | Min differs |
| porsche_718_cayman_gt4_mr | antirollBarFrontRange | [1, 4] | min 0, step 1, observed max 5 | Imported setups exceed app max |
| porsche_718_cayman_gt4_mr | antirollBarRearRange | [1, 4] | min 0, step 1, observed max 0 | Min differs |
| porsche_718_cayman_gt4_mr | rideHeightFrontRange | [111, 150] | min 96, step 1, observed max 102 | Min differs |
| porsche_718_cayman_gt4_mr | rideHeightRearRange | [99, 150] | min 84, step 1, observed max 127 | Min differs |
| ferrari_488_challenge_evo | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 1 | Min differs |
| ferrari_488_challenge_evo | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 0 | Min differs |
| ferrari_488_challenge_evo | bumpStopRate (rear) | [0, 0] | min 0, step 100, observed max 100 | Imported setups exceed app max |
| ferrari_488_challenge_evo | bumpStopRateStep (front) | 0 | 100 | Step differs |
| ferrari_488_challenge_evo | bumpStopRateStep (rear) | 0 | 100 | Step differs |
| ferrari_488_challenge_evo | bumpStopWindowStep | 0 | 1 | Step differs |
| ferrari_488_challenge_evo | preloadStep | 0 | 10 | Step differs |
| lamborghini_huracan_st_evo2 | camberFrontRange | [-3, -0.5] | min -3.5, step 0.1, observed max -3.5 | Min differs |
| lamborghini_huracan_st_evo2 | camberRearRange | [-3.5, -0.5] | min -3, step 0.1, observed max -3 | Min differs |
| lamborghini_huracan_st_evo2 | antirollBarFrontRange | [1, 5] | min 0, step 1, observed max 5 | Min differs |
| lamborghini_huracan_st_evo2 | antirollBarRearRange | [1, 5] | min 0, step 1, observed max 1 | Min differs |
| porsche_991ii_gt3_cup | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 12 | Min differs |
| porsche_991ii_gt3_cup | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| porsche_991ii_gt3_cup | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 8 | Min differs |
| porsche_991ii_gt3_cup | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| porsche_991ii_gt3_cup | rideHeightRearRange | [80, 120] | min 80, step 1, observed max 125 | Imported setups exceed app max |
| porsche_991ii_gt3_cup | rearWingRange | [1, 10] | min 1, step 1, observed max 11 | Imported setups exceed app max |
| porsche_992_gt3_cup | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 12 | Min differs |
| porsche_992_gt3_cup | antirollBarFrontRange | [1, 3] | min 0, step 1, observed max 12 | Imported setups exceed app max |
| porsche_992_gt3_cup | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 8 | Min differs |
| porsche_992_gt3_cup | antirollBarRearRange | [1, 3] | min 0, step 1, observed max 8 | Imported setups exceed app max |
| porsche_992_gt3_cup | preloadRange | [1, 1] | min 0, step 10, observed max 0 | Min differs |
