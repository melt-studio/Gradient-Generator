import { useEffect, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useStore } from "../store";
import { scaleCanvas } from "./useResize";
import { MathUtils } from "three";
import { timeout } from "../utils";

export interface ExportObject {
  download: () => Promise<void>;
}

const useExport = () => {
  const setValue = useStore((state) => state.setValue);
  const canvas = useStore((state) => state.canvas);
  const duration = useStore((state) => state.duration);
  const exporting = useStore((state) => state.exporting);
  const exportFormat = useStore((state) => state.exportFormat);
  const ffmpegLoaded = useStore((state) => state.ffmpegLoaded);
  const background = useStore((state) => state.background);
  const layout = useStore((state) => state.layout);
  const format = exportFormat.label.toLowerCase();

  const modalExport = {
    title: "Exporting",
    progress: 0,
    status: "Preparing...",
    description:
      "Please don't change, reload, or close this browser tab while export is in progress",
    closeLabel: "Cancel Export",
    closeOnClick: async () => {
      setValue("exportCancelled", true);
      await cancel();
    },
  };

  const ff = useRef<FFmpeg | null>(new FFmpeg());

  const ffDir = "images";
  const filenamePrefix = "melt_gradient";

  const exportFps = 30;

  const log = ({ type, message }: { type: string; message: string }) => {
    console.log(type, message);

    const frameCount = duration * exportFps;

    if (message.includes("frame=")) {
      const f = message.indexOf("fps=");
      const fp = message.substring("frame=".length, f).trim();
      const progress = MathUtils.clamp(parseInt(fp) / frameCount, 0, 1);

      console.log(progress);

      let status = "";
      if (format === "video") {
        status = `Creating MP4 (${Math.floor(progress * 100)}%)`;
      }

      setValue("modal", {
        ...modalExport,
        status,
        progress,
      });
    }
  };

  const options = {
    video: {
      type: "video/mp4",
      ext: "mp4",
      filename: `${filenamePrefix}.mp4`,
      // filename: filenamePrefix,
      exec: [
        "-framerate",
        `${exportFps}`,
        "-i",
        `${ffDir}/%d.png`,
        // '-s',
        // `${width}x${height}`, // size has to be divisible by 2 with libx264 / h264
        // '-c:v',
        // 'libx264',
        "-preset",
        "ultrafast",
        "-crf",
        "17",
        "-pix_fmt",
        "yuv420p",
        `${ffDir}/${filenamePrefix}.mp4`,
      ],
    },
    image: {
      type: "image/png",
      ext: "png",
      filename: `${filenamePrefix}.png`,
    },
  };

  const ffOptions = options[format as keyof typeof options];

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread ??
  const download = async () => {
    if (!exportFormat || !canvas || exporting) return;

    if (!ff.current) return;

    if (useStore.getState().exportCancelled) return;

    setValue("exporting", true);
    setValue("modal", modalExport);

    const frameCount = format === "video" ? Math.floor(duration * exportFps) : 1;

    if (useStore.getState().exportCancelled) return;

    scaleCanvas(layout, true, exportFormat.label);

    const ffmpeg = ff.current;

    if (format === "video") {
      setTime(0);
    }

    // Add timeout so canvas has time to resize before export begins
    await timeout(1000);

    if (useStore.getState().exportCancelled) return;

    setValue("modal", {
      ...modalExport,
      status: "Preparing export...",
    });

    const zerotime = performance.now();

    if (useStore.getState().exportCancelled) return;

    // Set listeners
    ffmpeg.on("log", log);

    if (useStore.getState().exportCancelled) return;

    await ffmpeg.createDir(ffDir);

    if (useStore.getState().exportCancelled) return;

    await saveImages(frameCount);

    if (format === "video") {
      setValue("modal", {
        ...modalExport,
        status: "Creating MP4 (0%)",
      });
      await ffmpeg.exec(options[format].exec).catch((err) => console.log(err.message));
    }

    setValue("exporting", false);

    // Reset canvas size
    scaleCanvas(layout);

    if (useStore.getState().exportCancelled) return;

    // Download files
    const filename = `${filenamePrefix}_${new Date().toISOString()}.${ffOptions.ext}`;
    const filePath = `${ffDir}/${ffOptions.filename}`;
    const file = await ffmpeg.readFile(filePath);
    if (typeof file !== "string") {
      // FileData typeof Uint8Array | string
      const data = new Blob([file.buffer], { type: ffOptions.type });
      downloadFile(data, filename);
    }

    // Delete ffmpeg files and directory
    // Note: moved delete files/dir here from cancel/cleanup else will interfere with async writing operation and can throw error which will prevent cancel. Will have to rely on ffmpeg.terminate to cancel - to do: check if terminate also clears files/dir
    // await deleteFiles()

    await cleanup();

    console.log("Total time:", (performance.now() - zerotime) / 1000);
  };

  const setTime = (time: number) => {
    if (background) {
      background.material.uniforms.uTime.value = time;
    }
  };

  const saveImages = async (frameCount = 1) => {
    if (!ff.current || !canvas) return;

    const status = format === "image" ? "Saving image: " : "Saving frame: ";

    for (let j = 0; j < frameCount; j++) {
      if (useStore.getState().exportCancelled) return;

      const exportStatus = `${status}${j + 1}/${frameCount}`;

      if (format === "video") {
        const time = j / exportFps;
        setTime(time);
      }

      // // Render manually each frame rather than in useFrame game-loop
      // renderScene();

      const progress = (j + 1) / frameCount;

      setValue("modal", {
        ...modalExport,
        status: exportStatus,
        progress,
      });

      //   // Note: Firefox will block reading data from canvas if privacy.resistFingerprinting is enabled in browser config
      //   // https://support.mozilla.org/en-US/questions/1398931
      // const buffer = await saveCanvasImage();
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((blob) => {
          if (blob) return resolve(blob);
          throw new Error("Error converting canvas to blob");
        })
      );
      const buffer = new Uint8Array(await blob.arrayBuffer());

      const outFile = format === "video" ? `${j}.png` : ffOptions.filename;

      console.log(`FFMPEG: ${exportStatus} ${ffDir}/${outFile}`);

      await ff.current.writeFile(`${ffDir}/${outFile}`, buffer);
    }
  };

  const downloadFile = (data: Blob, filename: string) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cancel = async () => {
    if (!useStore.getState().exporting || !ff.current) return;

    // Run cleanup function
    await cleanup();

    // No exit functionality with @ffmpeg/ffmpeg so terminating and reloading
    ff.current.terminate();
    ff.current = null;
    ff.current = new FFmpeg();
    setValue("ffmpegLoaded", false);

    // Re-load ffmpeg
    await load();
  };

  // TODO: check recursively (right now only checks one level deep for layer directories)
  const deleteFiles = async (dir: string = ffDir) => {
    if (!ff.current) return;

    // Check directory exists first
    const root = await ff.current.listDir("/");
    if (!root.find((p) => p.name === dir)) return;

    // Delete ffmpeg files and directory
    const result = await ff.current.listDir(dir);
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if ([".", ".."].includes(item.name)) continue;
      if (!item.isDir) {
        console.log(`FFMPEG: Deleting file: ${dir}/${item.name}`);
        await ff.current.deleteFile(`${dir}/${item.name}`);
      } else {
        const dirList = await ff.current.listDir(`${dir}/${item.name}`);
        for (let j = 0; j < dirList.length; j++) {
          const layerItem = dirList[j];
          if ([".", ".."].includes(layerItem.name)) continue;
          if (!layerItem.isDir) {
            console.log(`FFMPEG: Deleting file: ${dir}/${item.name}/${layerItem.name}`);
            await ff.current.deleteFile(`${dir}/${item.name}/${layerItem.name}`);
          }
        }
        console.log(`FFMPEG: Deleting directory: ${dir}/${item.name}`);
        await ff.current.deleteDir(`${dir}/${item.name}`);
      }
    }
    console.log(`FFMPEG: Deleting directory: ${dir}`);
    await ff.current.deleteDir(dir);
  };

  const cleanup = async () => {
    await deleteFiles(ffDir);

    // Remove listeners
    if (ff.current) ff.current.off("log", log);

    setValue("exporting", false);
    setValue("modal", null);

    // Reset canvas size (note this needs to be done after exporting value has been set to false)
    scaleCanvas(layout, false);
  };

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread - this version doesn't include worker url in load
  const load = useCallback(async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
    if (!ff.current) return;

    try {
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ff.current.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setValue("ffmpegLoaded", true);
      setValue("exportCancelled", false);
    } catch (error) {
      console.log(error);
    }
  }, [setValue]);

  useEffect(() => {
    load();
    const ffmpeg = ff.current;

    return () => {
      if (ffmpeg) {
        ffmpeg.terminate();
      }
    };
  }, [load]);

  useEffect(() => {
    if (ffmpegLoaded) {
      console.log("Loaded FFPMEG");
    }
  }, [ffmpegLoaded, setValue]);

  return {
    download,
  };
};

export default useExport;
