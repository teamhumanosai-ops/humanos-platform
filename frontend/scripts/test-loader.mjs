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

function isRelativeOrAbsoluteSpecifier(specifier) {
  return (
    specifier.startsWith(".") ||
    specifier.startsWith("/")
  );
}

function resolveTypeScriptExtension(
  specifier,
  parentURL
) {
  if (!isRelativeOrAbsoluteSpecifier(specifier)) {
    return null;
  }

  const baseURL = new URL(specifier, parentURL);

  if (baseURL.pathname.includes(".")) {
    return null;
  }

  for (const extension of TYPESCRIPT_EXTENSIONS) {
    const candidate = new URL(
      `${baseURL.href}${extension}`
    );

    try {
      readFileSync(
        fileURLToPath(candidate)
      );

      return candidate.href;
    } catch {
      // Continue searching.
    }
  }

  const indexCandidates =
    TYPESCRIPT_EXTENSIONS.map(
      (extension) =>
        new URL(
          `${baseURL.href}/index${extension}`
        )
    );

  for (const candidate of indexCandidates) {
    try {
      readFileSync(
        fileURLToPath(candidate)
      );

      return candidate.href;
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
  const frontendRoot = parentPath.includes("/frontend/")
    ? parentPath.slice(
        0,
        parentPath.lastIndexOf("/frontend/") + "/frontend".length
      )
    : parentPath.includes("\\frontend\\")
      ? parentPath.slice(
          0,
          parentPath.lastIndexOf("\\frontend\\") + "\\frontend".length
        )
      : null;

  if (!frontendRoot) {
    return null;
  }

  const relativePath =
    specifier.slice(2);

  const baseURL = new URL(
    `${relativePath}`,
    `${new URL("file://${frontendRoot.replaceAll("\\", "/")}/").href}`
  );

  const candidateSpecifier =
    baseURL.pathname.startsWith("/")
      ? baseURL.pathname
      : `/${baseURL.pathname}`;

  const filesystemBase =
    new URL(
      `file://${candidateSpecifier}`
    );

  if (
    filesystemBase.pathname.includes(".")
  ) {
    return null;
  }

  const candidates = [
    ...TYPESCRIPT_EXTENSIONS.map(
      (extension) =>
        new URL(
          `${filesystemBase.href}${extension}`
        )
    ),
    ...TYPESCRIPT_EXTENSIONS.map(
      (extension) =>
        new URL(
          `${filesystemBase.href}/index${extension}`
        )
    ),
  ];

  for (const candidate of candidates) {
    try {
      readFileSync(
        fileURLToPath(candidate)
      );

      return candidate.href;
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
