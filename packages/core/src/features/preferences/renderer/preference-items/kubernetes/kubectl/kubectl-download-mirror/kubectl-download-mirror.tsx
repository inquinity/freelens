/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../../renderer/components/select";
import { defaultPackageMirror, packageMirrors } from "../../../../../../user-preferences/common/preferences-helpers";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";

import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const isValidHttpsUrl = (val: string): boolean => {
  try {
    return new URL(val).protocol === "https:";
  } catch {
    return false;
  }
};

const NonInjectedKubectlDownloadMirror = observer(({ state }: Dependencies) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const customOption = {
    value: "custom",
    label: state.kubectlDownloadMirrorUrl || "Custom URL...",
  };

  const downloadMirrorOptions = [
    ...Array.from(packageMirrors, ([name, mirror]) => ({
      value: name,
      label: mirror.label,
      isDisabled: !mirror.platforms.has(process.platform),
    })),
    customOption,
  ];

  const handleMenuOpen = () => {
    if (state.downloadMirror === "custom") {
      setInputValue(state.kubectlDownloadMirrorUrl || "");
    }
  };

  const handleInputChange = (val: string, meta: { action: string }) => {
    if (meta.action === "input-change") {
      setInputValue(val);
      setInputError(val && !isValidHttpsUrl(val) ? "Must be a valid HTTPS URL" : "");
    } else if (meta.action === "menu-close") {
      if (inputValue && isValidHttpsUrl(inputValue)) {
        state.downloadMirror = "custom";
        state.kubectlDownloadMirrorUrl = inputValue;
      }
      setInputValue("");
      setInputError("");
    } else {
      setInputValue("");
      setInputError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !inputValue) return;
    // Intercept Enter in capture phase before react-select selects the focused option
    e.stopPropagation();
    e.preventDefault();
    if (isValidHttpsUrl(inputValue)) {
      state.downloadMirror = "custom";
      state.kubectlDownloadMirrorUrl = inputValue;
      setInputValue("");
      setInputError("");
      (document.getElementById("download-mirror-input") as HTMLInputElement | null)?.blur();
    }
    // Invalid URL: Enter is blocked; error message is already visible
  };

  return (
    <section onKeyDownCapture={handleKeyDown}>
      <SubTitle title="Download mirror" />
      <Select
        id="download-mirror-input"
        placeholder="Download mirror for kubectl"
        options={downloadMirrorOptions}
        value={state.downloadMirror}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onMenuOpen={handleMenuOpen}
        isCreatable
        filterOption={() => true}
        isValidNewOption={isValidHttpsUrl}
        formatCreateLabel={(val) => `Use custom: ${val}`}
        onCreateOption={(val) => {
          state.downloadMirror = "custom";
          state.kubectlDownloadMirrorUrl = val || undefined;
        }}
        onChange={(option) => {
          if (!option) {
            state.downloadMirror = defaultPackageMirror;
            state.kubectlDownloadMirrorUrl = undefined;
          } else if (option.value === "custom") {
            state.downloadMirror = "custom";
          } else {
            state.downloadMirror = option.value;
          }
        }}
        isClearable={state.downloadMirror === "custom"}
        isDisabled={!state.downloadKubectlBinaries}
        themeName="lens"
      />
      {inputError && (
        <p style={{ color: "var(--colorError)", fontSize: "var(--font-size-small)", marginTop: 4 }}>{inputError}</p>
      )}
    </section>
  );
});

export const KubectlDownloadMirror = withInjectables<Dependencies>(NonInjectedKubectlDownloadMirror, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
