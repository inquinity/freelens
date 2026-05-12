/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  chinaPackageMirror,
  customPackageMirror,
  defaultPackageMirror,
  packageMirrors,
} from "../../features/user-preferences/common/preferences-helpers";
import { Kubectl } from "./kubectl";

import type { KubectlDependencies } from "./kubectl";

const makeKubectl = (overrides: Partial<KubectlDependencies["state"]> = {}): Kubectl => {
  const state: KubectlDependencies["state"] = {
    downloadKubectlBinaries: true,
    downloadMirror: defaultPackageMirror,
    downloadCustomMirror: "",
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
  describe("when downloadMirror is default", () => {
    it("uses the default Google mirror URL", () => {
      const kubectl = makeKubectl({ downloadMirror: defaultPackageMirror });
      const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when downloadMirror is china", () => {
    it("uses the China Azure mirror URL", () => {
      const kubectl = makeKubectl({ downloadMirror: chinaPackageMirror });
      const expectedUrl = packageMirrors.get(chinaPackageMirror)!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when downloadMirror is an unknown key", () => {
    it("falls back to the default mirror", () => {
      const kubectl = makeKubectl({ downloadMirror: "unknown-mirror" });
      const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

      expect((kubectl as any).url).toContain(expectedUrl);
    });
  });

  describe("when downloadMirror is custom", () => {
    describe("and downloadCustomMirror is a valid URL", () => {
      it("uses the custom URL as-is", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: "https://my.mirror.example.com/kubectl",
        });

        expect((kubectl as any).url).toContain("https://my.mirror.example.com/kubectl");
      });
    });

    describe("and downloadCustomMirror has trailing slashes", () => {
      it("strips trailing slashes", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: "https://my.mirror.example.com/kubectl///",
        });

        expect((kubectl as any).url).toContain("https://my.mirror.example.com/kubectl");
        expect((kubectl as any).url).not.toContain("///");
      });
    });

    describe("and downloadCustomMirror has surrounding whitespace", () => {
      it("trims whitespace before using the URL", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: "  https://my.mirror.example.com/kubectl  ",
        });

        expect((kubectl as any).url).toContain("https://my.mirror.example.com/kubectl");
      });
    });

    describe("and downloadCustomMirror is an empty string", () => {
      it("falls back to the default mirror", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: "",
        });
        const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

        expect((kubectl as any).url).toContain(expectedUrl);
      });
    });

    describe("and downloadCustomMirror is whitespace only", () => {
      it("falls back to the default mirror", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: "   ",
        });
        const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

        expect((kubectl as any).url).toContain(expectedUrl);
      });
    });

    describe("and downloadCustomMirror is undefined", () => {
      it("falls back to the default mirror", () => {
        const kubectl = makeKubectl({
          downloadMirror: customPackageMirror,
          downloadCustomMirror: undefined,
        });
        const expectedUrl = packageMirrors.get(defaultPackageMirror)!.url;

        expect((kubectl as any).url).toContain(expectedUrl);
      });
    });
  });
});
