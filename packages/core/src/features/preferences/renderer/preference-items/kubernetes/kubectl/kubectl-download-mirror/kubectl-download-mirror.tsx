/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useRef, useState } from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../../renderer/components/select";
import { defaultPackageMirror, packageMirrors } from "../../../../../../user-preferences/common/preferences-helpers";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";
import "./kubectl-download-mirror.scss";

import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const isValidHttpsUrl = (val: string): boolean => {
  if (/\s/.test(val)) return false;
  try {
    const url = new URL(val);

    return (
      url.protocol === "https:" &&
      url.hostname.length > 1 &&         // rejects "." and single-char nonsense
      !/^\.+$/.test(url.hostname) &&     // rejects dot-only hosts like "."
      !url.username &&                   // rejects embedded credentials
      !url.password
    );
  } catch {
    return false;
  }
};

const NonInjectedKubectlDownloadMirror = observer(({ state }: Dependencies) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const justSelectedRef = useRef(false);

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
    setMenuIsOpen(true);
    if (state.downloadMirror === "custom") {
      setInputValue(state.kubectlDownloadMirrorUrl || "");
    }
  };

  const handleMenuClose = () => {
    setMenuIsOpen(false);
    if (!justSelectedRef.current && inputValue && isValidHttpsUrl(inputValue)) {
      state.downloadMirror = "custom";
      state.kubectlDownloadMirrorUrl = inputValue;
    }
    justSelectedRef.current = false;
    setInputValue("");
    setInputError("");
    setHasSubmitError(false);
  };

  const handleInputChange = (val: string, meta: { action: string }) => {
    if (meta.action === "input-change") {
      setInputValue(val);
      setInputError(val && !isValidHttpsUrl(val) ? "Must be a valid HTTPS URL" : "");
      setHasSubmitError(false);
    } else {
      setInputValue("");
      setInputError("");
      setHasSubmitError(false);
    }
  };

  // react-select v5 calls the onKeyDown prop before its own handler and checks
  // event.defaultPrevented — e.preventDefault() here suppresses its Enter logic.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !inputValue) return;
    e.preventDefault();
    if (isValidHttpsUrl(inputValue)) {
      state.downloadMirror = "custom";
      state.kubectlDownloadMirrorUrl = inputValue;
      setInputValue("");
      setInputError("");
      setHasSubmitError(false);
      setMenuIsOpen(false);
    } else {
      setHasSubmitError(true);
    }
  };

  return (
    <section>
      <SubTitle title="Download mirror" />
      <Select
        id="download-mirror-input"
        placeholder="Download mirror for kubectl"
        options={downloadMirrorOptions}
        value={state.downloadMirror}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        menuIsOpen={menuIsOpen}
        onKeyDown={handleKeyDown}
        isCreatable
        filterOption={() => true}
        isValidNewOption={(val) => isValidHttpsUrl(val) && val !== state.kubectlDownloadMirrorUrl}
        formatCreateLabel={(val) => `Use custom: ${val}`}
        onCreateOption={(val) => {
          state.downloadMirror = "custom";
          state.kubectlDownloadMirrorUrl = val || undefined;
        }}
        onChange={(option) => {
          justSelectedRef.current = true;
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
        className={hasSubmitError ? "download-mirror-error" : undefined}
      />
      {inputError && (
        <p style={{ color: "var(--colorError)", fontSize: "var(--font-size-small)", marginTop: 4 }}>
          {inputError}
        </p>
      )}
    </section>
  );
});

export const KubectlDownloadMirror = withInjectables<Dependencies>(NonInjectedKubectlDownloadMirror, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
