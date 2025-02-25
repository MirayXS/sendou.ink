import { describe, expect, test } from "vitest";
import type { MainWeaponId } from "./types";
import { weaponIdToArrayWithAlts, weaponIdToBucketId } from "./weapon-ids";

describe("weaponIdToBucketId()", () => {
	test("Each weaponId is mapped to its correct bucket", () => {
		const mappings = [
			[0, 0],
			[1, 0],
			[10, 10],
			[11, 10],
			[20, 20],
			[21, 20],
			[30, 30],
			[31, 30],
			[40, 40],
			[41, 40],
			[45, 40],
			[46, 40],
			[47, 40],
			[50, 50],
			[51, 50],
			[60, 60],
			[61, 60],
			[70, 70],
			[71, 70],
			[80, 80],
			[81, 80],
			[90, 90],
			[91, 90],
			[100, 100],
			[101, 100],
			[200, 200],
			[201, 200],
			[205, 200],
			[210, 210],
			[211, 210],
			[220, 220],
			[221, 220],
			[230, 230],
			[231, 230],
			[240, 240],
			[241, 240],
			[250, 250],
			[251, 250],
			[260, 260],
			[261, 260],
			[300, 300],
			[301, 300],
			[310, 310],
			[311, 310],
			[400, 400],
			[401, 400],
			[1000, 1000],
			[1001, 1000],
			[1010, 1010],
			[1011, 1010],
			[1015, 1010],
			[1020, 1020],
			[1021, 1020],
			[1030, 1030],
			[1031, 1030],
			[1040, 1040],
			[1041, 1040],
			[1100, 1100],
			[1101, 1100],
			[1110, 1110],
			[1111, 1110],
			[1115, 1110],
			[1120, 1120],
			[1121, 1120],
			[2000, 2000],
			[2001, 2000],
			[2010, 2010],
			[2011, 2010],
			[2015, 2010],
			[2020, 2020],
			[2021, 2020],
			[2030, 2030],
			[2031, 2030],
			[2040, 2040],
			[2041, 2040],
			[2050, 2050],
			[2051, 2050],
			[2060, 2060],
			[2061, 2060],
			[2070, 2070],
			[2071, 2070],
			[3000, 3000],
			[3001, 3000],
			[3005, 3000],
			[3010, 3010],
			[3011, 3010],
			[3020, 3020],
			[3021, 3020],
			[3030, 3030],
			[3031, 3030],
			[3040, 3040],
			[3041, 3040],
			[3050, 3050],
			[3051, 3050],
			[4000, 4000],
			[4001, 4000],
			[4010, 4010],
			[4011, 4010],
			[4015, 4010],
			[4020, 4020],
			[4021, 4020],
			[4030, 4030],
			[4031, 4030],
			[4040, 4040],
			[4041, 4040],
			[4050, 4050],
			[4051, 4050],
			[5000, 5000],
			[5001, 5000],
			[5010, 5010],
			[5011, 5010],
			[5015, 5010],
			[5020, 5020],
			[5021, 5020],
			[5030, 5030],
			[5031, 5030],
			[5040, 5040],
			[5041, 5040],
			[5050, 5050],
			[5051, 5050],
			[6000, 6000],
			[6001, 6000],
			[6005, 6000],
			[6010, 6010],
			[6011, 6010],
			[6020, 6020],
			[6021, 6020],
			[6030, 6030],
			[6031, 6030],
			[7010, 7010],
			[7011, 7010],
			[7015, 7010],
			[7020, 7020],
			[7021, 7020],
			[7030, 7030],
			[7031, 7030],
			[8000, 8000],
			[8001, 8000],
			[8005, 8000],
			[8010, 8010],
			[8011, 8010],
			[8020, 8020],
			[8021, 8020],
		];
		for (const [id, expected] of mappings) {
			expect(weaponIdToBucketId(id as MainWeaponId)).toBe(expected);
		}
	});

	test("Buckets represent the same main weapon across variants", () => {
		const weaponData: Record<MainWeaponId, any> = {
			"250": {
				season: 0,
				sub: "PoisonMist",
				special: "SpBlower",
				class: "Blaster",
				kit: "LightLong_00",
				reference_kit: "LightLong_00",
				reference_id: 250,
			},
			"251": {
				season: 4,
				sub: "LineMarker",
				special: "SpMicroLaser",
				class: "Blaster",
				kit: "LightLong_01",
				reference_kit: "LightLong_01",
				reference_id: 251,
			},
			"230": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpUltraShot",
				class: "Blaster",
				kit: "LightShort_00",
				reference_kit: "LightShort_00",
				reference_id: 230,
			},
			"231": {
				season: 3,
				sub: "Bomb_Curling",
				special: "SpFirework",
				class: "Blaster",
				kit: "LightShort_01",
				reference_kit: "LightShort_01",
				reference_id: 231,
			},
			"240": {
				season: 0,
				sub: "Trap",
				special: "SpTripleTornado",
				class: "Blaster",
				kit: "Light_00",
				reference_kit: "Light_00",
				reference_id: 240,
			},
			"241": {
				season: 3,
				sub: "Bomb_Torpedo",
				special: "SpJetpack",
				class: "Blaster",
				kit: "Light_01",
				reference_kit: "Light_01",
				reference_id: 241,
			},
			"220": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpShockSonar",
				class: "Blaster",
				kit: "Long_00",
				reference_kit: "Long_00",
				reference_id: 220,
			},
			"221": {
				season: 8,
				sub: "Bomb_Splash",
				special: "SpCastle",
				class: "Blaster",
				kit: "Long_01",
				reference_kit: "Long_01",
				reference_id: 221,
			},
			"210": {
				season: 0,
				sub: "Bomb_Robot",
				special: "SpGreatBarrier",
				class: "Blaster",
				kit: "Middle_00",
				reference_kit: "Middle_00",
				reference_id: 210,
			},
			"211": {
				season: 6,
				sub: "PointSensor",
				special: "SpPogo",
				class: "Blaster",
				kit: "Middle_01",
				reference_kit: "Middle_01",
				reference_id: 211,
			},
			"260": {
				season: 4,
				sub: "Sprinkler",
				special: "SpSkewer",
				class: "Blaster",
				kit: "Precision_00",
				reference_kit: "Precision_00",
				reference_id: 260,
			},
			"261": {
				season: 6,
				sub: "Bomb_Quick",
				special: "SpNiceBall",
				class: "Blaster",
				kit: "Precision_01",
				reference_kit: "Precision_01",
				reference_id: 261,
			},
			"200": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpSuperHook",
				class: "Blaster",
				kit: "Short_00",
				reference_kit: "Short_00",
				reference_id: 200,
			},
			"201": {
				season: 2,
				sub: "Bomb_Fizzy",
				special: "SpUltraStamp",
				class: "Blaster",
				kit: "Short_01",
				reference_kit: "Short_01",
				reference_id: 201,
			},
			"205": {
				season: -1,
				sub: "Bomb_Splash",
				special: "SpSuperHook",
				class: "Blaster",
				kit: "Short_O",
				reference_kit: "Short_00",
				reference_id: 200,
			},
			"1120": {
				season: 4,
				sub: "Bomb_Curling",
				special: "SpShockSonar",
				class: "Brush",
				kit: "Heavy_00",
				reference_kit: "Heavy_00",
				reference_id: 1120,
			},
			"1121": {
				season: 6,
				sub: "PointSensor",
				special: "SpMultiMissile",
				class: "Brush",
				kit: "Heavy_01",
				reference_kit: "Heavy_01",
				reference_id: 1121,
			},
			"1100": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpMicroLaser",
				class: "Brush",
				kit: "Mini_00",
				reference_kit: "Mini_00",
				reference_id: 1100,
			},
			"1101": {
				season: 2,
				sub: "Trap",
				special: "SpUltraStamp",
				class: "Brush",
				kit: "Mini_01",
				reference_kit: "Mini_01",
				reference_id: 1101,
			},
			"1110": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpSuperHook",
				class: "Brush",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 1110,
			},
			"1111": {
				season: 5,
				sub: "Beacon",
				special: "SpInkStorm",
				class: "Brush",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 1111,
			},
			"1115": {
				season: -1,
				sub: "Bomb_Suction",
				special: "SpSuperHook",
				class: "Brush",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 1110,
			},
			"2060": {
				season: 0,
				sub: "Bomb_Torpedo",
				special: "SpMultiMissile",
				class: "Charger",
				kit: "Keeper_00",
				reference_kit: "Keeper_00",
				reference_id: 2060,
			},
			"2061": {
				season: 5,
				sub: "Bomb_Fizzy",
				special: "SpUltraStamp",
				class: "Charger",
				kit: "Keeper_01",
				reference_kit: "Keeper_01",
				reference_id: 2061,
			},
			"2050": {
				season: 0,
				sub: "Bomb_Robot",
				special: "SpMicroLaser",
				class: "Charger",
				kit: "Light_00",
				reference_kit: "Light_00",
				reference_id: 2050,
			},
			"2051": {
				season: 8,
				sub: "Bomb_Fizzy",
				special: "SpFirework",
				class: "Charger",
				kit: "Light_01",
				reference_kit: "Light_01",
				reference_id: 2051,
			},
			"2040": {
				season: 0,
				sub: "Trap",
				special: "SpShockSonar",
				class: "Charger",
				kit: "LongScope_00",
				reference_kit: "LongScope_00",
				reference_id: 2040,
			},
			"2041": {
				season: 7,
				sub: "Beacon",
				special: "SpCastle",
				class: "Charger",
				kit: "LongScope_01",
				reference_kit: "LongScope_01",
				reference_id: 2041,
			},
			"2030": {
				season: 0,
				sub: "Trap",
				special: "SpShockSonar",
				class: "Charger",
				kit: "Long_00",
				reference_kit: "Long_00",
				reference_id: 2030,
			},
			"2031": {
				season: 7,
				sub: "Beacon",
				special: "SpCastle",
				class: "Charger",
				kit: "Long_01",
				reference_kit: "Long_01",
				reference_id: 2031,
			},
			"2020": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpBlower",
				class: "Charger",
				kit: "NormalScope_00",
				reference_kit: "NormalScope_00",
				reference_id: 2020,
			},
			"2021": {
				season: 3,
				sub: "Shield",
				special: "SpTripleTornado",
				class: "Charger",
				kit: "NormalScope_01",
				reference_kit: "NormalScope_01",
				reference_id: 2021,
			},
			"2010": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpBlower",
				class: "Charger",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 2010,
			},
			"2011": {
				season: 3,
				sub: "Shield",
				special: "SpTripleTornado",
				class: "Charger",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 2011,
			},
			"2015": {
				season: -1,
				sub: "Bomb_Splash",
				special: "SpBlower",
				class: "Charger",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 2010,
			},
			"2070": {
				season: 2,
				sub: "Sprinkler",
				special: "SpEnergyStand",
				class: "Charger",
				kit: "Pencil_00",
				reference_kit: "Pencil_00",
				reference_id: 2070,
			},
			"2071": {
				season: 6,
				sub: "Shield",
				special: "SpInkStorm",
				class: "Charger",
				kit: "Pencil_01",
				reference_kit: "Pencil_01",
				reference_id: 2071,
			},
			"2000": {
				season: 0,
				sub: "PointSensor",
				special: "SpGreatBarrier",
				class: "Charger",
				kit: "Quick_00",
				reference_kit: "Quick_00",
				reference_id: 2000,
			},
			"2001": {
				season: 7,
				sub: "Bomb_Robot",
				special: "SpSuperHook",
				class: "Charger",
				kit: "Quick_01",
				reference_kit: "Quick_01",
				reference_id: 2001,
			},
			"5030": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpShockSonar",
				class: "Maneuver",
				kit: "Dual_00",
				reference_kit: "Dual_00",
				reference_id: 5030,
			},
			"5031": {
				season: 4,
				sub: "Beacon",
				special: "SpFirework",
				class: "Maneuver",
				kit: "Dual_01",
				reference_kit: "Dual_01",
				reference_id: 5031,
			},
			"5020": {
				season: 0,
				sub: "Shield",
				special: "SpNiceBall",
				class: "Maneuver",
				kit: "Gallon_00",
				reference_kit: "Gallon_00",
				reference_id: 5020,
			},
			"5021": {
				season: 7,
				sub: "PointSensor",
				special: "SpUltraShot",
				class: "Maneuver",
				kit: "Gallon_01",
				reference_kit: "Gallon_01",
				reference_id: 5021,
			},
			"5050": {
				season: 7,
				sub: "Trap",
				special: "SpMicroLaser",
				class: "Maneuver",
				kit: "Long_00",
				reference_kit: "Long_00",
				reference_id: 5050,
			},
			"5051": {
				season: 8,
				sub: "Bomb_Quick",
				special: "SpTripleTornado",
				class: "Maneuver",
				kit: "Long_01",
				reference_kit: "Long_01",
				reference_id: 5051,
			},
			"5010": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpChariot",
				class: "Maneuver",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 5010,
			},
			"5011": {
				season: 6,
				sub: "Bomb_Curling",
				special: "SpPogo",
				class: "Maneuver",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 5011,
			},
			"5015": {
				season: -1,
				sub: "Bomb_Suction",
				special: "SpChariot",
				class: "Maneuver",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 5010,
			},
			"5000": {
				season: 0,
				sub: "Beacon",
				special: "SpEnergyStand",
				class: "Maneuver",
				kit: "Short_00",
				reference_kit: "Short_00",
				reference_id: 5000,
			},
			"5001": {
				season: 2,
				sub: "Bomb_Torpedo",
				special: "SpSkewer",
				class: "Maneuver",
				kit: "Short_01",
				reference_kit: "Short_01",
				reference_id: 5001,
			},
			"5040": {
				season: 0,
				sub: "Bomb_Robot",
				special: "SpSkewer",
				class: "Maneuver",
				kit: "Stepper_00",
				reference_kit: "Stepper_00",
				reference_id: 5040,
			},
			"5041": {
				season: 4,
				sub: "Sprinkler",
				special: "SpSuperHook",
				class: "Maneuver",
				kit: "Stepper_01",
				reference_kit: "Stepper_01",
				reference_id: 5041,
			},
			"1000": {
				season: 0,
				sub: "Bomb_Robot",
				special: "SpSuperHook",
				class: "Roller",
				kit: "Compact_00",
				reference_kit: "Compact_00",
				reference_id: 1000,
			},
			"1001": {
				season: 2,
				sub: "Bomb_Quick",
				special: "SpUltraShot",
				class: "Roller",
				kit: "Compact_01",
				reference_kit: "Compact_01",
				reference_id: 1001,
			},
			"1020": {
				season: 0,
				sub: "Sprinkler",
				special: "SpEnergyStand",
				class: "Roller",
				kit: "Heavy_00",
				reference_kit: "Heavy_00",
				reference_id: 1020,
			},
			"1021": {
				season: 5,
				sub: "Bomb_Splash",
				special: "SpFirework",
				class: "Roller",
				kit: "Heavy_01",
				reference_kit: "Heavy_01",
				reference_id: 1021,
			},
			"1030": {
				season: 0,
				sub: "Trap",
				special: "SpMultiMissile",
				class: "Roller",
				kit: "Hunter_00",
				reference_kit: "Hunter_00",
				reference_id: 1030,
			},
			"1031": {
				season: 7,
				sub: "Bomb_Suction",
				special: "SpChimney",
				class: "Roller",
				kit: "Hunter_01",
				reference_kit: "Hunter_01",
				reference_id: 1031,
			},
			"1010": {
				season: 0,
				sub: "Bomb_Curling",
				special: "SpGreatBarrier",
				class: "Roller",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 1010,
			},
			"1011": {
				season: 3,
				sub: "Beacon",
				special: "SpCastle",
				class: "Roller",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 1011,
			},
			"1015": {
				season: -1,
				sub: "Bomb_Curling",
				special: "SpGreatBarrier",
				class: "Roller",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 1010,
			},
			"1040": {
				season: 2,
				sub: "Shield",
				special: "SpBlower",
				class: "Roller",
				kit: "Wide_00",
				reference_kit: "Wide_00",
				reference_id: 1040,
			},
			"1041": {
				season: 4,
				sub: "LineMarker",
				special: "SpInkStorm",
				class: "Roller",
				kit: "Wide_01",
				reference_kit: "Wide_01",
				reference_id: 1041,
			},
			"8020": {
				season: 8,
				sub: "Bomb_Suction",
				special: "SpGreatBarrier",
				class: "Saber",
				kit: "Heavy_00",
				reference_kit: "Heavy_00",
				reference_id: 8020,
			},
			"8021": {
				season: 8,
				sub: "Shield",
				special: "SpJetpack",
				class: "Saber",
				kit: "Heavy_01",
				reference_kit: "Heavy_01",
				reference_id: 8021,
			},
			"8010": {
				season: 1,
				sub: "Bomb_Torpedo",
				special: "SpUltraStamp",
				class: "Saber",
				kit: "Lite_00",
				reference_kit: "Lite_00",
				reference_id: 8010,
			},
			"8011": {
				season: 4,
				sub: "Beacon",
				special: "SpMultiMissile",
				class: "Saber",
				kit: "Lite_01",
				reference_kit: "Lite_01",
				reference_id: 8011,
			},
			"8000": {
				season: 0,
				sub: "Bomb_Quick",
				special: "SpSuperHook",
				class: "Saber",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 8000,
			},
			"8001": {
				season: 6,
				sub: "PoisonMist",
				special: "SpChariot",
				class: "Saber",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 8001,
			},
			"8005": {
				season: -1,
				sub: "Bomb_Quick",
				special: "SpSuperHook",
				class: "Saber",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 8000,
			},
			"6020": {
				season: 0,
				sub: "Trap",
				special: "SpSkewer",
				class: "Shelter",
				kit: "Compact_00",
				reference_kit: "Compact_00",
				reference_id: 6020,
			},
			"6021": {
				season: 6,
				sub: "Bomb_Torpedo",
				special: "SpChimney",
				class: "Shelter",
				kit: "Compact_01",
				reference_kit: "Compact_01",
				reference_id: 6021,
			},
			"6030": {
				season: 7,
				sub: "LineMarker",
				special: "SpGreatBarrier",
				class: "Shelter",
				kit: "Focus_00",
				reference_kit: "Focus_00",
				reference_id: 6030,
			},
			"6031": {
				season: 8,
				sub: "PoisonMist",
				special: "SpPogo",
				class: "Shelter",
				kit: "Focus_01",
				reference_kit: "Focus_01",
				reference_id: 6031,
			},
			"6000": {
				season: 0,
				sub: "Sprinkler",
				special: "SpTripleTornado",
				class: "Shelter",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 6000,
			},
			"6001": {
				season: 5,
				sub: "Bomb_Robot",
				special: "SpJetpack",
				class: "Shelter",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 6001,
			},
			"6005": {
				season: -1,
				sub: "Sprinkler",
				special: "SpTripleTornado",
				class: "Shelter",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 6000,
			},
			"6010": {
				season: 0,
				sub: "Beacon",
				special: "SpBlower",
				class: "Shelter",
				kit: "Wide_00",
				reference_kit: "Wide_00",
				reference_id: 6010,
			},
			"6011": {
				season: 4,
				sub: "Trap",
				special: "SpUltraShot",
				class: "Shelter",
				kit: "Wide_01",
				reference_kit: "Wide_01",
				reference_id: 6011,
			},
			"30": {
				season: 0,
				sub: "Bomb_Fizzy",
				special: "SpSkewer",
				class: "Shooter",
				kit: "Blaze_00",
				reference_kit: "Blaze_00",
				reference_id: 30,
			},
			"31": {
				season: 2,
				sub: "Sprinkler",
				special: "SpNiceBall",
				class: "Shooter",
				kit: "Blaze_01",
				reference_kit: "Blaze_01",
				reference_id: 31,
			},
			"70": {
				season: 0,
				sub: "LineMarker",
				special: "SpChariot",
				class: "Shooter",
				kit: "Expert_00",
				reference_kit: "Expert_00",
				reference_id: 70,
			},
			"71": {
				season: 2,
				sub: "Bomb_Suction",
				special: "SpNiceBall",
				class: "Shooter",
				kit: "Expert_01",
				reference_kit: "Expert_01",
				reference_id: 71,
			},
			"10": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpGreatBarrier",
				class: "Shooter",
				kit: "First_00",
				reference_kit: "First_00",
				reference_id: 10,
			},
			"11": {
				season: 2,
				sub: "Bomb_Torpedo",
				special: "SpShockSonar",
				class: "Shooter",
				kit: "First_01",
				reference_kit: "First_01",
				reference_id: 11,
			},
			"400": {
				season: 0,
				sub: "Shield",
				special: "SpUltraShot",
				class: "Shooter",
				kit: "Flash_00",
				reference_kit: "Flash_00",
				reference_id: 400,
			},
			"401": {
				season: 6,
				sub: "Bomb_Robot",
				special: "SpChimney",
				class: "Shooter",
				kit: "Flash_01",
				reference_kit: "Flash_01",
				reference_id: 401,
			},
			"50": {
				season: 0,
				sub: "Shield",
				special: "SpMicroLaser",
				class: "Shooter",
				kit: "Gravity_00",
				reference_kit: "Gravity_00",
				reference_id: 50,
			},
			"51": {
				season: 7,
				sub: "Bomb_Curling",
				special: "SpChimney",
				class: "Shooter",
				kit: "Gravity_01",
				reference_kit: "Gravity_01",
				reference_id: 51,
			},
			"80": {
				season: 0,
				sub: "Sprinkler",
				special: "SpBlower",
				class: "Shooter",
				kit: "Heavy_00",
				reference_kit: "Heavy_00",
				reference_id: 80,
			},
			"81": {
				season: 3,
				sub: "Shield",
				special: "SpCastle",
				class: "Shooter",
				kit: "Heavy_01",
				reference_kit: "Heavy_01",
				reference_id: 81,
			},
			"90": {
				season: 0,
				sub: "LineMarker",
				special: "SpBlower",
				class: "Shooter",
				kit: "Long_00",
				reference_kit: "Long_00",
				reference_id: 90,
			},
			"91": {
				season: 3,
				sub: "PoisonMist",
				special: "SpInkStorm",
				class: "Shooter",
				kit: "Long_01",
				reference_kit: "Long_01",
				reference_id: 91,
			},
			"40": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpUltraShot",
				class: "Shooter",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 40,
			},
			"41": {
				season: 2,
				sub: "Bomb_Splash",
				special: "SpTripleTornado",
				class: "Shooter",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 41,
			},
			"45": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpUltraShot",
				class: "Shooter",
				kit: "Normal_H",
				reference_kit: "Normal_00",
				reference_id: 40,
			},
			"47": {
				season: -1,
				sub: "Bomb_Suction",
				special: "SpUltraShot",
				class: "Shooter",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 40,
			},
			"46": {
				season: -1,
				sub: "Bomb_Splash",
				special: "SpTripleTornado",
				class: "Shooter",
				kit: "Normal_Oct",
				reference_kit: "Normal_01",
				reference_id: 41,
			},
			"20": {
				season: 0,
				sub: "Bomb_Quick",
				special: "SpChariot",
				class: "Shooter",
				kit: "Precision_00",
				reference_kit: "Precision_00",
				reference_id: 20,
			},
			"21": {
				season: 3,
				sub: "Bomb_Suction",
				special: "SpTripleTornado",
				class: "Shooter",
				kit: "Precision_01",
				reference_kit: "Precision_01",
				reference_id: 21,
			},
			"100": {
				season: 2,
				sub: "PointSensor",
				special: "SpMicroLaser",
				class: "Shooter",
				kit: "QuickLong_00",
				reference_kit: "QuickLong_00",
				reference_id: 100,
			},
			"101": {
				season: 4,
				sub: "Trap",
				special: "SpJetpack",
				class: "Shooter",
				kit: "QuickLong_01",
				reference_kit: "QuickLong_01",
				reference_id: 101,
			},
			"60": {
				season: 0,
				sub: "Bomb_Suction",
				special: "SpEnergyStand",
				class: "Shooter",
				kit: "QuickMiddle_00",
				reference_kit: "QuickMiddle_00",
				reference_id: 60,
			},
			"61": {
				season: 3,
				sub: "Bomb_Robot",
				special: "SpFirework",
				class: "Shooter",
				kit: "QuickMiddle_01",
				reference_kit: "QuickMiddle_01",
				reference_id: 61,
			},
			"0": {
				season: 0,
				sub: "Bomb_Curling",
				special: "SpUltraStamp",
				class: "Shooter",
				kit: "Short_00",
				reference_kit: "Short_00",
				reference_id: 0,
			},
			"1": {
				season: 3,
				sub: "Beacon",
				special: "SpMicroLaser",
				class: "Shooter",
				kit: "Short_01",
				reference_kit: "Short_01",
				reference_id: 1,
			},
			"310": {
				season: 0,
				sub: "PointSensor",
				special: "SpEnergyStand",
				class: "Shooter",
				kit: "TripleMiddle_00",
				reference_kit: "TripleMiddle_00",
				reference_id: 310,
			},
			"311": {
				season: 4,
				sub: "Shield",
				special: "SpGreatBarrier",
				class: "Shooter",
				kit: "TripleMiddle_01",
				reference_kit: "TripleMiddle_01",
				reference_id: 311,
			},
			"300": {
				season: 0,
				sub: "Bomb_Curling",
				special: "SpChariot",
				class: "Shooter",
				kit: "TripleQuick_00",
				reference_kit: "TripleQuick_00",
				reference_id: 300,
			},
			"301": {
				season: 3,
				sub: "Bomb_Quick",
				special: "SpUltraStamp",
				class: "Shooter",
				kit: "TripleQuick_01",
				reference_kit: "TripleQuick_01",
				reference_id: 301,
			},
			"3030": {
				season: 0,
				sub: "Sprinkler",
				special: "SpInkStorm",
				class: "Slosher",
				kit: "Bathtub_00",
				reference_kit: "Bathtub_00",
				reference_id: 3030,
			},
			"3031": {
				season: 5,
				sub: "LineMarker",
				special: "SpCastle",
				class: "Slosher",
				kit: "Bathtub_01",
				reference_kit: "Bathtub_01",
				reference_id: 3031,
			},
			"3010": {
				season: 0,
				sub: "PoisonMist",
				special: "SpJetpack",
				class: "Slosher",
				kit: "Diffusion_00",
				reference_kit: "Diffusion_00",
				reference_id: 3010,
			},
			"3011": {
				season: 3,
				sub: "Bomb_Fizzy",
				special: "SpEnergyStand",
				class: "Slosher",
				kit: "Diffusion_01",
				reference_kit: "Diffusion_01",
				reference_id: 3011,
			},
			"3050": {
				season: 5,
				sub: "Bomb_Suction",
				special: "SpSkewer",
				class: "Slosher",
				kit: "Double_00",
				reference_kit: "Double_00",
				reference_id: 3050,
			},
			"3051": {
				season: 7,
				sub: "Beacon",
				special: "SpShockSonar",
				class: "Slosher",
				kit: "Double_01",
				reference_kit: "Double_01",
				reference_id: 3051,
			},
			"3020": {
				season: 0,
				sub: "Bomb_Fizzy",
				special: "SpNiceBall",
				class: "Slosher",
				kit: "Launcher_00",
				reference_kit: "Launcher_00",
				reference_id: 3020,
			},
			"3021": {
				season: 5,
				sub: "PointSensor",
				special: "SpUltraShot",
				class: "Slosher",
				kit: "Launcher_01",
				reference_kit: "Launcher_01",
				reference_id: 3021,
			},
			"3000": {
				season: 0,
				sub: "Bomb_Splash",
				special: "SpTripleTornado",
				class: "Slosher",
				kit: "Strong_00",
				reference_kit: "Strong_00",
				reference_id: 3000,
			},
			"3001": {
				season: 2,
				sub: "LineMarker",
				special: "SpSuperHook",
				class: "Slosher",
				kit: "Strong_01",
				reference_kit: "Strong_01",
				reference_id: 3001,
			},
			"3005": {
				season: -1,
				sub: "Bomb_Splash",
				special: "SpTripleTornado",
				class: "Slosher",
				kit: "Strong_O",
				reference_kit: "Strong_00",
				reference_id: 3000,
			},
			"3040": {
				season: 0,
				sub: "PointSensor",
				special: "SpInkStorm",
				class: "Slosher",
				kit: "Washtub_00",
				reference_kit: "Washtub_00",
				reference_id: 3040,
			},
			"3041": {
				season: 7,
				sub: "Shield",
				special: "SpPogo",
				class: "Slosher",
				kit: "Washtub_01",
				reference_kit: "Washtub_01",
				reference_id: 3041,
			},
			"4030": {
				season: 0,
				sub: "Bomb_Fizzy",
				special: "SpJetpack",
				class: "Spinner",
				kit: "Downpour_00",
				reference_kit: "Downpour_00",
				reference_id: 4030,
			},
			"4031": {
				season: 5,
				sub: "Trap",
				special: "SpBlower",
				class: "Spinner",
				kit: "Downpour_01",
				reference_kit: "Downpour_01",
				reference_id: 4031,
			},
			"4050": {
				season: 5,
				sub: "Bomb_Curling",
				special: "SpEnergyStand",
				class: "Spinner",
				kit: "HyperShort_00",
				reference_kit: "HyperShort_00",
				reference_id: 4050,
			},
			"4051": {
				season: 8,
				sub: "Bomb_Splash",
				special: "SpChariot",
				class: "Spinner",
				kit: "HyperShort_01",
				reference_kit: "HyperShort_01",
				reference_id: 4051,
			},
			"4020": {
				season: 0,
				sub: "Bomb_Robot",
				special: "SpNiceBall",
				class: "Spinner",
				kit: "Hyper_00",
				reference_kit: "Hyper_00",
				reference_id: 4020,
			},
			"4021": {
				season: 8,
				sub: "Trap",
				special: "SpChimney",
				class: "Spinner",
				kit: "Hyper_01",
				reference_kit: "Hyper_01",
				reference_id: 4021,
			},
			"4000": {
				season: 0,
				sub: "Bomb_Quick",
				special: "SpUltraStamp",
				class: "Spinner",
				kit: "Quick_00",
				reference_kit: "Quick_00",
				reference_id: 4000,
			},
			"4001": {
				season: 2,
				sub: "PoisonMist",
				special: "SpGreatBarrier",
				class: "Spinner",
				kit: "Quick_01",
				reference_kit: "Quick_01",
				reference_id: 4001,
			},
			"4040": {
				season: 0,
				sub: "PointSensor",
				special: "SpInkStorm",
				class: "Spinner",
				kit: "Serein_00",
				reference_kit: "Serein_00",
				reference_id: 4040,
			},
			"4041": {
				season: 7,
				sub: "Bomb_Suction",
				special: "SpPogo",
				class: "Spinner",
				kit: "Serein_01",
				reference_kit: "Serein_01",
				reference_id: 4041,
			},
			"4010": {
				season: 0,
				sub: "Sprinkler",
				special: "SpShockSonar",
				class: "Spinner",
				kit: "Standard_00",
				reference_kit: "Standard_00",
				reference_id: 4010,
			},
			"4011": {
				season: 4,
				sub: "PointSensor",
				special: "SpCastle",
				class: "Spinner",
				kit: "Standard_01",
				reference_kit: "Standard_01",
				reference_id: 4011,
			},
			"4015": {
				season: -1,
				sub: "Sprinkler",
				special: "SpShockSonar",
				class: "Spinner",
				kit: "Standard_O",
				reference_kit: "Standard_00",
				reference_id: 4010,
			},
			"7030": {
				season: 8,
				sub: "Bomb_Robot",
				special: "SpUltraStamp",
				class: "Stringer",
				kit: "Explosion_00",
				reference_kit: "Explosion_00",
				reference_id: 7030,
			},
			"7031": {
				season: 8,
				sub: "PointSensor",
				special: "SpShockSonar",
				class: "Stringer",
				kit: "Explosion_01",
				reference_kit: "Explosion_01",
				reference_id: 7031,
			},
			"7010": {
				season: 0,
				sub: "PoisonMist",
				special: "SpMicroLaser",
				class: "Stringer",
				kit: "Normal_00",
				reference_kit: "Normal_00",
				reference_id: 7010,
			},
			"7011": {
				season: 5,
				sub: "Sprinkler",
				special: "SpFirework",
				class: "Stringer",
				kit: "Normal_01",
				reference_kit: "Normal_01",
				reference_id: 7011,
			},
			"7015": {
				season: -1,
				sub: "PoisonMist",
				special: "SpMicroLaser",
				class: "Stringer",
				kit: "Normal_O",
				reference_kit: "Normal_00",
				reference_id: 7010,
			},
			"7020": {
				season: 0,
				sub: "Bomb_Curling",
				special: "SpMultiMissile",
				class: "Stringer",
				kit: "Short_00",
				reference_kit: "Short_00",
				reference_id: 7020,
			},
			"7021": {
				season: 6,
				sub: "Shield",
				special: "SpSkewer",
				class: "Stringer",
				kit: "Short_01",
				reference_kit: "Short_01",
				reference_id: 7021,
			},
		};

		const main: any = {};

		const weaponPrefix = (kit: string): string => {
			const idx = kit.search(/_/g);
			return kit.substring(0, idx);
		};

		for (const [id, { kit }] of Object.entries(weaponData)) {
			const bucket = weaponIdToBucketId(Number(id) as MainWeaponId);
			if (main[bucket] === undefined) {
				main[bucket] = weaponPrefix(kit);
			} else {
				expect(main[bucket]).toBe(weaponPrefix(kit));
			}
		}
	});
});

describe("weaponIdToArrayWithAlts", () => {
	test("handles weapon id without alts", () => {
		const id = 0;
		const result = weaponIdToArrayWithAlts(id);
		expect(result).toEqual([0]);
	});

	test("handles weapon id with alts", () => {
		const id = 40;
		const result = weaponIdToArrayWithAlts(id);
		expect(result).toEqual([40, 45, 47]);
	});

	test("handles alt weapon id", () => {
		const id = 45;
		const result = weaponIdToArrayWithAlts(id);
		expect(result).toEqual([40, 45, 47]);
	});

	test("handles weapon id with only one alt", () => {
		const id = 41;
		const result = weaponIdToArrayWithAlts(id);
		expect(result).toEqual([41, 46]);
	});
});
