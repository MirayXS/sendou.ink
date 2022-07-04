import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { All } from "~/db/models/badges.server";
import styles from "~/styles/badges.css";
import { jsonCached } from "~/utils/remix";
import { badgeUrl } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export interface BadgesLoaderData {
  badges: All;
}

export const loader: LoaderFunction = () => {
  return jsonCached<BadgesLoaderData>({ badges: db.badges.all() }, 120);
};

export default function BadgesPageLayout() {
  const data = useLoaderData<BadgesLoaderData>();
  const params = useParams();

  const badgeIdBeingViewed = params["id"] ? Number(params["id"]) : undefined;

  return (
    <Main>
      <div className="badges__container">
        <Outlet />
        <div className="badges__small-badges">
          {data.badges
            .filter((b) => !badgeIdBeingViewed || b.id !== badgeIdBeingViewed)
            .map((badge) => (
              // xxx: firefox and squid junction avif fails to display
              <Link key={badge.id} to={String(badge.id)}>
                <Image
                  path={badgeUrl({ code: badge.code })}
                  title={badge.displayName}
                  alt={badge.displayName}
                  width={64}
                  height={64}
                />
              </Link>
            ))}
        </div>
      </div>
    </Main>
  );
}
