import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Flag } from "~/components/Flag";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { WeaponImage } from "~/components/Image";
import { Redirect } from "~/components/Redirect";
import { MicrophoneIcon } from "~/components/icons/Microphone";
import { TrashIcon } from "~/components/icons/Trash";
import { getUser, requireUser, useUser } from "~/features/auth/core";
import { tournamentIdFromParams } from "~/features/tournament";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { discordFullName } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { tournamentRegisterPage, userPage } from "~/utils/urls";
import { deleteSub } from "../queries/deleteSub.server";
import {
  findSubsByTournamentId,
  type SubByTournamentId,
} from "../queries/findSubsByTournamentId.server";
import styles from "../tournament-subs.css";
import { tournamentFromDB } from "~/features/tournament-bracket/core/Tournament.server";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);

  deleteSub({
    tournamentId,
    userId: user.id,
  });

  return null;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const tournamentId = tournamentIdFromParams(params);

  const tournament = await tournamentFromDB({ tournamentId, user });
  if (!tournament.subsFeatureEnabled) {
    throw redirect(tournamentRegisterPage(tournamentId));
  }

  const subs = findSubsByTournamentId({
    tournamentId,
    userId: user?.id,
    // eslint-disable-next-line array-callback-return
  }).filter((sub) => {
    if (sub.visibility === "ALL") return true;

    const userPlusTier = user?.plusTier ?? 4;

    switch (sub.visibility) {
      case "+1": {
        return userPlusTier === 1;
      }
      case "+2": {
        return userPlusTier <= 2;
      }
      case "+3": {
        return userPlusTier <= 3;
      }
      default: {
        assertUnreachable(sub.visibility);
      }
    }
  });

  return {
    subs,
    hasOwnSubPost: subs.some((sub) => sub.userId === user?.id),
  };
};

export default function TournamentSubsPage() {
  const user = useUser();
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const tournament = useTournament();

  if (tournament.everyBracketOver) {
    return <Redirect to={tournamentRegisterPage(tournament.ctx.id)} />;
  }

  return (
    <div className="stack lg">
      {!tournament.teamMemberOfByUser(user) && user ? (
        <div className="stack items-end">
          <LinkButton to="new" size="tiny">
            {data.hasOwnSubPost
              ? t("tournament:subs.editPost")
              : t("tournament:subs.addPost")}
          </LinkButton>
        </div>
      ) : null}
      {data.subs.map((sub) => {
        return <SubInfoSection key={sub.userId} sub={sub} />;
      })}
    </div>
  );
}

function SubInfoSection({ sub }: { sub: SubByTournamentId }) {
  const { t } = useTranslation(["common", "tournament"]);
  const user = useUser();

  const infos = [
    <div key="vc" className="sub__section__info__vc">
      <MicrophoneIcon className={sub.canVc ? "text-success" : "text-warning"} />
      {sub.canVc ? t("tournament:subs.canVC") : t("tournament:subs.noVC")}
    </div>,
  ];
  if (sub.plusTier) {
    infos.push(<React.Fragment key="slash-1">/</React.Fragment>);
    infos.push(<div key="plus">+{sub.plusTier}</div>);
  }
  if (sub.country) {
    infos.push(<React.Fragment key="slash-2">/</React.Fragment>);
    infos.push(<Flag key="flag" countryCode={sub.country} tiny />);
  }

  return (
    <div>
      <section className="sub__section">
        <Avatar user={sub} size="sm" className="sub__section__avatar" />
        <Link to={userPage(sub)} className="sub__section__name">
          {discordFullName(sub)}
        </Link>
        <div className="sub__section__spacer" />
        <div className="sub__section__info">{infos}</div>
        <div className="sub__section__weapon-top-text sub__section__weapon-text">
          {t("tournament:subs.prefersToPlay")}
        </div>
        <div className="sub__section__weapon-top-images sub__section__weapon-images">
          {sub.bestWeapons.map((wpn) => (
            <WeaponImage
              key={wpn}
              weaponSplId={wpn}
              size={32}
              variant="badge"
            />
          ))}
        </div>
        {sub.okWeapons ? (
          <>
            <div className="sub__section__weapon-bottom-text sub__section__weapon-text">
              {t("tournament:subs.canPlay")}
            </div>
            <div className="sub__section__weapon-bottom-images sub__section__weapon-images">
              {sub.okWeapons.map((wpn) => (
                <WeaponImage
                  key={wpn}
                  weaponSplId={wpn}
                  size={32}
                  variant="badge"
                />
              ))}
            </div>
          </>
        ) : null}
        {sub.message ? (
          <div className="sub__section__message">{sub.message}</div>
        ) : null}
      </section>
      {user?.id === sub.userId ? (
        <div className="stack mt-1 items-end">
          <FormWithConfirm dialogHeading="Delete your sub post?">
            <Button
              variant="minimal-destructive"
              size="tiny"
              type="submit"
              icon={<TrashIcon />}
            >
              {t("common:actions.delete")}
            </Button>
          </FormWithConfirm>
        </div>
      ) : null}
    </div>
  );
}
