/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { fireEvent } from "@testing-library/react";
import { runInAction } from "mobx";
import getActiveHelmRepositoriesInjectable from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import requestPublicHelmRepositoriesInjectable from "../helm-charts/child-features/preferences/renderer/adding-of-public-helm-repository/public-helm-repositories/request-public-helm-repositories.injectable";
import userPreferencesStateInjectable from "../user-preferences/common/state.injectable";

import type { RenderResult } from "@testing-library/react";

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { UserPreferencesState } from "../user-preferences/common/state.injectable";

describe("kubectl-download-mirror preference", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let state: UserPreferencesState;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(getActiveHelmRepositoriesInjectable, () => async () => ({
        callWasSuccessful: true,
        response: [],
      }));
    });

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(requestPublicHelmRepositoriesInjectable, () => async () => []);
    });

    rendered = await builder.render();
    state = builder.applicationWindow.only.di.inject(userPreferencesStateInjectable);
    builder.preferences.navigate();
    builder.preferences.navigation.click("kubernetes");
  });

  it("shows 'Default (Google)' as the initial selected value", () => {
    expect(rendered.getByText("Default (Google)")).toBeInTheDocument();
  });

  it("does not render a separate URL text input anywhere on the page", () => {
    expect(rendered.queryByPlaceholderText("Custom URL...")).not.toBeInTheDocument();
  });

  describe("when downloadKubectlBinaries is false", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadKubectlBinaries = false;
      });
    });

    it("disables the select", () => {
      expect(rendered.container.querySelector("#download-mirror-input")).toBeDisabled();
    });
  });

  describe("when typing a non-HTTPS URL into the select input", () => {
    beforeEach(() => {
      const input = rendered.container.querySelector("#download-mirror-input") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "http://not-https.example.com" } });
    });

    it("does not show a 'Use custom:' create option", () => {
      expect(rendered.queryByText(/^Use custom:/)).not.toBeInTheDocument();
    });

    it("shows a validation error message", () => {
      expect(rendered.getByText("Must be a valid HTTPS URL")).toBeInTheDocument();
    });

    describe("when Enter is pressed", () => {
      beforeEach(() => {
        const input = rendered.container.querySelector("#download-mirror-input") as HTMLInputElement;

        fireEvent.keyDown(input, { key: "Enter" });
      });

      it("does not change downloadMirror away from default", () => {
        expect(state.downloadMirror).toBe("default");
      });

      it("does not save a kubectlDownloadMirrorUrl", () => {
        expect(state.kubectlDownloadMirrorUrl).toBeUndefined();
      });

      it("applies an error class to the select container", () => {
        expect(rendered.container.querySelector(".download-mirror-error")).toBeInTheDocument();
      });

      describe("when the user starts typing again", () => {
        beforeEach(() => {
          const input = rendered.container.querySelector("#download-mirror-input") as HTMLInputElement;

          fireEvent.change(input, { target: { value: "https://fixed.example.com" } });
        });

        it("clears the error class", () => {
          expect(rendered.container.querySelector(".download-mirror-error")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when typing a valid HTTPS URL into the select input", () => {
    beforeEach(() => {
      const input = rendered.container.querySelector("#download-mirror-input") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "https://corp.example.com/kubectl" } });
    });

    it("shows a 'Use custom: https://corp.example.com/kubectl' option", () => {
      expect(rendered.getByText("Use custom: https://corp.example.com/kubectl")).toBeInTheDocument();
    });

    it("does not show a validation error", () => {
      expect(rendered.queryByText("Must be a valid HTTPS URL")).not.toBeInTheDocument();
    });

    describe("when Enter is pressed", () => {
      beforeEach(() => {
        const input = rendered.container.querySelector("#download-mirror-input") as HTMLInputElement;

        fireEvent.keyDown(input, { key: "Enter" });
      });

      it("sets downloadMirror to 'custom'", () => {
        expect(state.downloadMirror).toBe("custom");
      });

      it("saves the typed URL", () => {
        expect(state.kubectlDownloadMirrorUrl).toBe("https://corp.example.com/kubectl");
      });
    });
  });

  describe("when downloadMirror is set to 'custom' and a URL is saved", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadMirror = "custom";
        state.kubectlDownloadMirrorUrl = "https://corp.example.com/kubectl";
      });
    });

    it("displays the saved URL as the selected value", () => {
      expect(rendered.getByText("https://corp.example.com/kubectl")).toBeInTheDocument();
    });

    it("shows the clear (X) button", () => {
      expect(rendered.container.querySelector(".Select__clear-indicator")).toBeInTheDocument();
    });

    describe("when the clear button is clicked", () => {
      beforeEach(() => {
        const clearBtn = rendered.container.querySelector(".Select__clear-indicator") as HTMLElement;

        fireEvent.mouseDown(clearBtn);
      });

      it("resets downloadMirror to the default", () => {
        expect(state.downloadMirror).toBe("default");
      });

      it("clears kubectlDownloadMirrorUrl", () => {
        expect(state.kubectlDownloadMirrorUrl).toBeUndefined();
      });
    });

    describe("when switching to a named mirror", () => {
      beforeEach(() => {
        runInAction(() => {
          state.downloadMirror = "default";
        });
      });

      it("shows 'Default (Google)' as the selected value", () => {
        expect(rendered.getByText("Default (Google)")).toBeInTheDocument();
      });

      it("preserves the custom URL in state", () => {
        expect(state.kubectlDownloadMirrorUrl).toBe("https://corp.example.com/kubectl");
      });
    });
  });
});
