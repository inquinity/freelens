/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useState } from "react";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";
import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";
import { Input, InputValidators } from "../../../../../../../renderer/components/input";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedKubectlDownloadMirrorUrl = observer(({ state }: Dependencies) => {
  const [mirrorUrl, setMirrorUrl] = useState(state.kubectlDownloadMirrorUrl ?? "");
  const urlValidator = mirrorUrl ? InputValidators.isUrl : undefined;

  const save = () => {
    state.kubectlDownloadMirrorUrl = mirrorUrl || undefined;
  };

  return (
    <section>
      <SubTitle title="Custom download mirror URL" />
      <Input
        theme="round-black"
        placeholder="https://mirror.corp/kubernetes/kubectl"
        value={mirrorUrl}
        validators={urlValidator}
        onChange={setMirrorUrl}
        onBlur={save}
        disabled={!state.downloadKubectlBinaries}
      />
      <div className="hint">
        Mirror base URL for downloading kubectl binaries. Overrides the mirror selection above when set.
      </div>
    </section>
  );
});

export const KubectlDownloadMirrorUrl = withInjectables<Dependencies>(NonInjectedKubectlDownloadMirrorUrl, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
