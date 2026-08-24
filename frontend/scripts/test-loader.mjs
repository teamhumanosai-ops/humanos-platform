import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const TYPESCRIPT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
];

function isRelativeOrAbsoluteSpecifier(specifier) {
  return (
    specifier.startsWith(".") ||
    specifier.startsWith("/")
  );
}

function toDirectoryCandidate(basePath) {
  return TYPESCRIPT_EXTENSIONS.flatMap(
    (extension) => [
      `${basePath}${extension}`,
      `${basePath}/index${extension}`,
    ]
  );
}

function resolveTypeScriptExtension(
  specifier,
  parentURL
) {
  if (!isRelativeOrAbsoluteSpecifier(specifier)) {
    return null;
  }

  const baseURL = new URL(
    specifier,
    parentURL
  );
  const basePath = fileURLToPath(baseURL);

  if (
    TYPESCRIPT_EXTENSIONS.some(
      (extension) =>
        basePath.endsWith(extension)
    )
  ) {
    return null;
  }

  for (
    const candidatePath of toDirectoryCandidate(basePath)
  ) {
    try {
      readFileSync(candidatePath);
      return pathToFileURL(candidatePath).href;
    } catch {
      // Continue searching.
    }
  }

  return null;
}

function resolveAlias(
  specifier,
  parentURL
) {
  if (!specifier.startsWith("@/")) {
    return null;
  }

  const parentPath = fileURLToPath(parentURL);
  const frontendMarker = `${String.fromCharCode(92)}frontend${String.fromCharCode(92)}`;
  const frontendMarkerPosix = "/frontend/";

  let frontendRoot = null;

  if (parentPath.includes(frontendMarker)) {
    frontendRoot = parentPath.slice(
      0,
      parentPath.lastIndexOf(frontendMarker) + "\\frontend".length
    );
  } else if (parentPath.includes(frontendMarkerPosix)) {
    frontendRoot = parentPath.slice(
      0,
      parentPath.lastIndexOf(frontendMarkerPosix) + "/frontend".length
    );
  }

  if (!frontendRoot) {
    return null;
  }

  const relativePath = specifier.slice(2);
  const targetBase = resolve(
    frontendRoot,
    relativePath
  );

  for (
    const candidatePath of toDirectoryCandidate(targetBase)
  ) {
    try {
      readFileSync(candidatePath);
      return pathToFileURL(candidatePath).href;
    } catch {
      // Continue searching.
    }
  }

  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(
        specifier,
        context
      );
    } catch (error) {
      const resolvedAlias =
        resolveAlias(
          specifier,
          context.parentURL
        );

      if (resolvedAlias) {
        return {
          url: resolvedAlias,
          shortCircuit: true,
        };
      }

      const resolved =
        resolveTypeScriptExtension(
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
    const pathname =
      new URL(url).pathname;

    const extension =
      TYPESCRIPT_EXTENSIONS.find(
        (candidate) =>
          pathname.endsWith(
            candidate
          )
      );

    if (!extension) {
      return nextLoad(
        url,
        context
      );
    }

    const source =
      readFileSync(
        fileURLToPath(url),
        "utf8"
      );

    const transformed =
      ts.transpileModule(
        source,
        {
          compilerOptions: {
            target:
              ts.ScriptTarget.ES2022,
            module:
              ts.ModuleKind.ESNext,
            jsx:
              ts.JsxEmit.ReactJSX,
            sourceMap:
              false,
          },
          fileName:
            fileURLToPath(url),
        }
      );

    return {
      format: "module",
      source:
        transformed.outputText,
      shortCircuit:
        true,
    };
  },
});
