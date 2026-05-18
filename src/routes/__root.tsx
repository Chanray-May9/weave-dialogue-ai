import { Outlet, createRootRoute } from "@tanstack/react-router";
import { HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { AuroraBackdrop } from "@/components/AuroraBackdrop";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="font-display text-7xl text-gradient">404</div>
        <p className="mt-2 text-muted-foreground">这一页消散在了硅基的雾里</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Silicon · 硅基对话工作室" },
      { name: "description", content: "本地优先的硅基流动 AI 对话工作室：自定义角色、多 AI 群组、流畅交互。" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <HeadContent />
      </head>
      <body className="grain">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <StoreProvider>
      <AuroraBackdrop />
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </StoreProvider>
  );
}
