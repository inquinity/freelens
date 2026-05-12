/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { fireEvent, waitFor } from "@testing-library/react";
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

  it("shows 'Default (Google)' as the initially selected mirror", () => {
    expect(rendered.getByText("Default (Google)")).toBeInTheDocument();
  });

  it("does not show the custom URL input initially", () => {
    expect(rendered.queryByPlaceholderText(/artifacts\.example\.com/)).not.toBeInTheDocument();
  });

  describe("when downloadKubectlBinaries is false", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadKubectlBinaries = false;
      });
    });

    it("disables the mirror select", () => {
      expect(rendered.container.querySelector("#download-mirror-input")).toBeDisabled();
    });
  });

  describe("when Custom is selected", () => {
    beforeEach(() => {
      runInAction(() => {
        state.downloadMirror = "custom";
      });
    });

    it("shows the custom URL input", () => {
      expect(rendered.getByPlaceholderText(/artifacts\.example\.com/)).toBeInTheDocument();
    });

    it("shows the hint text", () => {
      expect(rendered.getByText(/Freelens fills in the version and platform path/)).toBeInTheDocument();
    });

    it("shows the 'Custom mirror URL' subtitle", () => {
      expect(rendered.getByText("Custom mirror URL")).toBeInTheDocument();
    });

    describe("when a URL is typed into the custom input", () => {
      beforeEach(() => {
        const input = rendered.getByPlaceholderText(/artifacts\.example\.com/) as HTMLInputElement;

        fireEvent.change(input, { target: { value: "https://corp.example.com/kubectl" } });
      });

      it("updates downloadCustomMirror in state", () => {
        expect(state.downloadCustomMirror).toBe("https://corp.example.com/kubectl");
      });
    });

    describe("when an invalid URL is typed and the input is blurred", () => {
      beforeEach(async () => {
        const input = rendered.getByPlaceholderText(/artifacts\.example\.com/) as HTMLInputElement;

        fireEvent.change(input, { target: { value: "not-a-url" } });
        fireEvent.blur(input);
        await waitFor(() => rendered.getByText("Wrong url format"));
      });

      it("shows a validation error", () => {
        expect(rendered.getByText("Wrong url format")).toBeInTheDocument();
      });
    });

    describe("when downloadKubectlBinaries is false", () => {
      beforeEach(() => {
        runInAction(() => {
          state.downloadKubectlBinaries = false;
        });
      });

      it("disables the custom URL input", () => {
        const input = rendered.getByPlaceholderText(/artifacts\.example\.com/) as HTMLInputElement;

        expect(input).toBeDisabled();
      });
    });

    describe("when a non-custom mirror is then selected", () => {
      beforeEach(() => {
        runInAction(() => {
          state.downloadMirror = "default";
        });
      });

      it("hides the custom URL input", () => {
        expect(rendered.queryByPlaceholderText(/artifacts\.example\.com/)).not.toBeInTheDocument();
      });
    });
  });
});
