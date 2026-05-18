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
      { property: "og:title", content: "Silicon · 硅基对话工作室" },
      { name: "twitter:title", content: "Silicon · 硅基对话工作室" },
      { property: "og:description", content: "本地优先的硅基流动 AI 对话工作室：自定义角色、多 AI 群组、流畅交互。" },
      { name: "twitter:description", content: "本地优先的硅基流动 AI 对话工作室：自定义角色、多 AI 群组、流畅交互。" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ae3c1b84-2e21-4a67-a1ec-613e640975bc/id-preview-046b9181--64330eed-0486-4e56-87f7-fcd561e854cc.lovable.app-1779102487480.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ae3c1b84-2e21-4a67-a1ec-613e640975bc/id-preview-046b9181--64330eed-0486-4e56-87f7-fcd561e854cc.lovable.app-1779102487480.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
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
