import { assertUnreachable } from "~/utils/types";
import type { MainWeaponId, SpecialWeaponId, SubWeaponId } from "./types";

export const weaponCategories = [
  {
    name: "SHOOTERS",
    weaponIds: [
      0, 1, 10, 11, 20, 21, 30, 31, 40, 41, 45, 50, 60, 61, 70, 71, 80, 81, 90,
      91, 100, 101, 300, 301, 310, 311, 400, 401,
    ],
  },
  {
    name: "BLASTERS",
    weaponIds: [
      200, 201, 210, 211, 220, 230, 231, 240, 241, 250, 251, 260, 261,
    ],
  },
  {
    name: "ROLLERS",
    weaponIds: [1000, 1001, 1010, 1011, 1020, 1021, 1030, 1040, 1041],
  },
  {
    name: "BRUSHES",
    weaponIds: [1100, 1101, 1110, 1111, 1121, 1120],
  },
  {
    name: "CHARGERS",
    weaponIds: [
      2000, 2010, 2011, 2020, 2021, 2030, 2040, 2050, 2060, 2061, 2070, 2071,
    ],
  },
  {
    name: "SLOSHERS",
    weaponIds: [3000, 3001, 3010, 3011, 3020, 3021, 3030, 3031, 3040, 3050],
  },
  {
    name: "SPLATLINGS",
    weaponIds: [4000, 4001, 4010, 4011, 4020, 4030, 4031, 4040, 4050],
  },
  {
    name: "DUALIES",
    weaponIds: [5000, 5001, 5010, 5011, 5020, 5030, 5031, 5040, 5041],
  },
  {
    name: "BRELLAS",
    weaponIds: [6000, 6001, 6010, 6011, 6020, 6021],
  },
  {
    name: "STRINGERS",
    weaponIds: [7010, 7011, 7020, 7021],
  },
  {
    name: "SPLATANAS",
    weaponIds: [8000, 8001, 8010, 8011],
  },
] as const;

export const mainWeaponIds = weaponCategories
  .flatMap((category) => category.weaponIds)
  .sort((a, b) => a - b);

export const weaponIdToAltId = new Map<MainWeaponId, MainWeaponId>([[40, 45]]);
export const altWeaponIdToId = new Map<MainWeaponId, MainWeaponId>([[45, 40]]);

const altWeaponIds = new Set(weaponIdToAltId.values());
export const weaponIdIsNotAlt = (weaponId: MainWeaponId) =>
  !altWeaponIds.has(weaponId);

export const SPLAT_BOMB_ID = 0;
export const SUCTION_BOMB_ID = 1;
export const BURST_BOMB_ID = 2;
export const SPRINKLER_ID = 3;
export const SPLASH_WALL_ID = 4;
export const FIZZY_BOMB_ID = 5;
export const CURLING_BOMB_ID = 6;
export const AUTO_BOMB_ID = 7;
export const SQUID_BEAKON_ID = 8;
export const POINT_SENSOR_ID = 9;
export const INK_MINE_ID = 10;
export const TOXIC_MIST_ID = 11;
export const ANGLE_SHOOTER_ID = 12;
export const TORPEDO_ID = 13;

export const subWeaponIds = [
  SPLAT_BOMB_ID,
  SUCTION_BOMB_ID,
  BURST_BOMB_ID,
  SPRINKLER_ID,
  SPLASH_WALL_ID,
  FIZZY_BOMB_ID,
  CURLING_BOMB_ID,
  AUTO_BOMB_ID,
  SQUID_BEAKON_ID,
  POINT_SENSOR_ID,
  INK_MINE_ID,
  TOXIC_MIST_ID,
  ANGLE_SHOOTER_ID,
  TORPEDO_ID,
] as const;

export const nonBombSubWeaponIds = [
  SPRINKLER_ID,
  SPLASH_WALL_ID,
  SQUID_BEAKON_ID,
  POINT_SENSOR_ID,
  TOXIC_MIST_ID,
] as SubWeaponId[];

export const TRIZOOKA_ID = 1;
export const BIG_BUBBLER_ID = 2;
export const ZIPCASTER_ID = 3;
export const TENTA_MISSILES_ID = 4;
export const INK_STORM_ID = 5;
export const BOOYAH_BOMB_ID = 6;
export const WAVE_BREAKER_ID = 7;
export const INK_VAC_ID = 8;
export const KILLER_WAIL_ID = 9;
export const INKJET_ID = 10;
export const ULTRA_STAMP_ID = 11;
export const CRAB_TANK_ID = 12;
export const REEF_SLIDER_ID = 13;
export const TRIPLE_INKSTRIKE_ID = 14;
export const TACTICOOLER_ID = 15;
export const SUPER_CHUMP_ID = 16;
export const KRAKEN_ROYALE_ID = 17;
export const TRIPLE_SPLASHDOWN_ID = 18;
export const SPLATTERCOLOR_SCREEN_ID = 19;

export const specialWeaponIds = [
  TRIZOOKA_ID,
  BIG_BUBBLER_ID,
  ZIPCASTER_ID,
  TENTA_MISSILES_ID,
  INK_STORM_ID,
  BOOYAH_BOMB_ID,
  WAVE_BREAKER_ID,
  INK_VAC_ID,
  KILLER_WAIL_ID,
  INKJET_ID,
  ULTRA_STAMP_ID,
  CRAB_TANK_ID,
  REEF_SLIDER_ID,
  TRIPLE_INKSTRIKE_ID,
  TACTICOOLER_ID,
  SUPER_CHUMP_ID,
  KRAKEN_ROYALE_ID,
  TRIPLE_SPLASHDOWN_ID,
  SPLATTERCOLOR_SCREEN_ID,
] as const;

export const nonDamagingSpecialWeaponIds = [BIG_BUBBLER_ID, TACTICOOLER_ID];

export const exampleMainWeaponIdWithSpecialWeaponId = (
  specialWeaponId: SpecialWeaponId,
): MainWeaponId => {
  switch (specialWeaponId) {
    case TRIZOOKA_ID:
      return 40;
    case BIG_BUBBLER_ID:
      return 10;
    case ZIPCASTER_ID:
      return 8000;
    case TENTA_MISSILES_ID:
      return 1030;
    case INK_STORM_ID:
      return 3040;
    case BOOYAH_BOMB_ID:
      return 3020;
    case WAVE_BREAKER_ID:
      return 220;
    case INK_VAC_ID:
      return 2010;
    case KILLER_WAIL_ID:
      return 50;
    case INKJET_ID:
      return 3010;
    case ULTRA_STAMP_ID:
      return 4000;
    case CRAB_TANK_ID:
      return 20;
    case REEF_SLIDER_ID:
      return 5040;
    case TRIPLE_INKSTRIKE_ID:
      return 41;
    case TACTICOOLER_ID:
      return 60;
    case SUPER_CHUMP_ID:
      return 61;
    case KRAKEN_ROYALE_ID:
      return 4011;
    case TRIPLE_SPLASHDOWN_ID:
      return 211;
    case SPLATTERCOLOR_SCREEN_ID:
      return 401;
    default: {
      assertUnreachable(specialWeaponId);
    }
  }
};
