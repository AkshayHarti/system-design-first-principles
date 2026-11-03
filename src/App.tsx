import { useEffect } from "react";
import { Shell } from "./components/Shell";
import { moduleBySlug } from "./content";
import { useRoute } from "./lib/router";
import { startSync } from "./lib/sync";
import { useSession } from "./lib/supabase";
import { Arena } from "./pages/Arena";
import { Home } from "./pages/Home";
import { ModulePage } from "./pages/ModulePage";
import { Settings } from "./pages/Settings";

function NotFound({ route }: { route: string }) {
  return (
    <div className="page">
      <p className="eyebrow">404</p>
      <h1>No page at {route}</h1>
      <p className="module-promise">
        The curriculum is on the left. It is more interesting than this page.
      </p>
      <a className="btn btn-primary" href="#/">
        Back to the curriculum
      </a>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const session = useSession();

  useEffect(() => {
    if (!session) return;
    return startSync(session.user.id);
  }, [session]);

  let page: React.ReactNode;

  if (route === "/") {
    page = <Home />;
  } else if (route.startsWith("/m/")) {
    const slug = route.slice(3);
    const module = moduleBySlug.get(slug);
    page = module ? (
      <ModulePage key={slug} module={module} />
    ) : (
      <NotFound route={route} />
    );
  } else if (route === "/arena") {
    page = <Arena />;
  } else if (route === "/settings") {
    page = <Settings />;
  } else {
    page = <NotFound route={route} />;
  }

  return (
    <Shell route={route}>
      {page}
    </Shell>
  );
}
