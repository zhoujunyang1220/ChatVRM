import { useContext, useCallback, useEffect, useState } from "react";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);
  const [loadError, setLoadError] = useState<string | null>(null);

  const AVATAR_SAMPLE_B_VRM_URL = '/avatar_sample.vrm';

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        console.log("ChatVRM: setting up canvas");
        try {
          viewer.setup(canvas);
          console.log("ChatVRM: canvas setup done, loading VRM...");
          viewer.loadVrm(buildUrl(AVATAR_SAMPLE_B_VRM_URL));
          console.log("ChatVRM: VRM load initiated");
        } catch (err) {
          console.error("ChatVRM: setup error:", err);
          setLoadError("Failed to initialize 3D renderer");
        }

        // Drag and DropでVRMを差し替え
        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            viewer.loadVrm(url);
          }
        });
      }
    },
    [viewer]
  );

  return (
    <div className={"fixed top-0 left-0 w-screen h-[100svh]"} style={{ zIndex: -10 }}>
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>
      {loadError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-400 text-xs bg-black/60 px-3 py-1 rounded-lg">
          {loadError}
        </div>
      )}
    </div>
  );
}
