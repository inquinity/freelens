/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { Input } from "../../../../../../../renderer/components/input";
import { inputValidator } from "../../../../../../../renderer/components/input/input_validators";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";

import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const isHttpsUrl = inputValidator({
  message: () => "Must be a valid HTTPS URL",
  validate: (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  },
});

const NonInjectedKubectlDownloadMirrorUrl = observer(({ state }: Dependencies) => {
  const [mirrorUrl, setMirrorUrl] = useState(state.kubectlDownloadMirrorUrl ?? "");
  const isCustom = state.downloadMirror === "custom";

  const save = () => {
    state.kubectlDownloadMirrorUrl = mirrorUrl || undefined;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
  };

  return (
    <section>
      <SubTitle title="Custom download mirror URL" />
      <Input
        theme="round-black"
        placeholder="Custom URL..."
        value={mirrorUrl}
        validators={mirrorUrl ? isHttpsUrl : undefined}
        onChange={setMirrorUrl}
        onBlur={save}
        onKeyDown={handleKeyDown}
        disabled={!state.downloadKubectlBinaries || !isCustom}
      />
    </section>
  );
});

export const KubectlDownloadMirrorUrl = withInjectables<Dependencies>(NonInjectedKubectlDownloadMirrorUrl, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
