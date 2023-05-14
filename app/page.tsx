import { KandinskyImageEditor } from "@/src/components/kandinsky-image-editor";
import { isClient } from "@/src/utils/utils";
import { JustInClient } from "@/src/components/just-in-client";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <JustInClient>
          <KandinskyImageEditor />
        </JustInClient>
      </div>
    </main>
  );
}
