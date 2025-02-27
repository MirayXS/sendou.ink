import { Link, useLocation, useMatches } from "@remix-run/react";
import * as React from "react";
import type { RootLoaderData } from "~/root";
import type { Breadcrumb, SendouRouteHandle } from "~/utils/remix";
import { Footer } from "./Footer";
import { useTranslation } from "react-i18next";
import { Image } from "../Image";
import { UserItem } from "./UserItem";
import { LanguageChanger } from "./LanguageChanger";
import { ThemeChanger } from "./ThemeChanger";
import { LinkButton } from "../Button";
import { SUPPORT_PAGE } from "~/utils/urls";
import { HeartIcon } from "../icons/Heart";
import { useIsMounted } from "~/hooks/useIsMounted";

function useBreadcrumbs() {
  const { t } = useTranslation();
  const matches = useMatches();

  return React.useMemo(() => {
    const result: Array<Breadcrumb | Array<Breadcrumb>> = [];

    for (const match of [...matches].reverse()) {
      const handle = match.handle as SendouRouteHandle | undefined;
      const resolvedBreadcrumb = handle?.breadcrumb?.({ match, t });

      if (resolvedBreadcrumb) {
        result.push(resolvedBreadcrumb);
      }
    }

    return result.flat();
  }, [matches, t]);
}

export const Layout = React.memo(function Layout({
  children,
  data,
  isErrored = false,
}: {
  children: React.ReactNode;
  data?: RootLoaderData;
  isErrored?: boolean;
}) {
  const { t } = useTranslation(["common"]);
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();

  const isFrontPage = location.pathname === "/";

  const showLeaderboard =
    data &&
    data.publisherId &&
    !data?.user?.patronTier &&
    !location.pathname.includes("plans");
  return (
    <div className="layout__container">
      <header className="layout__header layout__item_size">
        <div className="layout__breadcrumb-container">
          <Link to="/" className="layout__breadcrumb logo">
            sendou.ink
          </Link>
          {breadcrumbs.flatMap((breadcrumb) => {
            return [
              <span
                key={`${breadcrumb.href}-sep`}
                className="layout__breadcrumb-separator"
              >
                /
              </span>,
              <BreadcrumbLink key={breadcrumb.href} data={breadcrumb} />,
            ];
          })}
          {isFrontPage ? (
            <>
              <div className="layout__breadcrumb-separator mobile-hidden">
                -
              </div>
              <div className="layout__breadcrumb mobile-hidden">
                {t("common:websiteSubtitle")}
              </div>
              {data && typeof data?.user?.patronTier !== "number" ? (
                <LinkButton
                  to={SUPPORT_PAGE}
                  size="tiny"
                  icon={<HeartIcon />}
                  variant="outlined"
                  className="ml-auto desktop-hidden"
                >
                  {t("common:pages.support")}
                </LinkButton>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="layout__header__right-container">
          {data && typeof data?.user?.patronTier !== "number" ? (
            <LinkButton
              to={SUPPORT_PAGE}
              size="tiny"
              icon={<HeartIcon />}
              variant="outlined"
            >
              {t("common:pages.support")}
            </LinkButton>
          ) : null}
          <LanguageChanger />
          <ThemeChanger />
          {!isErrored ? <UserItem /> : null}
        </div>
      </header>
      {showLeaderboard ? <MyRampUnit /> : null}
      {children}
      <Footer patrons={data?.patrons} />
    </div>
  );
});

function BreadcrumbLink({ data }: { data: Breadcrumb }) {
  if (data.type === "IMAGE") {
    return (
      <Link to={data.href} className="layout__breadcrumb">
        <Image alt="" path={data.imgPath} width={30} height={30} />
      </Link>
    );
  }

  return (
    <Link to={data.href} className="layout__breadcrumb">
      {data.text}
    </Link>
  );
}
const RampUnit = React.lazy(() => import("../ramp/RampUnit"));
function MyRampUnit() {
  const isMounted = useIsMounted();
  if (!isMounted) {
    return <div className="top-leaderboard" />;
  }

  return <RampUnit type="leaderboard_atf" cssClass="top-leaderboard" />;
}
