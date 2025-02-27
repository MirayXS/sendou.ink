import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useMatches } from "@remix-run/react";
import { countries, getEmojiFlag } from "countries-list";
import type { TCountryCode } from "countries-list";
import * as React from "react";
import { Trans } from "react-i18next";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { WeaponCombobox } from "~/components/Combobox";
import { CustomizedColorsInput } from "~/components/CustomizedColorsInput";
import { FormErrors } from "~/components/FormErrors";
import { FormMessage } from "~/components/FormMessage";
import { TrashIcon } from "~/components/icons/Trash";
import { WeaponImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { USER } from "~/constants";
import type { UserWeapon, User } from "~/db/types";
import { useTranslation } from "react-i18next";
import { useUser } from "~/features/auth/core";
import { requireUser, requireUserId } from "~/features/auth/core/user.server";
import { i18next } from "~/modules/i18n";
import { type MainWeaponId } from "~/modules/in-game-lists";
import { canAddCustomizedColorsToUserProfile } from "~/permissions";
import styles from "~/styles/u-edit.css";
import { translatedCountry } from "~/utils/i18n.server";
import { notFoundIfFalsy, safeParseRequestFormData } from "~/utils/remix";
import { errorIsSqliteUniqueConstraintFailure } from "~/utils/sql";
import { rawSensToString } from "~/utils/strings";
import { FAQ_PAGE, isCustomUrl, userPage } from "~/utils/urls";
import {
  actualNumber,
  checkboxValueToDbBoolean,
  dbBoolean,
  falsyToNull,
  id,
  jsonParseable,
  processMany,
  weaponSplId,
  safeJSONParse,
  undefinedToNull,
} from "~/utils/zod";
import { userParamsSchema, type UserPageLoaderData } from "./u.$identifier";
import { Toggle } from "~/components/Toggle";
import { StarIcon } from "~/components/icons/Star";
import { StarFilledIcon } from "~/components/icons/StarFilled";
import * as UserRepository from "~/features/user-page/UserRepository.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const userEditActionSchema = z
  .object({
    country: z.preprocess(
      falsyToNull,
      z
        .string()
        .refine(
          (val) => !val || Object.keys(countries).some((code) => val === code),
        )
        .nullable(),
    ),
    bio: z.preprocess(
      falsyToNull,
      z.string().max(USER.BIO_MAX_LENGTH).nullable(),
    ),
    customUrl: z.preprocess(
      falsyToNull,
      z
        .string()
        .max(USER.CUSTOM_URL_MAX_LENGTH)
        .refine((val) => val === null || isCustomUrl(val), {
          message: "forms.errors.invalidCustomUrl.numbers",
        })
        .refine((val) => val === null || /^[a-zA-Z0-9-_]+$/.test(val), {
          message: "forms.errors.invalidCustomUrl.strangeCharacter",
        })
        .transform((val) => val?.toLowerCase())
        .nullable(),
    ),
    stickSens: z.preprocess(
      processMany(actualNumber, undefinedToNull),
      z
        .number()
        .min(-50)
        .max(50)
        .refine((val) => val % 5 === 0)
        .nullable(),
    ),
    motionSens: z.preprocess(
      processMany(actualNumber, undefinedToNull),
      z
        .number()
        .min(-50)
        .max(50)
        .refine((val) => val % 5 === 0)
        .nullable(),
    ),
    inGameNameText: z.preprocess(
      falsyToNull,
      z.string().max(USER.IN_GAME_NAME_TEXT_MAX_LENGTH).nullable(),
    ),
    inGameNameDiscriminator: z.preprocess(
      falsyToNull,
      z
        .string()
        .refine((val) => /^[0-9a-z]{4,5}$/.test(val))
        .nullable(),
    ),
    css: z.preprocess(falsyToNull, z.string().refine(jsonParseable).nullable()),
    weapons: z.preprocess(
      safeJSONParse,
      z
        .array(
          z.object({
            weaponSplId,
            isFavorite: dbBoolean,
          }),
        )
        .max(USER.WEAPON_POOL_MAX_SIZE),
    ),
    favoriteBadgeId: z.preprocess(
      processMany(actualNumber, undefinedToNull),
      id.nullable(),
    ),
    showDiscordUniqueName: z.preprocess(checkboxValueToDbBoolean, dbBoolean),
    commissionsOpen: z.preprocess(checkboxValueToDbBoolean, dbBoolean),
    commissionText: z.preprocess(
      falsyToNull,
      z.string().max(USER.COMMISSION_TEXT_MAX_LENGTH).nullable(),
    ),
  })
  .refine(
    (val) => {
      if (val.motionSens !== null && val.stickSens === null) {
        return false;
      }

      return true;
    },
    {
      message: "forms.errors.invalidSens",
    },
  );

export const action: ActionFunction = async ({ request }) => {
  const parsedInput = await safeParseRequestFormData({
    request,
    schema: userEditActionSchema,
  });

  if (!parsedInput.success) {
    return {
      errors: parsedInput.errors,
    };
  }

  const { inGameNameText, inGameNameDiscriminator, ...data } = parsedInput.data;

  const user = await requireUserId(request);

  try {
    const editedUser = await UserRepository.updateProfile({
      ...data,
      weapons: data.weapons as Array<
        Pick<UserWeapon, "weaponSplId" | "isFavorite">
      >,
      inGameName:
        inGameNameText && inGameNameDiscriminator
          ? `${inGameNameText}#${inGameNameDiscriminator}`
          : null,
      userId: user.id,
      showDiscordUniqueName: data.showDiscordUniqueName,
    });

    throw redirect(userPage(editedUser));
  } catch (e) {
    if (!errorIsSqliteUniqueConstraintFailure(e)) {
      throw e;
    }

    return {
      errors: ["forms.errors.invalidCustomUrl.duplicate"],
    };
  }
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const locale = await i18next.getLocale(request);

  const user = await requireUser(request);
  const { identifier } = userParamsSchema.parse(params);
  const userToBeEdited = notFoundIfFalsy(
    await UserRepository.findByIdentifier(identifier),
  );
  if (user.id !== userToBeEdited.id) {
    throw redirect(userPage(userToBeEdited));
  }

  return {
    favoriteBadgeId: user.favoriteBadgeId,
    discordUniqueName: userToBeEdited.discordUniqueName,
    countries: Object.entries(countries)
      .map(([code, country]) => ({
        code,
        emoji: getEmojiFlag(code as TCountryCode),
        name:
          translatedCountry({
            countryCode: code,
            language: locale,
          }) ?? country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export default function UserEditPage() {
  const user = useUser();
  const { t } = useTranslation(["common", "user"]);
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const parentRouteData = parentRoute.data as UserPageLoaderData;
  const data = useLoaderData<typeof loader>();

  return (
    <div className="half-width">
      <Form className="u-edit__container" method="post">
        {canAddCustomizedColorsToUserProfile(user) ? (
          <CustomizedColorsInput initialColors={parentRouteData.css} />
        ) : null}
        <CustomUrlInput parentRouteData={parentRouteData} />
        <InGameNameInputs parentRouteData={parentRouteData} />
        <SensSelects parentRouteData={parentRouteData} />
        <CountrySelect parentRouteData={parentRouteData} />
        <FavBadgeSelect parentRouteData={parentRouteData} />
        <WeaponPoolSelect parentRouteData={parentRouteData} />
        <BioTextarea initialValue={parentRouteData.bio} />
        {data.discordUniqueName ? (
          <ShowUniqueDiscordNameToggle parentRouteData={parentRouteData} />
        ) : (
          <input type="hidden" name="showDiscordUniqueName" value="on" />
        )}
        {user?.isArtist ? (
          <>
            <CommissionsOpenToggle parentRouteData={parentRouteData} />
            <CommissionTextArea initialValue={parentRouteData.commissionText} />
          </>
        ) : (
          <>
            <input type="hidden" name="commissionsOpen" value="off" />
            <input type="hidden" name="commissionText" value="" />
          </>
        )}
        <FormMessage type="info">
          <Trans i18nKey={"user:discordExplanation"} t={t}>
            Username, profile picture, YouTube, Twitter and Twitch accounts come
            from your Discord account. See <Link to={FAQ_PAGE}>FAQ</Link> for
            more information.
          </Trans>
        </FormMessage>
        <SubmitButton>{t("common:actions.save")}</SubmitButton>
        <FormErrors namespace="user" />
      </Form>
    </div>
  );
}

function CustomUrlInput({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  return (
    <div className="w-full">
      <Label htmlFor="customUrl">{t("user:customUrl")}</Label>
      <Input
        name="customUrl"
        id="customUrl"
        leftAddon="https://sendou.ink/u/"
        maxLength={USER.CUSTOM_URL_MAX_LENGTH}
        defaultValue={parentRouteData.customUrl ?? undefined}
      />
    </div>
  );
}

function InGameNameInputs({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  const inGameNameParts = parentRouteData.inGameName?.split("#");

  return (
    <div className="stack items-start">
      <Label>{t("user:ign")}</Label>
      <div className="stack horizontal sm items-center">
        <Input
          className="u-edit__in-game-name-text"
          name="inGameNameText"
          aria-label="In game name"
          maxLength={USER.IN_GAME_NAME_TEXT_MAX_LENGTH}
          defaultValue={inGameNameParts?.[0]}
        />
        <div className="u-edit__in-game-name-hashtag">#</div>
        <Input
          className="u-edit__in-game-name-discriminator"
          name="inGameNameDiscriminator"
          aria-label="In game name discriminator"
          maxLength={USER.IN_GAME_NAME_DISCRIMINATOR_MAX_LENGTH}
          pattern="[0-9a-z]{4,5}"
          defaultValue={inGameNameParts?.[1]}
        />
      </div>
    </div>
  );
}

const SENS_OPTIONS = [
  -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35,
  40, 45, 50,
];
function SensSelects({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  return (
    <div className="stack horizontal md">
      <div>
        <Label htmlFor="stickSens">{t("user:stickSens")}</Label>
        <select
          id="stickSens"
          name="stickSens"
          defaultValue={parentRouteData.stickSens ?? undefined}
          className="u-edit__sens-select"
        >
          <option value="">{"-"}</option>
          {SENS_OPTIONS.map((sens) => (
            <option key={sens} value={sens}>
              {rawSensToString(Number(sens))}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="motionSens">{t("user:motionSens")}</Label>
        <select
          id="motionSens"
          name="motionSens"
          defaultValue={parentRouteData.motionSens ?? undefined}
          className="u-edit__sens-select"
        >
          <option value="">{"-"}</option>
          {SENS_OPTIONS.map((sens) => (
            <option key={sens} value={sens}>
              {rawSensToString(Number(sens))}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CountrySelect({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <label htmlFor="country">{t("user:country")}</label>
      <select
        className="u-edit__country-select"
        name="country"
        id="country"
        defaultValue={parentRouteData.country ?? ""}
      >
        <option value="" />
        {data.countries.map((country) => (
          <option key={country.code} value={country.code}>
            {`${country.name} ${country.emoji}`}
          </option>
        ))}
      </select>
    </div>
  );
}

function WeaponPoolSelect({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const [weapons, setWeapons] = React.useState(parentRouteData.weapons);
  const { t } = useTranslation(["user"]);

  const latestWeapon = weapons[weapons.length - 1];

  return (
    <div className="stack md u-edit__weapon-pool">
      <input type="hidden" name="weapons" value={JSON.stringify(weapons)} />
      <div>
        <label htmlFor="weapon">{t("user:weaponPool")}</label>
        {weapons.length < USER.WEAPON_POOL_MAX_SIZE ? (
          <WeaponCombobox
            inputName="weapon"
            id="weapon"
            onChange={(weapon) => {
              if (!weapon) return;
              setWeapons([
                ...weapons,
                {
                  weaponSplId: Number(weapon.value) as MainWeaponId,
                  isFavorite: 0,
                },
              ]);
            }}
            // empty on selection
            key={latestWeapon?.weaponSplId ?? "empty"}
            weaponIdsToOmit={new Set(weapons.map((w) => w.weaponSplId))}
            fullWidth
          />
        ) : (
          <span className="text-xs text-warning">
            {t("user:forms.errors.maxWeapons")}
          </span>
        )}
      </div>
      <div className="stack horizontal sm justify-center">
        {weapons.map((weapon) => {
          return (
            <div key={weapon.weaponSplId} className="stack xs">
              <div className="u__weapon">
                <WeaponImage
                  weaponSplId={weapon.weaponSplId}
                  variant={weapon.isFavorite ? "badge-5-star" : "badge"}
                  width={38}
                  height={38}
                />
              </div>
              <div className="stack sm horizontal items-center justify-center">
                <Button
                  icon={weapon.isFavorite ? <StarFilledIcon /> : <StarIcon />}
                  variant="minimal"
                  aria-label="Favorite weapon"
                  onClick={() =>
                    setWeapons(
                      weapons.map((w) =>
                        w.weaponSplId === weapon.weaponSplId
                          ? {
                              ...weapon,
                              isFavorite: weapon.isFavorite === 1 ? 0 : 1,
                            }
                          : w,
                      ),
                    )
                  }
                />
                <Button
                  icon={<TrashIcon />}
                  variant="minimal-destructive"
                  aria-label="Delete weapon"
                  onClick={() =>
                    setWeapons(
                      weapons.filter(
                        (w) => w.weaponSplId !== weapon.weaponSplId,
                      ),
                    )
                  }
                  testId={`delete-weapon-${weapon.weaponSplId}`}
                  size="tiny"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BioTextarea({ initialValue }: { initialValue: User["bio"] }) {
  const { t } = useTranslation("user");
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="bio"
        valueLimits={{ current: value.length, max: USER.BIO_MAX_LENGTH }}
      >
        {t("bio")}
      </Label>
      <textarea
        id="bio"
        name="bio"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER.BIO_MAX_LENGTH}
      />
    </div>
  );
}

function FavBadgeSelect({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["user"]);

  // doesn't make sense to select favorite badge
  // if user has no badges or only has 1 badge
  if (parentRouteData.badges.length < 2) return null;

  // user's current favorite badge is the initial value
  const initialBadge = parentRouteData.badges.find(
    (badge) => badge.id === data.favoriteBadgeId,
  );

  return (
    <div>
      <label htmlFor="favoriteBadgeId">{t("user:favoriteBadge")}</label>
      <select
        className=""
        name="favoriteBadgeId"
        id="favoriteBadgeId"
        defaultValue={initialBadge?.id}
      >
        {parentRouteData.badges.map((badge) => (
          <option key={badge.id} value={badge.id}>
            {`${badge.displayName}`}
          </option>
        ))}
      </select>
      <FormMessage type="info">
        {t("user:forms.info.favoriteBadge")}
      </FormMessage>
    </div>
  );
}

function ShowUniqueDiscordNameToggle({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);
  const data = useLoaderData<typeof loader>();
  const [checked, setChecked] = React.useState(
    Boolean(parentRouteData.showDiscordUniqueName),
  );

  return (
    <div>
      <label htmlFor="showDiscordUniqueName">
        {t("user:forms.showDiscordUniqueName")}
      </label>
      <Toggle
        checked={checked}
        setChecked={setChecked}
        name="showDiscordUniqueName"
      />
      <FormMessage type="info">
        {t("user:forms.showDiscordUniqueName.info", {
          discordUniqueName: data.discordUniqueName,
        })}
      </FormMessage>
    </div>
  );
}

function CommissionsOpenToggle({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);
  const [checked, setChecked] = React.useState(
    Boolean(parentRouteData.commissionsOpen),
  );

  return (
    <div>
      <label htmlFor="commissionsOpen">{t("user:forms.commissionsOpen")}</label>
      <Toggle
        checked={checked}
        setChecked={setChecked}
        name="commissionsOpen"
      />
    </div>
  );
}

function CommissionTextArea({
  initialValue,
}: {
  initialValue: User["commissionText"];
}) {
  const { t } = useTranslation(["user"]);
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="commissionText"
        valueLimits={{
          current: value.length,
          max: USER.COMMISSION_TEXT_MAX_LENGTH,
        }}
      >
        {t("user:forms.commissionText")}
      </Label>
      <textarea
        id="commissionText"
        name="commissionText"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER.COMMISSION_TEXT_MAX_LENGTH}
      />
      <FormMessage type="info">
        {t("user:forms.commissionText.info")}
      </FormMessage>
    </div>
  );
}
