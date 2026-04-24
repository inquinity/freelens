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

describe("kubectl-download-mirror-url preference", () => {
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

  it("renders the custom download mirror URL input in the kubectl preferences section", () => {
    const input = rendered.getByPlaceholderText("https://mirror.corp/kubernetes/kubectl");

    expect(input).toBeInTheDocument();
  });

  describe("when downloadKubectlBinaries is false", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadKubectlBinaries = false;
      });
    });

    it("the custom download mirror URL input is disabled", () => {
      const input = rendered.getByPlaceholderText("https://mirror.corp/kubernetes/kubectl");

      expect(input).toBeDisabled();
    });
  });

  describe("when downloadKubectlBinaries is true", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadKubectlBinaries = true;
      });
    });

    it("the custom download mirror URL input is enabled", () => {
      const input = rendered.getByPlaceholderText("https://mirror.corp/kubernetes/kubectl");

      expect(input).not.toBeDisabled();
    });

    describe("when a URL is typed and the field is blurred", () => {
      beforeEach(() => {
        const input = rendered.getByPlaceholderText("https://mirror.corp/kubernetes/kubectl");

        fireEvent.change(input, { target: { value: "https://my.mirror.example.com/kubectl" } });
        fireEvent.blur(input);
      });

      it("updates state.kubectlDownloadMirrorUrl to the entered URL", () => {
        expect(state.kubectlDownloadMirrorUrl).toBe("https://my.mirror.example.com/kubectl");
      });
    });

    describe("when the field is cleared and blurred", () => {
      beforeEach(() => {
        // First set a value
        const input = rendered.getByPlaceholderText("https://mirror.corp/kubernetes/kubectl");

        fireEvent.change(input, { target: { value: "https://my.mirror.example.com/kubectl" } });
        fireEvent.blur(input);

        // Then clear it
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);
      });

      it("sets state.kubectlDownloadMirrorUrl to undefined (not empty string)", () => {
        expect(state.kubectlDownloadMirrorUrl).toBeUndefined();
      });
    });
  });
});
