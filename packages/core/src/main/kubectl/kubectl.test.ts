/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { defaultPackageMirror, packageMirrors } from "../../features/user-preferences/common/preferences-helpers";
import { Kubectl } from "./kubectl";

import type { KubectlDependencies } from "./kubectl";

const makeKubectl = (overrides: Partial<KubectlDependencies["state"]> = {}): Kubectl => {
  const state: KubectlDependencies["state"] = {
    downloadKubectlBinaries: true,
    downloadMirror: defaultPackageMirror,
    kubectlDownloadMirrorUrl: undefined,
    kubectlBinariesPath: undefined,
    downloadBinariesPath: undefined,
    ...overrides,
  };

  const dependencies: KubectlDependencies = {
    state,
    directoryForKubectlBinaries: "/some-dir/kubectl",
    normalizedDownloadPlatform: "linux",
    normalizedDownloadArch: "amd64",
    kubectlBinaryName: "kubectl",
    bundledKubectlBinaryPath: "/bundled/kubectl",
    baseBundledBinariesDirectory: "/bundled",
    bundledKubectlVersion: "1.28.0",
    kubectlVersionMap: new Map([["1.28", "1.28.0"]]),
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      silly: jest.fn(),
    },
    downloadBinary: jest.fn(),
    joinPaths: (...parts: string[]) => parts.join("/"),
    getDirnameOfPath: (p: string) => p.split("/").slice(0, -1).join("/"),
    getBasenameOfPath: (p: string) => p.split("/").at(-1) ?? "",
    execFile: jest.fn(),
    unlink: jest.fn(),
  };

  return new Kubectl(dependencies, "1.28.0");
};

describe("Kubectl.getDownloadMirror()", () => {
  describe("when kubectlDownloadMirrorUrl is set to a non-empty string", () => {
    let kubectl: Kubectl;

    beforeEach(() => {
      kubectl = makeKubectl({
        kubectlDownloadMirrorUrl: "https://my.mirror.example.com/kubectl",
      });
    });

    it("returns the custom mirror URL directly", () => {
      // getDownloadMirror is protected; we verify through the constructed url
      expect((kubectl as any).url).toContain("https://my.mirror.example.com/kubectl");
    });
  });

  describe("when kubectlDownloadMirrorUrl is undefined", () => {
    let kubectl: Kubectl;

    beforeEach(() => {
      kubectl = makeKubectl({
        kubectlDownloadMirrorUrl: undefined,
        downloadMirror: defaultPackageMirror,
      });
    });

    it("falls back to the mirror map URL for the configured mirror", () => {
      const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when kubectlDownloadMirrorUrl is an empty string", () => {
    let kubectl: Kubectl;

    beforeEach(() => {
      kubectl = makeKubectl({
        kubectlDownloadMirrorUrl: "",
        downloadMirror: defaultPackageMirror,
      });
    });

    it("falls back to the mirror map URL (treats empty string as falsy)", () => {
      const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when a named mirror is configured and no custom URL is set", () => {
    let kubectl: Kubectl;

    beforeEach(() => {
      kubectl = makeKubectl({
        kubectlDownloadMirrorUrl: undefined,
        downloadMirror: "china",
      });
    });

    it("uses the named mirror's URL from packageMirrors", () => {
      const expectedUrl = packageMirrors.get("china")!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when a custom URL is set alongside a named mirror", () => {
    let kubectl: Kubectl;

    beforeEach(() => {
      kubectl = makeKubectl({
        kubectlDownloadMirrorUrl: "https://corp.example.com/kubectl",
        downloadMirror: "china",
      });
    });

    it("the custom URL takes precedence over the named mirror", () => {
      expect((kubectl as any).url).toContain("https://corp.example.com/kubectl");
      expect((kubectl as any).url).not.toContain(packageMirrors.get("china")!.url);
    });
  });
});
