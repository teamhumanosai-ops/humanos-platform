import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import ts from "typescript";

const TYPESCRIPT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
];

function resolveTypeScriptExtension(specifier, parentURL) {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return null;
  }

  const baseURL = new URL(specifier, parentURL);
  if (baseURL.pathname.includes(".")) {
    return null;
  }

  for (const extension of TYPESCRIPT_EXTENSIONS) {
    const candidate = new URL(baseURL.href + extension);
    try {
      readFileSync(fileURLToPath(candidate));
      return candidate.href;
    } catch {
      // Continue searching for the next supported TypeScript extension.
    }
  }

  const indexCandidates = TYPESCRIPT_EXTENSIONS.map(
    (extension) =>
      new URL(`${baseURL.href}/index${extension}`)
  );

  for (const candidate of indexCandidates) {
    try {
      readFileSync(fileURLToPath(candidate));
      return candidate.href;
    } catch {
      // Continue searching for the next supported TypeScript index.
    }
  }

  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const resolved = resolveTypeScriptExtension(
        specifier,
        context.parentURL
      );

      if (resolved) {
        return {
          url: resolved,
          shortCircuit: true,
        };
      }

      throw error;
    }
  },

  load(url, context, nextLoad) {
    const pathname = new URL(url).pathname;
    const extension = TYPESCRIPT_EXTENSIONS.find(
      (candidate) => pathname.endsWith(candidate)
    );

    if (!extension) {
      return nextLoad(url, context);
    }

    const source = readFileSync(
      fileURLToPath(url),
      "utf8"
    );

    const transformed = ts.transpileModule(
      source,
      {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
          sourceMap: false,
        },
        fileName: fileURLToPath(url),
      }
    );

    return {
      format: "module",
      source: transformed.outputText,
      shortCircuit: true,
    };
  },
});
