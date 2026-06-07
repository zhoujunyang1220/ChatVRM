import getConfig from "next/config";

/**
 * github pagesに公開時にアセットを読み込めるようにするため、
 * 環境変数を見てURLにリポジトリ名を追加する
 */
export function buildUrl(path: string): string {
  try {
    const {
      publicRuntimeConfig,
    }: {
      publicRuntimeConfig: { root: string };
    } = getConfig();

    const root = publicRuntimeConfig?.root || "";
    // Ensure path starts with / and doesn't have trailing slash issues
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return root + normalizedPath;
  } catch (error) {
    // Fallback for when getConfig is not available (e.g., during build)
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return normalizedPath;
  }
}
